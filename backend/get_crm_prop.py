import asyncio
from app.services.bitrix import bitrix_service

async def get_crm_prop_info():
    # iblockId 17 is for offers
    # In CRM API we don't usually specify iblockId directly, but we can try to list all properties
    res = await bitrix_service._call('crm.product.property.list', {
        'filter': {'IBLOCK_ID': 17}
    })
    print(f"CRM Properties for IBLOCK 17: {res}")
    
    # Try to find property with ID 131 or similar
    if res:
        props = res.get('result', [])
        for p in props:
            if p.get('ID') == '131' or 'Цвет' in p.get('NAME', ''):
                print(f"Match: {p}")

if __name__ == "__main__":
    asyncio.run(get_crm_prop_info())
