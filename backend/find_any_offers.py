import asyncio
from app.services.bitrix import bitrix_service
from app.db.session import SessionLocal
from app.models.product import Product

async def find_any_with_offers():
    db = SessionLocal()
    products = db.query(Product).all()
    for p in products:
        offers = await bitrix_service._call('catalog.product.offer.list', {
            'filter': {'parentId': p.bitrix_id, 'iblockId': 17},
            'select': ['id', 'iblockId']
        })
        if offers.get('offers'):
            print(f"FOUND: Product {p.id} (Bitrix {p.bitrix_id}) has {len(offers['offers'])} offers")
            return
    db.close()

if __name__ == "__main__":
    asyncio.run(find_any_with_offers())
