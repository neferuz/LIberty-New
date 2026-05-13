from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.db.session import get_db

from app.services.bitrix import bitrix_service

router = APIRouter()

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Fetch categories from Bitrix24 with product counts and first product image"""
    from sqlalchemy import func
    from app.models.product import Product
    
    # Fetch sections from Bitrix
    res = await bitrix_service.get_sections()
    if not res:
        return []
        
    # Get counts and first image from local DB
    subquery = db.query(
        Product.category_id,
        Product.image_url,
        func.row_number().over(partition_by=Product.category_id, order_by=Product.id).label("rn")
    ).subquery()
    
    first_images = db.query(subquery.c.category_id, subquery.c.image_url).filter(subquery.c.rn == 1).all()
    image_map = {img[0]: img[1] for img in first_images}
    
    counts = db.query(Product.category_id, func.count(Product.id)).group_by(Product.category_id).all()
    count_map = {c[0]: c[1] for c in counts}
    
    return [
        {
            'id': s['ID'], 
            'name': s['NAME'],
            'parent_id': s.get('SECTION_ID'),
            'count': count_map.get(int(s['ID']), 0),
            'image': image_map.get(int(s['ID']))
        } for s in res
    ]

@router.get("/categories/tree")
async def get_categories_tree():
    """Fetch categories as a tree structure for navigation"""
    res = await bitrix_service.get_sections()
    if not res:
        return []
        
    # Build tree
    sections_map = {s['ID']: {**s, 'children': []} for s in res}
    tree = []
    
    for s in res:
        sec = sections_map[s['ID']]
        parent_id = s.get('SECTION_ID')
        if parent_id and parent_id in sections_map:
            sections_map[parent_id]['children'].append(sec)
        else:
            tree.append(sec)
            
    return tree

@router.get("/", response_model=List[schemas.product.Product])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
) -> Any:
    """
    Retrieve products.
    """
    products = crud.crud_product.get_multi(db, skip=skip, limit=limit, category_id=category_id)
    return products

@router.post("/", response_model=schemas.product.Product)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: schemas.product.ProductCreate,
) -> Any:
    """
    Create new product.
    """
    product = crud.crud_product.create(db, obj_in=product_in)
    return product

@router.get("/{id}", response_model=schemas.product.Product)
def read_product(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Get product by ID.
    """
    product = crud.crud_product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
