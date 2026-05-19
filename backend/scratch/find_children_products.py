import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def find_children_products():
    db = SessionLocal()
    try:
        # Children's categories list
        children_cats = [31, 33, 27, 29, 35, 37, 61, 63, 41, 65, 39, 43]
        
        # Search for children's products
        products = db.query(Product).filter(
            (Product.category_id.in_(children_cats)) |
            (Product.name.like("%детск%")) | 
            (Product.name.like("%ясельк%"))
        ).all()
        
        print(f"Found {len(products)} children/baby products in database.")
        
        all_sizes_mapping = {}
        
        # Limit concurrency
        semaphore = asyncio.Semaphore(4)
        
        async def scan_product(p):
            async with semaphore:
                if not p.bitrix_id:
                    return []
                try:
                    res = await bitrix_service._call('catalog.product.offer.list', {
                        'filter': {'parentId': p.bitrix_id, 'iblockId': 17},
                        'select': ['id', 'iblockId', 'property125', 'property131']
                    })
                    offers = res.get('offers', []) if isinstance(res, dict) else []
                    
                    p_sizes = []
                    for o in offers:
                        size_val = o.get('property131')
                        size_hash = None
                        if isinstance(size_val, dict):
                            size_hash = size_val.get('value')
                        elif size_val:
                            size_hash = str(size_val)
                        if size_hash and size_hash not in p_sizes:
                            p_sizes.append(size_hash)
                    return p_sizes
                except Exception:
                    return []

        tasks = [scan_product(p) for p in products]
        results = await asyncio.gather(*tasks)
        
        unique_hashes = set()
        for res in results:
            for h in res:
                unique_hashes.add(h)
                
        print(f"\n=== UNIQUE HASHES FOUND IN KIDS/TODDLERS PRODUCTS ({len(unique_hashes)}) ===")
        for h in sorted(unique_hashes):
            # Find a product that uses it
            using_product = None
            for idx, p in enumerate(products):
                if h in results[idx]:
                    using_product = p
                    break
            prod_info = f"'{using_product.name}' (SKU: {using_product.sku}, Category ID: {using_product.category_id})" if using_product else "Unknown"
            print(f"Hash: '{h}' | Used in e.g.: {prod_info}")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(find_children_products())
