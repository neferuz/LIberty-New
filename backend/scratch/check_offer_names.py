import asyncio
from app.services.bitrix import bitrix_service

async def check_names():
    # 2621 is Miami Beach Shorts (ID 171)
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 2621, 'iblockId': 17},
        'select': ['id', 'name', 'property125', 'property131']
    })
    offers = res.get('offers', []) if isinstance(res, dict) else []
    print("=== ENTIRE OFFERS AND THEIR NAMES ===")
    for o in offers[:5]:
        print(f"Offer ID: {o.get('id')}")
        print(f"  Name: {o.get('name')}")
        print(f"  property125 (Color Hash): {o.get('property125')}")
        print(f"  property131 (Size): {o.get('property131')}")
        print("-" * 40)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_names())
