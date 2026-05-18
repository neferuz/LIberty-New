import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product

db = SessionLocal()
try:
    products = db.query(Product).filter(Product.sizes.isnot(None)).limit(20).all()
    print(f"Sample products with sizes:")
    for p in products:
        print(f"ID: {p.id} | Name: '{p.name}' | SKU: '{p.sku}' | Sizes: '{p.sizes}' | Composition: '{p.composition}'")
finally:
    db.close()
