from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ProductBase(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    bitrix_id: Optional[int] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = 0
    category: Optional[str] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[str] = None
    is_active: Optional[bool] = True
    is_archived: Optional[bool] = False

class ProductCreate(ProductBase):
    name: str
    sku: str
    price: float

class ProductUpdate(ProductBase):
    pass

class ProductInDBBase(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Product(ProductInDBBase):
    sizes: Optional[str] = None
    composition: Optional[str] = None
    variants: Optional[list] = None
    characteristics: Optional[dict] = None
