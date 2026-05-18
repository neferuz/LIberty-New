import asyncio
from app.services.bitrix import bitrix_service

async def print_all_crm_props():
    res = await bitrix_service._call('crm.product.property.list', {})
    if isinstance(res, list):
        print(f"Total properties: {len(res)}")
        for p in res:
            print(f"ID: {p.get('ID')}, Name: {p.get('NAME')}, Code: {p.get('CODE')}, IBlock: {p.get('IBLOCK_ID')}")

if __name__ == "__main__":
    asyncio.run(print_all_crm_props())
