from sqlalchemy.orm import Session
from sqlalchemy import desc
import models
import auth


# User CRUD
def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, email: str, password: str):
    """Create a new user"""
    hashed_password = auth.get_password_hash(password)
    db_user = models.User(
        email=email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Conversation CRUD
def create_conversation(db: Session, user_id: str, title: str):
    """Create a new conversation"""
    db_conversation = models.Conversation(
        user_id=user_id,
        title=title
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_user_conversations(db: Session, user_id: str, skip: int = 0, limit: int = 50):
    """Get all conversations for a user"""
    return db.query(models.Conversation).filter(
        models.Conversation.user_id == user_id
    ).order_by(
        desc(models.Conversation.created_at)
    ).offset(skip).limit(limit).all()


def get_conversation(db: Session, conversation_id: str, user_id: str):
    """Get a specific conversation (with user ownership check)"""
    return db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == user_id
    ).first()


def get_conversation_by_id(db: Session, conversation_id: str):
    """Get conversation by ID (no ownership check)"""
    return db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).first()


# Message CRUD
def create_message(db: Session, conversation_id: str, role: str, content: str, citations: dict = None, chart_data: dict = None):
    """Create a new message"""
    db_message = models.Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        citations=citations,
        chart_data=chart_data
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_conversation_messages(db: Session, conversation_id: str):
    """Get all messages for a conversation"""
    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(
        models.Message.created_at
    ).all()
