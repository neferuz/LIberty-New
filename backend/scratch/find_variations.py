import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from collections import defaultdict

db = SessionLocal()
try:
    products = db.query(Product).all()
    # Let's group products by their base name (e.g. first 2-3 words) to see if there are color variants
    groups = defaultdict(list)
    for p in products:
        words = p.name.split()
        if len(words) > 1:
            # Join first 2 words as a potential base name
            base = " ".join(words[:2])
            groups[base].append(p)
            
    print("Potential color/variation groups found:")
    count = 0
    for base, items in groups.items():
        if len(items) > 1:
            # Check if names are actually different (indicating variations)
            names = {item.name for item in items}
            if len(names) > 1:
                count += 1
                print(f"\nGroup '{base}' ({len(items)} items):")
                for item in items:
                    print(f"  ID: {item.id} | SKU: '{item.sku}' | Name: '{item.name}' | Img: '{item.image_url[:60] if item.image_url else 'None'}...'")
                if count >= 10:
                    break
finally:
    db.close()
