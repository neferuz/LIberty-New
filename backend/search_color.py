import asyncio
from app.services.bitrix import bitrix_service

async def search_color_string():
    ids = [713, 715, 717, 2449]
    for o_id in ids:
        res = await bitrix_service._call('catalog.product.get', {'id': o_id})
        p = res.get('product', {})
        print(f"\n--- Offer {o_id} ---")
        for k, v in p.items():
            # Check if value is a string and potentially a color
            if isinstance(v, str) and len(v) < 30:
                print(f"{k}: {v}")
            elif isinstance(v, dict) and 'value' in v:
                 print(f"{k}: {v['value']}")

if __name__ == "__main__":
    asyncio.run(search_color_string())
