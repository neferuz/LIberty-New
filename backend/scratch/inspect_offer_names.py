import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_offer_names():
    # Fetch offers for product 174 with more select fields
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 2685, 'iblockId': 17},
        'select': ['id', 'iblockId', 'name', 'property125', 'property131']
    })
    
    offers = res.get('offers', []) if isinstance(res, dict) else []
    print(f"=== OFFERS FOR PRODUCT 174 (Bitrix ID 2685) ===")
    print(f"Found {len(offers)} offers:")
    for o in offers:
        print(f"\nID: {o.get('id')}")
        print(f"  Name/Fields: {o}")
        
if __name__ == "__main__":
    asyncio.run(inspect_offer_names())
