import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product

db = SessionLocal()
try:
    products = db.query(Product).filter(Product.name.like("%свитшот%")).all()
    print(f"Found {len(products)} sweatshirts:")
    for p in products:
        print(f"ID: {p.id} | Bitrix ID: {p.bitrix_id} | Name: '{p.name}' | SKU: '{p.sku}' | Img: {p.image_url[:50] if p.image_url else 'None'}")
finally:
    db.close()
