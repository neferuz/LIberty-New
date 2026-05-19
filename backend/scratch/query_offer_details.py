import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def query_offer_details():
    db = SessionLocal()
    try:
        # 1. Inspect 'Комбинезон "Funny"'
        p1 = db.query(Product).filter(Product.name.like("%Funny%")).first()
        if p1:
            print(f"=== OFFERS FOR '{p1.name}' (Bitrix ID: {p1.bitrix_id}) ===")
            res = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': p1.bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId', 'name', 'property125', 'property131']
            })
            offers = res.get('offers', []) if isinstance(res, dict) else []
            for o in offers:
                print(f"Offer ID: {o.get('id')} | Name: '{o.get('name')}'")
                print(f"  Color (property125): {o.get('property125')}")
                print(f"  Size (property131): {o.get('property131')}")
                
        # 2. Inspect 'Комплект-тройка Panda Baby'
        p2 = db.query(Product).filter(Product.name.like("%Panda%")).first()
        if p2:
            print(f"\n=== OFFERS FOR '{p2.name}' (Bitrix ID: {p2.bitrix_id}) ===")
            res = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': p2.bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId', 'name', 'property125', 'property131']
            })
            offers = res.get('offers', []) if isinstance(res, dict) else []
            for o in offers:
                print(f"Offer ID: {o.get('id')} | Name: '{o.get('name')}'")
                print(f"  Color (property125): {o.get('property125')}")
                print(f"  Size (property131): {o.get('property131')}")
                
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(query_offer_details())
