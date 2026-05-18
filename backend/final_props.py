import asyncio
from app.services.bitrix import bitrix_service

async def final_attempt_props():
    print("Trying catalog.property.list for IBlock 17...")
    try:
        # Some Bitrix versions use this structure
        res = await bitrix_service._call('catalog.property.list', {
            'select': ['id', 'name', 'code'],
            'filter': {'iblockId': 17}
        })
        print(f"Result: {res}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(final_attempt_props())
