from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import json
import asyncio
from datetime import datetime, timedelta
import uuid

from rag_service import RAGService
from database import engine, get_db
from dependencies import get_current_user, oauth2_scheme
import models
import crud
import auth
import schemas

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EarningsLens AI", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG
rag_service = RAGService()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/")
async def root():
    return {"status": "running", "message": "EarningsLens AI Backend"}


@app.post("/api/auth/register", response_model=schemas.Token)
async def register(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = crud.get_user_by_email(db, email=form_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = crud.create_user(db, email=form_data.username, password=form_data.password)

    # Create access token
    access_token = auth.create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user"""
    # Get user
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = auth.create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat endpoint with PostgreSQL persistence"""
    async def generate():
        try:
            # Get or create conversation
            if request.conversation_id:
                conversation = crud.get_conversation(db, request.conversation_id, current_user.id)
                if not conversation:
                    raise HTTPException(status_code=404, detail="Conversation not found")
                conv_id = conversation.id
            else:
                # Create new conversation
                conversation = crud.create_conversation(
                    db,
                    user_id=current_user.id,
                    title=request.message[:50]
                )
                conv_id = conversation.id

            yield f"data: {json.dumps({'type': 'conversation_id', 'conversationId': conv_id})}\n\n"

            # Save user message to database
            crud.create_message(
                db,
                conversation_id=conv_id,
                role="user",
                content=request.message
            )

            full_response = ""
            citations = []

            # Stream RAG response (unchanged logic)
            async for chunk in rag_service.process_query(request.message):
                if chunk["type"] == "token":
                    full_response += chunk["data"]
                    yield f"data: {json.dumps({'type': 'token', 'token': chunk['data']})}\n\n"
                    await asyncio.sleep(0.01)

                elif chunk["type"] == "citations":
                    citations = chunk["data"]
                    yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"

            # Save assistant message to database
            crud.create_message(
                db,
                conversation_id=conv_id,
                role="assistant",
                content=full_response,
                citations=citations
            )

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            print(f"Error: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )


@app.get("/api/conversations")
async def get_conversations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user"""
    conversations_list = crud.get_user_conversations(db, current_user.id)

    return [
        {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
            "message_count": len(conv.messages)
        }
        for conv in conversations_list
    ]


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Not found")
    return conversations[conversation_id]


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print("\n" + "="*50)
    print("EarningsLens AI Backend")
    print("="*50)
    print(f"Port: {port}")
    print(f"Frontend: http://localhost:5174")
    print("="*50 + "\n")

    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
