import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product

db = SessionLocal()
try:
    p = db.query(Product).filter(Product.bitrix_id == 699).first()
    if p:
        print(f"ID: {p.id} | Bitrix ID: {p.bitrix_id} | Name: '{p.name}' | SKU: '{p.sku}' | Img: {p.image_url}")
        print(f"Sizes: {p.sizes}")
        print(f"Images: {p.images}")
    else:
        print("Product 699 not found in local DB")
finally:
    db.close()
