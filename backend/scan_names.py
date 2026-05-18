import asyncio
from app.services.bitrix import bitrix_service

async def scan_all_offer_names():
    # List products to get some parent IDs
    res = await bitrix_service._call('crm.product.list', {'limit': 50})
    for p in res:
        p_id = p['ID']
        offers = await bitrix_service._call('catalog.product.offer.list', {
            'filter': {'parentId': p_id, 'iblockId': 17},
            'select': ['id', 'name']
        })
        if offers.get('offers'):
            for o in offers['offers']:
                if o['name'] != p['NAME']:
                    print(f"Product {p_id} ({p['NAME']}) -> Offer {o['id']} ({o['name']})")
                    return # Found one!

if __name__ == "__main__":
    asyncio.run(scan_all_offer_names())
