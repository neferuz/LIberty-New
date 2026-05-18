import asyncio
from app.services.bitrix import bitrix_service

async def test_hl():
    print("=== TESTING hlblock.list ===")
    try:
        res = await bitrix_service._call('hlblock.list', {})
        print("Success hlblock.list:")
        import pprint
        pprint.pprint(res)
    except Exception as e:
        print(f"hlblock.list failed: {e}")
        
    # Let's try listing elements for block ID 1, 2, 3, etc.
    for block_id in range(1, 10):
        print(f"\n=== TESTING hlblock.element.list FOR ID {block_id} ===")
        try:
            res = await bitrix_service._call('hlblock.element.list', {'id': block_id})
            print(f"Success! Found elements keys: {list(res.keys()) if isinstance(res, dict) else res}")
            if isinstance(res, dict) and 'result' in res:
                elements = res['result']
                print(f"  Found {len(elements)} elements!")
                for el in elements[:3]:
                    print(f"    {el}")
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_hl())
