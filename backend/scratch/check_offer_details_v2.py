import asyncio
import sys
from app.services.bitrix import bitrix_service

async def check_raw_offers():
    # 2621 is Bitrix ID for product 171
    offers_res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 2621, 'iblockId': 17},
        'select': ['id', 'iblockId', 'property125', 'property131', 'property49', 'detailPicture', 'previewPicture']
    })
    print("=== RAW OFFERS FROM BITRIX (V2) ===")
    offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
    for o in offers[:5]:
        print(f"Offer ID: {o.get('id')}")
        print(f"  property125 (Color): {o.get('property125')}")
        print(f"  property131 (Size): {o.get('property131')}")
        print(f"  property49: {o.get('property49')}")
        print(f"  detailPicture: {o.get('detailPicture')}")
        print(f"  previewPicture: {o.get('previewPicture')}")
        print("-" * 40)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_raw_offers())
