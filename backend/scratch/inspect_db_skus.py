import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product

db = SessionLocal()
try:
    products = db.query(Product).filter(Product.sku == "3123").all()
    print(f"Found {len(products)} products with SKU '3123':")
    for p in products:
        print(f"ID: {p.id} | Bitrix ID: {p.bitrix_id} | Name: {p.name}")
        print(f"  Price: {p.price} | Category: {p.category}")
        print(f"  Description: {p.description}")
        print(f"  Composition: {p.composition}")
        print(f"  Sizes: {p.sizes}")
        print(f"  Image URL: {p.image_url}")
        print(f"  Gallery Images: {p.images}")
        print("-" * 50)
finally:
    db.close()
