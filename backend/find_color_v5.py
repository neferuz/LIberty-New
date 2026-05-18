import asyncio
from app.services.bitrix import bitrix_service

async def find_color_v5():
    o_id = 713
    print(f"Searching for Offer ID: {o_id} in crm.product.list")
    
    res = await bitrix_service._call('crm.product.list', {
        'filter': {'ID': o_id}
    })
    
    if res:
        print(f"Data: {res}")
    else:
        print("Not found in crm.product.list")

if __name__ == "__main__":
    asyncio.run(find_color_v5())
