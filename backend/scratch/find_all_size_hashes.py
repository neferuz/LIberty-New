import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def find_all_size_hashes():
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.bitrix_id.isnot(None)).all()
        print(f"Scanning {len(products)} products for offer size hashes...")
        
        all_size_hashes = {}
        
        # Limit concurrency
        semaphore = asyncio.Semaphore(5)
        
        async def fetch_product_sizes(p):
            async with semaphore:
                try:
                    offers_res = await bitrix_service._call('catalog.product.offer.list', {
                        'filter': {'parentId': p.bitrix_id, 'iblockId': 17},
                        'select': ['id', 'property131']
                    })
                    offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
                    
                    sizes_found = []
                    for o in offers:
                        size_val = o.get('property131')
                        size_hash = None
                        if isinstance(size_val, dict):
                            size_hash = size_val.get('value')
                        elif size_val:
                            size_hash = str(size_val)
                        if size_hash and size_hash not in sizes_found:
                            sizes_found.append(size_hash)
                            
                    return p.id, p.name, p.category, p.sku, sizes_found
                except Exception as e:
                    return p.id, p.name, p.category, p.sku, []

        tasks = [fetch_product_sizes(p) for p in products]
        results = await asyncio.gather(*tasks)
        
        for pid, name, cat, sku, hashes in results:
            if hashes:
                for h in hashes:
                    all_size_hashes.setdefault(h, []).append({
                        "id": pid,
                        "name": name,
                        "category": cat,
                        "sku": sku
                    })
                    
        print("\n=== SCAN RESULTS: ALL UNIQUE SIZE HASHES ===")
        print(f"Found {len(all_size_hashes)} unique size hashes in the catalog:\n")
        
        for h, prs in sorted(all_size_hashes.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"Hash: '{h}'")
            print(f"  Used by {len(prs)} products. Sample products:")
            for p in prs[:3]:
                print(f"    - ID: {p['id']} | Name: '{p['name']}' | SKU: '{p['sku']}' | Cat: '{p['category']}'")
            print("-" * 50)
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(find_all_size_hashes())
