import asyncio
from app.services.bitrix import bitrix_service

async def find_multi_color_product_v3():
    # List more products to find a good example
    res = await bitrix_service._call('crm.product.list', {'limit': 50})
    for p in res:
        p_id = p['ID']
        print(f"Checking product {p_id}...")
        try:
            # Try without iblockId filter
            offers = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': p_id},
                'select': ['id', 'name']
            })
            if offers.get('offers') and len(offers['offers']) > 1:
                all_offer_imgs = []
                for o in offers['offers']:
                    img_res = await bitrix_service._call('catalog.productImage.list', {'productId': o['id']})
                    imgs = img_res.get('productImages', [])
                    if imgs:
                        img_url = imgs[0].get('detailUrl')
                        if img_url and img_url not in all_offer_imgs:
                            all_offer_imgs.append(img_url)
                
                if len(all_offer_imgs) > 1:
                    print(f"FOUND! Product {p_id} ({p['NAME']}) has {len(all_offer_imgs)} different color images in offers.")
                    for i, url in enumerate(all_offer_imgs):
                        print(f"Image {i+1}: {url}")
                    return
        except:
            continue

if __name__ == "__main__":
    asyncio.run(find_multi_color_product_v3())
