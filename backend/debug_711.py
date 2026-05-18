import asyncio
from app.services.bitrix import bitrix_service

async def debug_711():
    p_id = 711
    print(f"DEBUGGING ID: {p_id}")
    
    # 1. Offers
    offers = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': p_id, 'iblockId': 17},
        'select': ['id', 'iblockId']
    })
    print(f"Offers: {offers}")
    
    # 2. Images for product
    res = await bitrix_service._call('catalog.productImage.list', {'productId': p_id})
    print(f"Product Images: {res}")
    
    if offers.get('offers'):
        for o in offers['offers']:
            o_res = await bitrix_service._call('catalog.productImage.list', {'productId': o['id']})
            print(f"Offer {o['id']} Images: {o_res}")

if __name__ == "__main__":
    asyncio.run(debug_711())
