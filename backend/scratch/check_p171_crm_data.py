import asyncio
from app.services.bitrix import bitrix_service

async def check_crm():
    # 2621 is Bitrix ID for product 171
    print("=== QUERYING CRM PRODUCT 2621 ===")
    try:
        res = await bitrix_service._call('crm.product.get', {'id': 2621})
        import pprint
        pprint.pprint(res)
    except Exception as e:
        print(f"Failed to query CRM product: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_crm())
