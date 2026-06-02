from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct:
    def get(self, db: Session, id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == id).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100, 
        category_id: Optional[int] = None,
        include_inactive: bool = False,
        include_archived: bool = False
    ) -> List[Product]:
        query = db.query(Product)
        if not include_inactive:
            query = query.filter(Product.is_active == True)
        if not include_archived:
            query = query.filter(Product.is_archived == False)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        return query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: ProductCreate) -> Product:
        db_obj = Product(
            name=obj_in.name,
            sku=obj_in.sku,
            description=obj_in.description,
            price=obj_in.price,
            stock=obj_in.stock,
            category=obj_in.category,
            category_id=obj_in.category_id,
            image_url=obj_in.image_url,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Product, obj_in: ProductUpdate) -> Product:
        obj_data = db_obj.__dict__
        update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Product:
        obj = db.query(Product).get(id)
        db.delete(obj)
        db.commit()
        return obj

product = CRUDProduct()
