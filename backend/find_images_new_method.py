import asyncio
from app.services.bitrix import bitrix_service

async def find_images_everywhere():
    p_id = 2703
    print(f"Scanning ID: {p_id}")
    
    # 1. Direct images
    res = await bitrix_service._call('catalog.productImage.list', {'productId': p_id})
    print(f"Direct images: {res}")
    
    # 2. Check if it has a parent (SKU)
    product = await bitrix_service._call('crm.product.get', {'id': p_id})
    # In some cases parent ID is in a specific property
    print(f"Product data: {product}")
    
    # 3. Try some other product IDs from the list
    other_ids = [699, 711, 719, 731]
    for oid in other_ids:
        res = await bitrix_service._call('catalog.productImage.list', {'productId': oid})
        if res.get('productImages'):
            print(f"✅ FOUND IMAGES for Product {oid}: {res['productImages']}")
            return

if __name__ == "__main__":
    asyncio.run(find_images_everywhere())
