import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product

db = SessionLocal()
try:
    total = db.query(Product).count()
    with_sizes = db.query(Product).filter(Product.sizes.isnot(None)).count()
    with_composition = db.query(Product).filter(Product.composition.isnot(None)).count()
    
    print(f"Total products in SQLite: {total}")
    print(f"Products with sizes: {with_sizes}")
    print(f"Products with composition: {with_composition}")
    
    # Let's inspect some names and check if color is mentioned in the name
    print("\nSample names:")
    samples = db.query(Product).limit(20).all()
    for s in samples:
        print(f"ID: {s.id} | Name: '{s.name}' | SKU: '{s.sku}' | Bitrix ID: {s.bitrix_id}")
finally:
    db.close()
