import asyncio
from app.services.bitrix import bitrix_service

async def test_endpoints():
    endpoints = [
        'catalog.directory.list',
        'catalog.propertyDirectory.list',
        'catalog.propertyDirectoryEnum.list',
        'catalog.property.directory.list',
        'catalog.highloadblock.list',
        'catalog.hlblock.list',
        'catalog.productProperty.fields',
    ]
    
    for ep in endpoints:
        print(f"=== TESTING {ep} ===")
        try:
            res = await bitrix_service._call(ep, {})
            print(f"Success! Response: {str(res)[:300]}")
        except Exception as e:
            print(f"Failed: {e}")
        print("-" * 40)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_endpoints())
