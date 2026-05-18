import asyncio
from app.services.bitrix import bitrix_service

async def get_all_crm_props():
    res = await bitrix_service._call('crm.product.property.list', {})
    if isinstance(res, list):
        for p in res:
            name = p.get('NAME', '')
            if 'Цвет' in name or 'Размер' in name or p.get('IBLOCK_ID') == '17':
                print(f"Property: ID={p.get('ID')}, Name={name}, IBlock={p.get('IBLOCK_ID')}, Code={p.get('CODE')}")

if __name__ == "__main__":
    asyncio.run(get_all_crm_props())
