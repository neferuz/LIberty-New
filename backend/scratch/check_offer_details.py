import asyncio
import sys
from app.services.bitrix import bitrix_service

async def check_raw_offers():
    # 2621 is Bitrix ID for product 171
    offers_res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 2621, 'iblockId': 17},
        'select': ['*'] # Fetch all properties!
    })
    print("=== RAW OFFERS FROM BITRIX ===")
    offers = offers_res.get('offers', [])
    for o in offers[:3]: # Let's see the first 3
        print(f"Offer ID: {o.get('id')}")
        print(f"  property125 (Color): {o.get('property125')}")
        print(f"  property131 (Size): {o.get('property131')}")
        # Print all keys that look like images or pictures
        img_keys = [k for k in o.keys() if 'image' in k.lower() or 'pic' in k.lower() or 'prop' in k.lower()]
        for k in img_keys:
            val = o.get(k)
            if val:
                print(f"  {k}: {val}")
        print("-" * 40)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_raw_offers())
