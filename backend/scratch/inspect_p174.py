import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def inspect_p174():
    db = SessionLocal()
    try:
        p = db.query(Product).filter(Product.id == 174).first()
        if not p:
            print("Product 174 not found in database!")
            return
        
        print(f"=== DATABASE RECORD FOR PRODUCT 174 ===")
        print(f"ID: {p.id}")
        print(f"Name: {p.name}")
        print(f"SKU: {p.sku}")
        print(f"Bitrix ID: {p.bitrix_id}")
        print(f"Sizes (DB): {p.sizes}")
        print(f"Category: {p.category} | Category ID: {p.category_id}")
        
        if p.bitrix_id:
            print(f"\n=== FETCHING RAW PRODUCT FROM BITRIX24 ===")
            p_data = await bitrix_service._call('crm.product.get', {'id': p.bitrix_id})
            import pprint
            pprint.pprint(p_data)
            
            print(f"\n=== FETCHING OFFERS FROM BITRIX24 ===")
            offers_res = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': p.bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId', 'property125', 'property131']
            })
            pprint.pprint(offers_res)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(inspect_p174())
