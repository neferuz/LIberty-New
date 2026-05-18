import asyncio
from app.services.bitrix import bitrix_service

async def test_highload():
    print("=== TESTING highloadblock.list ===")
    try:
        # Standard CRM or catalog methods might have highloadblock methods
        res = await bitrix_service._call('highloadblock.list', {})
        print("Success highloadblock.list:")
        print(res)
    except Exception as e:
        print(f"highloadblock.list failed: {e}")
        
    print("\n=== TESTING highloadblock.get ===")
    try:
        res = await bitrix_service._call('highloadblock.get', {'name': 'b_hlbd_699444a3da96c'})
        print(res)
    except Exception as e:
        print(f"highloadblock.get failed: {e}")

    # Let's try some other common REST names for HL blocks
    methods = [
        ('highloadblock.element.list', {'hlblockId': 1}),
        ('highloadblock.element.list', {'hlblockId': 2}),
        ('highloadblock.element.list', {'tableName': 'b_hlbd_699444a3da96c'}),
    ]
    for method, params in methods:
        print(f"\n=== TESTING {method} with {params} ===")
        try:
            res = await bitrix_service._call(method, params)
            print(f"Success! {method} returned keys: {list(res.keys()) if isinstance(res, dict) else res}")
            if isinstance(res, dict):
                # Print first item
                for k, v in res.items():
                    print(f"  {k}: {str(v)[:400]}")
                    break
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_highload())
