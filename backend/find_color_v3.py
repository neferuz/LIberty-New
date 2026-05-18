import asyncio
from app.services.bitrix import bitrix_service

async def find_color_v3():
    p_id = 711
    print(f"Fetching offers for Product ID: {p_id}")
    
    # Correct select with properties
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': p_id, 'iblockId': 17},
        'select': ['id', 'iblockId', 'name', 'property*']
    })
    
    if res.get('offers'):
        for offer in res['offers']:
            print(f"\n--- Offer ID: {offer['id']} ({offer.get('name')}) ---")
            # Print all properties
            for k, v in offer.items():
                if k.startswith('property'):
                    print(f"{k}: {v}")

if __name__ == "__main__":
    asyncio.run(find_color_v3())
