import asyncio
from app.services.bitrix import bitrix_service

async def scan_699_for_colors():
    p_id = 699
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': p_id, 'iblockId': 17},
        'select': ['id', 'iblockId', 'property131', 'property125']
    })
    
    offers = res.get('offers', [])
    print(f"Found {len(offers)} offers for 699")
    
    img_map = {}
    for o in offers:
        o_id = o['id']
        img_res = await bitrix_service._call('catalog.productImage.list', {'productId': o_id})
        imgs = img_res.get('productImages', [])
        img_url = imgs[0].get('detailUrl') if imgs else "NO_IMAGE"
        
        if img_url not in img_map:
            img_map[img_url] = []
        img_map[img_url].append(o)
        print(f"Offer {o_id}: Image={img_url}, p131={o.get('property131')}, p125={o.get('property125')}")

    print(f"\nUnique images: {len(img_map)}")

if __name__ == "__main__":
    asyncio.run(scan_699_for_colors())
