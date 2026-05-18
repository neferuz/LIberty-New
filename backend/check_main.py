import asyncio
from app.services.bitrix import bitrix_service

async def check_main_product():
    p_id = 711
    print(f"Calling catalog.product.get for Main Product ID: {p_id}")
    
    res = await bitrix_service._call('catalog.product.get', {
        'id': p_id
    })
    
    if res:
        p = res.get('product', {})
        for k, v in p.items():
            if 'property' in k:
                print(f"{k}: {v}")
    else:
        print("Not found")

if __name__ == "__main__":
    asyncio.run(check_main_product())
