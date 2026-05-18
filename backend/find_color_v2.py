import asyncio
from app.services.bitrix import bitrix_service

async def find_color_v2():
    p_id = 711
    print(f"Fetching offers for Product ID: {p_id}")
    
    # Try to get all fields for offers
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': p_id, 'iblockId': 17}
    })
    
    if res.get('offers'):
        first_offer = res['offers'][0]
        print(f"First offer data: {first_offer}")
        
        # Look for properties in the keys
        props = [k for k in first_offer.keys() if k.startswith('property')]
        print(f"Found property keys: {props}")
        
        for p in props:
            print(f"{p}: {first_offer[p]}")

if __name__ == "__main__":
    asyncio.run(find_color_v2())
