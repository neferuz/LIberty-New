import asyncio
from app.services.bitrix import bitrix_service

async def check_fields():
    print("=== TESTING catalog.product.offer.fields ===")
    try:
        res = await bitrix_service._call('catalog.product.offer.fields')
        print("Success! Fields mapping:")
        import pprint
        pprint.pprint(res)
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_fields())
