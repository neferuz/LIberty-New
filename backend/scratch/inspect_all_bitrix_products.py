import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_products():
    res = await bitrix_service._call('crm.product.list', {
        'filter': {'%NAME': 'майка'}
    })
    if res:
        print(f"Found {len(res)} products with 'майка':")
        for p in res:
            print(f"ID: {p.get('ID')} | Name: {p.get('NAME')} | SKU: {p.get('PROPERTY_113')}")
            # print all properties
            for k, v in p.items():
                if 'PROPERTY' in k and v:
                    print(f"  {k}: {v}")
    else:
        print("No products found")

if __name__ == "__main__":
    asyncio.run(inspect_products())
