import asyncio
from app.services.bitrix import bitrix_service

async def compare_699_offers():
    ids = [701, 703, 705]
    for o_id in ids:
        res = await bitrix_service._call('catalog.product.get', {'id': o_id})
        p = res.get('product', {})
        print(f"\nOffer {o_id}:")
        print(f"property131: {p.get('property131')}")
        print(f"property125: {p.get('property125')}")
        img_res = await bitrix_service._call('catalog.productImage.list', {'productId': o_id})
        imgs = img_res.get('productImages', [])
        if imgs:
            print(f"First Image: {imgs[0].get('detailUrl')}")

if __name__ == "__main__":
    asyncio.run(compare_699_offers())
