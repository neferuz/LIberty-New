import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_offer_details(offer_id: int):
    print(f"Fetching details for offer ID {offer_id} using catalog.product.get...")
    res = await bitrix_service._call('catalog.product.get', {'id': offer_id})
    if res and 'product' in res:
        product = res['product']
        print("\n--- OFFER PRODUCT FIELDS ---")
        for k, v in sorted(product.items()):
            if v:
                print(f"{k}: {v}")
    else:
        print(f"Failed or returned: {res}")

if __name__ == "__main__":
    # Let's inspect offer ID 789 (which is an offer of product 787 / SKU 3123)
    asyncio.run(inspect_offer_details(789))
