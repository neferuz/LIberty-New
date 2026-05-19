import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_all_props():
    res = await bitrix_service._call('crm.product.property.list', {})
    print(f"=== ALL CRM PRODUCT PROPERTIES ===")
    if isinstance(res, list):
        print(f"Found {len(res)} properties:")
        import pprint
        for p in res:
            print(f"\nProperty ID: {p.get('ID')} | Name: '{p.get('NAME')}' | Code: '{p.get('CODE')}' | Type: '{p.get('PROPERTY_TYPE')}' | UserType: '{p.get('USER_TYPE')}'")
            if p.get('USER_TYPE') == 'directory':
                print(f"  Settings: {p.get('USER_TYPE_SETTINGS')}")
            if p.get('VALUES'):
                print(f"  Values: {p.get('VALUES')[:5]}")
    else:
        print(f"Returned non-list: {res}")

if __name__ == "__main__":
    asyncio.run(inspect_all_props())
