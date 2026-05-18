import asyncio
from app.services.bitrix import bitrix_service

async def print_offer():
    offers_res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 2621, 'iblockId': 17},
        'select': ['*'] # Let's select all available fields!
    })
    offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
    if offers:
        print("=== ONE RAW OFFER FULL DICTIONARY ===")
        import pprint
        pprint.pprint(offers[0])
    else:
        print("No offers found!")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(print_offer())
