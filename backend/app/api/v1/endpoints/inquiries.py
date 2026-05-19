from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inquiry import ContactInquiry
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class InquiryOut(BaseModel):
    id: int
    name: str
    email: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=InquiryOut)
def create_inquiry(inquiry_in: InquiryCreate, db: Session = Depends(get_db)):
    db_obj = ContactInquiry(
        name=inquiry_in.name,
        email=inquiry_in.email,
        message=inquiry_in.message
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("", response_model=List[InquiryOut])
def list_inquiries(db: Session = Depends(get_db)):
    return db.query(ContactInquiry).order_by(ContactInquiry.created_at.desc()).all()

@router.put("/{inquiry_id}/status")
def update_inquiry_status(inquiry_id: int, status_val: str, db: Session = Depends(get_db)):
    db_obj = db.query(ContactInquiry).filter(ContactInquiry.id == inquiry_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    db_obj.status = status_val
    db.commit()
    return {"status": "ok"}
