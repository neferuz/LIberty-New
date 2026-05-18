import asyncio
import logging
from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def sync_single_product(bitrix_id: int):
    db = SessionLocal()
    try:
        p = await bitrix_service._call('crm.product.get', {'id': bitrix_id})
        all_images = []
        
        # Offers
        offers = await bitrix_service._call('catalog.product.offer.list', {
            'filter': {'parentId': bitrix_id, 'iblockId': 17},
            'select': ['id', 'iblockId']
        })
        for offer in offers.get('offers', []):
            o_img_res = await bitrix_service._call('catalog.productImage.list', {'productId': offer['id']})
            for o_img in o_img_res.get('productImages', []):
                url = o_img.get('detailUrl')
                if url and url not in all_images:
                    all_images.append(url)
        
        # Product itself
        img_res = await bitrix_service._call('catalog.productImage.list', {'productId': bitrix_id})
        for img in img_res.get('productImages', []):
            url = img.get('detailUrl')
            if url and url not in all_images:
                all_images.append(url)

        sku = p.get('PROPERTY_113', {}).get('value') if isinstance(p.get('PROPERTY_113'), dict) else p.get('PROPERTY_113')
        if not sku: sku = f"LW-{bitrix_id}"

        product = db.query(Product).filter(Product.bitrix_id == bitrix_id).first()
        product_data = {
            "name": p['NAME'],
            "sku": sku,
            "description": p.get('DESCRIPTION', ''),
            "price": float(p.get('PRICE', 0)),
            "image_url": all_images[0] if all_images else None,
            "images": ",".join(all_images) if all_images else None,
            "is_active": p.get('ACTIVE') == 'Y',
            "bitrix_id": bitrix_id
        }

        if product:
            for key, value in product_data.items():
                setattr(product, key, value)
            db.commit()
            print(f"✅ Product {bitrix_id} updated. Images count: {len(all_images)}")
        else:
            print(f"❌ Product {bitrix_id} not found in DB")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(sync_single_product(711))
