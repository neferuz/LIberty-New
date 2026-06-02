import asyncio
import os
import sys
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add project root to sys.path
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.models.user import User
from app.core.security import get_password_hash
from app.services.bitrix import bitrix_service

async def ensure_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@liberty.uz").first()
        if not admin:
            admin = User(
                email="admin@liberty.uz",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin",
                role="admin",
                is_superuser=True
            )
            db.add(admin)
            db.commit()
            logger.info("Admin user created")
    finally:
        db.close()

async def sync_catalog():
    logger.info("Starting catalog sync from Bitrix...")
    await ensure_admin()
    
    db = SessionLocal()
    try:
        # 1. Sync Categories (Get names for mapping)
        sections = await bitrix_service._call('crm.productsection.list', {'filter': {'CATALOG_ID': 15}})
        category_map = {int(s['ID']): s['NAME'] for s in sections}
        logger.info(f"Loaded {len(sections)} categories from Bitrix")

        # 2. Sync Products
        products = await bitrix_service.get_all_products()
        synced_count = 0
        for p in products:
            bitrix_id = int(p['ID'])
            
            # Fetch images from offers
            image_url = None
            all_images = []
            
            # Try offers
            offers = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId']
            })
            offer_list = offers.get('offers', [])
            for offer in offer_list:
                o_img_res = await bitrix_service._call('catalog.productImage.list', {'productId': offer['id']})
                o_imgs = o_img_res.get('productImages', [])
                for o_img in o_imgs:
                    url = o_img.get('detailUrl')
                    if url and url not in all_images:
                        all_images.append(url)
            
            # If no images in offers, try the product itself
            img_res = await bitrix_service._call('catalog.productImage.list', {'productId': bitrix_id})
            imgs = img_res.get('productImages', [])
            for img in imgs:
                url = img.get('detailUrl')
                if url and url not in all_images:
                    all_images.append(url)
            
            # Fallback to standard fields
            std_img_fields = ['PROPERTY_45', 'PREVIEW_PICTURE', 'DETAIL_PICTURE']
            for field in std_img_fields:
                val = p.get(field)
                if val:
                    urls = []
                    if isinstance(val, dict):
                        urls = [val.get('downloadUrl')]
                    elif isinstance(val, list):
                        urls = [item.get('downloadUrl') if isinstance(item, dict) else item for item in val]
                    else:
                        urls = [str(val)]
                    
                    for url in urls:
                        if url and url not in all_images:
                            all_images.append(url)

            if all_images:
                image_url = all_images[0]
            
            images_str = ",".join(all_images) if all_images else None

            sku = p.get('PROPERTY_113', {}).get('value') if isinstance(p.get('PROPERTY_113'), dict) else p.get('PROPERTY_113')
            if not sku:
                sku = f"LW-{bitrix_id}"

            product = db.query(Product).filter(Product.bitrix_id == bitrix_id).first()
            
            section_id = int(p.get('SECTION_ID', 0))
            category_name = category_map.get(section_id, "General")

            product_data = {
                "name": p['NAME'],
                "sku": sku,
                "description": p.get('DESCRIPTION', ''),
                "price": float(p.get('PRICE', 0)),
                "stock": 100,
                "category": category_name,
                "category_id": section_id,
                "image_url": image_url,
                "images": images_str,
                "is_active": p.get('ACTIVE') == 'Y',
                "bitrix_id": bitrix_id,
                "variants_json": None,
                "characteristics_json": None
            }

            if product:
                for key, value in product_data.items():
                    setattr(product, key, value)
            else:
                product = Product(**product_data)
                db.add(product)
            
            synced_count += 1
            if synced_count % 10 == 0:
                logger.info(f"Processed {synced_count} products...")
        
        db.commit()
        logger.info(f"Sync complete! Total products: {synced_count}")

    except Exception as e:
        logger.error(f"Error during sync: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(sync_catalog())
