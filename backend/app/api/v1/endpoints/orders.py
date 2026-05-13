from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import models, schemas
from app.db.session import get_db
from app.api import deps
from app.services.bitrix import bitrix_service

router = APIRouter()

class CartItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class CreateOrderRequest(BaseModel):
    user_id: Optional[int] = None
    email: str
    phone: Optional[str] = None
    items: List[CartItem]

class UpdatePaymentRequest(BaseModel):
    deal_id: int
    status: str # "paid" or "failed"

from typing import Optional

@router.post("/create-deal")
async def create_deal_on_cart(
    *,
    db: Session = Depends(get_db),
    order_in: CreateOrderRequest,
) -> Any:
    """
    Create a deal in Bitrix24 when user adds items to cart or starts checkout.
    """
    # 1. Find or Create contact in Bitrix
    bitrix_contact_id = None
    user = None
    
    if order_in.user_id:
        user = db.query(models.user.User).filter(models.user.User.id == order_in.user_id).first()
        if user and user.bitrix_contact_id:
            bitrix_contact_id = user.bitrix_contact_id
            
    if not bitrix_contact_id:
        # Search by email/phone
        contact = await bitrix_service.find_contact_by_email_or_phone(email=order_in.email, phone=order_in.phone)
        if contact:
            bitrix_contact_id = int(contact["ID"])
        else:
            # Create temporary contact if not found
            names = ["Гость", "Сайта"]
            bitrix_id = await bitrix_service.create_contact({
                "NAME": names[0],
                "LAST_NAME": names[1],
                "EMAIL": [{"VALUE": order_in.email, "VALUE_TYPE": "WORK"}],
                "PHONE": [{"VALUE": order_in.phone, "VALUE_TYPE": "WORK"}] if order_in.phone else [],
                "SOURCE_ID": "WEB"
            })
            bitrix_contact_id = bitrix_id

    # 2. Create Deal
    deal_fields = {
        "TITLE": f"Заказ с сайта ({order_in.email})",
        "CONTACT_ID": bitrix_contact_id,
        "CURRENCY_ID": "UZS",
        "OPPORTUNITY": sum(item.price * item.quantity for item in order_in.items),
        "CATEGORY_ID": 0, # Default category
        "STAGE_ID": "NEW", # Initial stage
    }
    
    deal_id = await bitrix_service.create_deal(deal_fields)
    
    if not deal_id:
        raise HTTPException(status_code=500, detail="Не удалось создать сделку в Bitrix24")

    # 3. Add products to deal
    product_rows = []
    for item in order_in.items:
        # Try to find bitrix_id for this product
        product = db.query(models.product.Product).filter(models.product.Product.id == item.product_id).first()
        product_rows.append({
            "PRODUCT_ID": product.bitrix_id if (product and product.bitrix_id) else 0,
            "PRODUCT_NAME": product.name if product else "Unknown Product",
            "PRICE": item.price,
            "QUANTITY": item.quantity
        })
        
    await bitrix_service.set_deal_products(deal_id, product_rows)
    
    return {"deal_id": deal_id, "status": "created"}

@router.post("/payment-callback")
async def payment_callback(
    *,
    db: Session = Depends(get_db),
    payment_in: UpdatePaymentRequest,
) -> Any:
    """
    Update deal stage in Bitrix24 after payment.
    """
    if payment_in.status == "paid":
        # WIN is usually the 'Paid/Won' stage in Bitrix24
        await bitrix_service.update_deal_stage(payment_in.deal_id, "WON")
        return {"status": "updated", "stage": "WON"}
    else:
        # APOLOGY or similar for failed payment
        await bitrix_service.update_deal_stage(payment_in.deal_id, "LOSE")
        return {"status": "updated", "stage": "LOSE"}
