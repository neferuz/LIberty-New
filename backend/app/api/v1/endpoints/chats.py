from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.chat import ChatMessage
from app.models.user import User
from app.api import deps
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()

class MessageCreate(BaseModel):
    content: str
    session_id: str
    sender_id: int | None = None

class MessageOut(BaseModel):
    id: int
    content: str
    is_admin: bool
    is_read: bool
    created_at: datetime
    sender_id: int | None
    session_id: str

    class Config:
        from_attributes = True

@router.post("/", response_model=MessageOut)
def send_message(
    msg_in: MessageCreate, 
    db: Session = Depends(get_db)
):
    db_obj = ChatMessage(
        content=msg_in.content,
        session_id=msg_in.session_id,
        sender_id=msg_in.sender_id,
        is_admin=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{session_id}", response_model=List[MessageOut])
def get_messages(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    for m in messages:
        if m.created_at.tzinfo is None:
            m.created_at = m.created_at.replace(tzinfo=timezone.utc)
    return messages

@router.get("/admin/list")
def list_active_chats(db: Session = Depends(get_db)):
    # Get all unique sessions
    sessions = db.query(ChatMessage.session_id).distinct().all()
    
    chat_list = []
    for (sess_id,) in sessions:
        # Get the latest message for this session to show in the list
        last_msg = db.query(ChatMessage).filter(ChatMessage.session_id == sess_id).order_by(ChatMessage.created_at.desc()).first()
        
        # Get the customer info (the first message from this session that has a sender_id)
        # Assuming sender_id is only set for customers in this context
        customer_msg = db.query(ChatMessage).filter(
            ChatMessage.session_id == sess_id,
            ChatMessage.sender_id.isnot(None),
            ChatMessage.is_admin == False
        ).first()
        
        # Look for the guest contact details message in this session
        contact_msg = db.query(ChatMessage).filter(
            ChatMessage.session_id == sess_id,
            ChatMessage.content.like("[Контакты]%")
        ).first()
        
        user_name = "Гость"
        user_email = "Не авторизован"
        
        if contact_msg:
            try:
                content = contact_msg.content
                import re
                name_match = re.search(r"Имя:\s*([^,]+)", content)
                phone_match = re.search(r"Телефон:\s*([^,]+)", content)
                email_match = re.search(r"Email:\s*([^,]+)", content)
                
                parsed_name = name_match.group(1).strip() if name_match else ""
                parsed_phone = phone_match.group(1).strip() if phone_match else ""
                parsed_email = email_match.group(1).strip() if email_match else ""
                
                if parsed_name:
                    user_name = parsed_name
                
                email_parts = []
                if parsed_email:
                    email_parts.append(parsed_email)
                if parsed_phone:
                    email_parts.append(parsed_phone)
                if email_parts:
                    user_email = " | ".join(email_parts)
            except Exception:
                pass
        elif customer_msg:
            user = db.query(User).filter(User.id == customer_msg.sender_id).first()
            if user:
                user_name = user.full_name
                user_email = user.email
                
        chat_list.append({
            "session_id": sess_id,
            "last_message": last_msg.content if last_msg else "",
            "created_at": last_msg.created_at.replace(tzinfo=timezone.utc) if last_msg else datetime.now(timezone.utc),
            "user_name": user_name,
            "user_email": user_email
        })
    
    # Sort by latest message date
    chat_list.sort(key=lambda x: x["created_at"], reverse=True)
    return chat_list

@router.post("/admin/reply")
def admin_reply(
    session_id: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_obj = ChatMessage(
        content=content,
        session_id=session_id,
        sender_id=current_user.id,
        is_admin=True
    )
    db.add(db_obj)
    db.commit()
    return {"status": "ok"}
