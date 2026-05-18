import asyncio
from app.services.bitrix import bitrix_service

async def test_lists():
    print("=== TESTING lists.get ===")
    try:
        res = await bitrix_service._call('lists.get', {'IBLOCK_TYPE_ID': 'lists'})
        print("Success lists.get:")
        print(res)
    except Exception as e:
        print(f"lists.get failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_lists())
