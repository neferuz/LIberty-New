import sqlite3
import asyncio
from app.services.bitrix import bitrix_service

async def scan_colors():
    conn = sqlite3.connect("liberty_wear.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, bitrix_id FROM products WHERE bitrix_id IS NOT NULL;")
    products = cursor.fetchall()
    conn.close()
    
    print(f"Loaded {len(products)} products. Scanning offers in Bitrix24...")
    
    unique_hashes = set()
    product_colors = {}
    
    # Process products
    for idx, (p_id, name, bitrix_id) in enumerate(products):
        try:
            # Query with the exact verified select fields
            offers_res = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId', 'property125', 'property131']
            })
            offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
            
            p_hashes = set()
            for o in offers:
                color_val = o.get('property125')
                color_hash = None
                if isinstance(color_val, dict):
                    color_hash = color_val.get('value')
                elif color_val:
                    color_hash = str(color_val)
                
                if color_hash:
                    unique_hashes.add(color_hash)
                    p_hashes.add(color_hash)
            
            if p_hashes:
                product_colors[name] = list(p_hashes)
                print(f"  [{idx}/{len(products)}] Product '{name}' has hashes: {list(p_hashes)}")
                
        except Exception as e:
            print(f"  [{idx}/{len(products)}] Error for '{name}' (bitrix_id={bitrix_id}): {e}")
            
    print("\n=== SCAN COMPLETE ===")
    print(f"Total unique color hashes found: {len(unique_hashes)}")
    print("Unique hashes:")
    for h in sorted(list(unique_hashes)):
        print(f"  - '{h}'")
        
    print("\nAll Products and their color hashes:")
    for p_name, hashes in product_colors.items():
        print(f"  Product: '{p_name}' -> Hashes: {hashes}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(scan_colors())
