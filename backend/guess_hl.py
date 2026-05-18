import asyncio
from app.services.bitrix import bitrix_service

async def guess_hl_data():
    common_names = ['Color', 'Colors', 'ColorReference', 'Brends', 'Sizes']
    for name in common_names:
        print(f"Trying HL block: {name}")
        try:
            # We need ID for highloadblock.get, but let's try to find it first
            # Since highloadblock.list failed, maybe it is a different method?
            # In some versions it is 'entity.item.get' or similar.
            pass
        except:
            pass

    # Let's try to get ALL properties of IBlock 17 using a different method
    res = await bitrix_service._call('catalog.iblock.get', {'id': 17})
    print(f"IBlock 17 info: {res}")

if __name__ == "__main__":
    asyncio.run(guess_hl_data())
