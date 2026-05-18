import asyncio
from app.services.bitrix import bitrix_service

async def test_methods():
    methods = [
        ('iblock.property.list', {'iblockId': 17}),
        ('catalog.property.list', {'filter': {'iblockId': 17}}),
        ('catalog.property.list', {}),
        ('iblock.element.fields', {}),
    ]
    
    for method, params in methods:
        print(f"=== TESTING {method} ===")
        try:
            res = await bitrix_service._call(method, params)
            print(f"Success! Keys: {list(res.keys()) if isinstance(res, dict) else type(res)}")
            if isinstance(res, dict):
                # Print first item
                for k, v in res.items():
                    print(f"  {k}: {str(v)[:300]}")
                    break
        except Exception as e:
            print(f"Failed: {e}")
        print("-" * 40)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_methods())
