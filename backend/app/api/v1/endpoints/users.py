from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.security import get_password_hash
from app.db.session import get_db

from app.services.bitrix import bitrix_service

router = APIRouter()

@router.get("/", response_model=List[schemas.user.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users (Staff).
    """
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=schemas.user.User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.user.UserCreate,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new staff user.
    """
    user = db.query(models.user.User).filter(models.user.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    db_obj = models.user.User(
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/register", response_model=schemas.user.User)
async def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.user.UserCreate,
) -> Any:
    """
    Public registration with Bitrix24 sync.
    """
    # 1. Check if user already exists in our DB
    user = db.query(models.user.User).filter(models.user.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким email уже зарегистрирован.",
        )
    
    # 2. Sync with Bitrix24
    bitrix_id = None
    try:
        # Search for existing contact in Bitrix
        contact = await bitrix_service.find_contact_by_email_or_phone(
            email=user_in.email, 
            phone=user_in.phone
        )
        
        if contact:
            bitrix_id = int(contact["ID"])
            # Add event to timeline
            await bitrix_service.add_timeline_event(
                entity_id=bitrix_id,
                entity_type="CONTACT",
                message=f"Пользователь зарегистрировался на сайте Liberty Wear. Email: {user_in.email}"
            )
        else:
            # Create new contact in Bitrix
            names = user_in.full_name.split(" ", 1) if user_in.full_name else ["Пользователь", "Сайта"]
            first_name = names[0]
            last_name = names[1] if len(names) > 1 else ""
            
            bitrix_id = await bitrix_service.create_contact({
                "NAME": first_name,
                "LAST_NAME": last_name,
                "EMAIL": [{"VALUE": user_in.email, "VALUE_TYPE": "WORK"}],
                "PHONE": [{"VALUE": user_in.phone, "VALUE_TYPE": "WORK"}] if user_in.phone else [],
                "TYPE_ID": "CLIENT",
                "SOURCE_ID": "WEB"
            })
    except Exception as e:
        print(f"Bitrix sync error: {str(e)}")
        # We continue even if Bitrix fails, to not block user registration
    
    # 3. Create user in our DB
    db_obj = models.user.User(
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="customer", # Default role for public registration
        bitrix_contact_id=bitrix_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
