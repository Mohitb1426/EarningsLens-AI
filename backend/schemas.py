from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# User schemas
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# Message schemas
class MessageBase(BaseModel):
    role: str
    content: str


class MessageCreate(MessageBase):
    conversation_id: str
    citations: Optional[dict] = None
    chart_data: Optional[dict] = None


class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    citations: Optional[dict] = None
    chart_data: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Conversation schemas
class ConversationBase(BaseModel):
    title: str


class ConversationCreate(ConversationBase):
    user_id: str


class ConversationResponse(ConversationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationResponse):
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
