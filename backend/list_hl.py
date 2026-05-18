import asyncio
from app.services.bitrix import bitrix_service

async def list_hlblocks():
    print("Listing HighloadBlocks...")
    # Standard method to list HL blocks
    try:
        res = await bitrix_service._call('highloadblock.list', {})
        print(f"HL Blocks: {res}")
    except Exception as e:
        print(f"Failed to list HL blocks: {e}")

if __name__ == "__main__":
    asyncio.run(list_hlblocks())
