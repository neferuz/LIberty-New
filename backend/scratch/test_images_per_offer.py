import asyncio
from app.services.bitrix import bitrix_service

async def test_images():
    # 2623 is Offer ID, 2621 is Parent Product ID
    res_offer = await bitrix_service._call('catalog.productImage.list', {'productId': 2623})
    res_parent = await bitrix_service._call('catalog.productImage.list', {'productId': 2621})
    
    print("=== IMAGES FOR OFFER 2623 ===")
    offer_imgs = res_offer.get('productImages', []) if isinstance(res_offer, dict) else []
    for img in offer_imgs:
        print(f"ID: {img.get('id')} | Url: {img.get('detailUrl')}")
        
    print("\n=== IMAGES FOR PARENT 2621 ===")
    parent_imgs = res_parent.get('productImages', []) if isinstance(res_parent, dict) else []
    for img in parent_imgs:
        print(f"ID: {img.get('id')} | Url: {img.get('detailUrl')}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_images())
