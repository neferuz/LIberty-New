import asyncio
from app.services.bitrix import bitrix_service

async def find_color_v6():
    o_id = 713
    print(f"Calling catalog.product.get for ID: {o_id}")
    
    res = await bitrix_service._call('catalog.product.get', {
        'id': o_id
    })
    
    if res:
        print(f"Product Data: {res}")
    else:
        print("Not found")

if __name__ == "__main__":
    asyncio.run(find_color_v6())
