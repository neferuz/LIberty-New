import asyncio
from app.services.bitrix import bitrix_service

async def compare_offers():
    ids = [713, 715, 717, 2449]
    for o_id in ids:
        res = await bitrix_service._call('catalog.product.get', {'id': o_id})
        p = res.get('product', {})
        print(f"\nOffer {o_id}:")
        print(f"property131: {p.get('property131')}")
        print(f"property125: {p.get('property125')}")
        print(f"Name: {p.get('name')}")

if __name__ == "__main__":
    asyncio.run(compare_offers())
