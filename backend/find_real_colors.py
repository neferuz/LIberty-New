import asyncio
from app.services.bitrix import bitrix_service

async def find_real_colors():
    # Fetch products
    res = await bitrix_service._call('crm.product.list', {'limit': 100})
    for p in res:
        p_id = p['ID']
        offers = await bitrix_service._call('catalog.product.offer.list', {
            'filter': {'parentId': p_id, 'iblockId': 17},
            'select': ['id', 'property125', 'iblockId']
        })
        if offers.get('offers') and len(offers['offers']) > 1:
            colors = set()
            for o in offers['offers']:
                c = o.get('property125', {}).get('value')
                if c: colors.add(c)
            
            if len(colors) > 1:
                print(f"FOUND! Product {p_id} ({p['NAME']}) has {len(colors)} colors: {colors}")
                return

if __name__ == "__main__":
    asyncio.run(find_real_colors())
