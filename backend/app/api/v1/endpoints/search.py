from typing import Any, List, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.models.inquiry import ContactInquiry
from app.api import deps

router = APIRouter()

@router.get("/")
def global_search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    results = []

    # Search Products
    products = db.query(Product).filter(
        or_(
            Product.name.ilike(f"%{q}%"),
            Product.sku.ilike(f"%{q}%")
        )
    ).limit(5).all()
    for p in products:
        results.append({
            "type": "product",
            "id": p.id,
            "title": p.name,
            "subtitle": f"SKU: {p.sku}",
            "href": f"/products"
        })

    # Search Customers
    customers = db.query(User).filter(
        or_(
            User.full_name.ilike(f"%{q}%"),
            User.email.ilike(f"%{q}%"),
            User.phone.ilike(f"%{q}%")
        )
    ).limit(5).all()
    for c in customers:
        results.append({
            "type": "customer",
            "id": c.id,
            "title": c.full_name,
            "subtitle": c.email or c.phone,
            "href": f"/customers"
        })

    # Search Inquiries (Заявки)
    inquiries = db.query(ContactInquiry).filter(
        or_(
            ContactInquiry.name.ilike(f"%{q}%"),
            ContactInquiry.email.ilike(f"%{q}%"),
            ContactInquiry.message.ilike(f"%{q}%")
        )
    ).limit(5).all()
    for i in inquiries:
        results.append({
            "type": "order", # Using 'order' type icon for inquiries for now
            "id": i.id,
            "title": f"Заявка от {i.name}",
            "subtitle": i.email,
            "href": f"/inquiries"
        })

    return results
