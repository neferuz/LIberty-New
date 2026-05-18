import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_offer_fields():
    # Product 787
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 787, 'iblockId': 17}
    })
    offers = res.get('offers', [])
    if offers:
        print(f"Found {len(offers)} offers")
        print("\n--- SAMPLE OFFER ALL FIELDS ---")
        first_offer = offers[0]
        for k, v in sorted(first_offer.items()):
            print(f"{k}: {v}")
    else:
        print("No offers found")

if __name__ == "__main__":
    asyncio.run(inspect_offer_fields())
