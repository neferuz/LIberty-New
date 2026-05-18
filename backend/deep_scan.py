import asyncio
import json
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).parent))

from app.services.bitrix import bitrix_service

async def deep_scan():
    result = await bitrix_service._call('crm.product.list', {
        'order': {'ID': 'DESC'},
        'select': ['*', 'PROPERTY_*'],
        'limit': 10
    })
    if isinstance(result, list):
        for p in result:
            print(f"--- PRODUCT ID: {p.get('ID')} ---")
            for k, v in p.items():
                if v:
                    print(f"{k}: {v}")
    else:
        print(f"Error or empty: {result}")

if __name__ == "__main__":
    asyncio.run(deep_scan())
