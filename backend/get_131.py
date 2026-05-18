import asyncio
from app.services.bitrix import bitrix_service

async def get_direct_prop():
    print("Calling crm.product.property.get for ID 131...")
    try:
        res = await bitrix_service._call('crm.product.property.get', {'id': 131})
        print(f"Result: {res}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(get_direct_prop())
