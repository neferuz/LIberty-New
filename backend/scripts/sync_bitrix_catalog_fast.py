import asyncio
import os
import sys
from typing import List, Optional, Dict, Any
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

async def call_bitrix_with_retry(method: str, params: Dict[str, Any] = None, retries: int = 5, backoff: float = 1.0) -> Dict[str, Any]:
    """Call Bitrix API with automatic retry on 503 or connection errors"""
    for attempt in range(retries):
        res = await bitrix_service._call(method, params)
        
        is_error = False
        error_code = ""
        description = ""
        if isinstance(res, dict) and "error" in res:
            is_error = True
            error_code = str(res.get("error", ""))
            description = str(res.get("description", ""))
            
        if is_error and (
            error_code == "connection_error" or
            "503" in description or 
            "connection" in description.lower() or 
            "timeout" in description.lower() or
            not description
        ):
            wait_time = backoff * (2 ** attempt)
            logger.warning(f"⚠️ Bitrix API error on {method} ({error_code}: {description}). Attempt {attempt+1}/{retries}. Waiting {wait_time}s...")
            await asyncio.sleep(wait_time)
        else:
            await asyncio.sleep(0.1) # Small delay to be polite
            return res
            
    # Final try
    return await bitrix_service._call(method, params)

async def get_all_products_with_retry() -> List[Dict[str, Any]]:
    """Fetch all products from Bitrix24 with robust retry logic"""
    products = []
    start = 0
    while True:
        result = await call_bitrix_with_retry("crm.product.list", {
            "order": {"ID": "ASC"},
            "select": ["ID", "NAME", "DESCRIPTION", "PRICE", "CURRENCY_ID", "XML_ID", "PREVIEW_PICTURE", "DETAIL_PICTURE", "PROPERTY_45", "PROPERTY_113", "PROPERTY_115", "SECTION_ID"],
            "start": start
        })
        
        if isinstance(result, list):
            products.extend(result)
            if len(result) < 50: # Default limit
                break
            start += len(result)
        else:
            logger.error(f"crm.product.list returned non-list result: {result}")
            break
    return products

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

async def sync_single_product_data(p: Dict[str, Any], category_map: Dict[int, str], semaphore: asyncio.Semaphore) -> Optional[Dict[str, Any]]:
    async with semaphore:
        bitrix_id = int(p['ID'])
        all_images = []
        
        size_names_mapping = {
            "aIlu058O": "XS",
            "fLmaA85S": "S",
            "xdT4Fm3j": "M",
            "0SexOax9": "L",
            "bahtl20Z": "XL",
            
            # Highload Block b_hlbd_razmery size hashes
            # Kids / Teens
            "0a9ba8f9c12f6df659dc009a22db8197": "XXS",
            "2bb51496fe8b72b6aa984b8975ab528c": "140",
            "ac7c6f452cc57aeca3ed9c14e0aa4d06": "146",
            "c4150de8d2bab3737740665dac14885f": "152",
            "526ba9f8e4f82e3ffa85b69dd75ff8e7": "158",
            "7dda4dcd82e2423ec6866c4643cf5857": "164",
            
            # Kids
            "994738ea6cfd61e697cc6ad5efd9886a": "92",
            "c19589efc595abbba590a20ceee38064": "98",
            "66675c702b09d7d26366fdb68979e601": "104",
            "3f3962a3fd59bfedd1c42c4c2b6ab49a": "110",
            "27c2cfc5479ed00908af0f3c3fd8da99": "116",
            "36337330031518aeecf9ea3c7b672b38": "122",
            "9509e720c033b2cccdbad9d84ea99933": "128",
            "bf0f2c1c3b2f5ee15745d3276ac39219": "134",
            
            # Infants & Toddlers
            "9f22143114a0c78d81cb1fdf7b2760a1": "56",
            "781f58bf8c1d23f891ad09ac4262c8e5": "62",
            "0108025956712c6b58f0bb49ddcad1bd": "68",
            "28456ee60c4f94771ce54e44a847fe89": "74",
            "7939102f96380e1f901d176d825b6251": "80",
        }

        # 1. Fetch images and sizes from offers concurrently
        offer_sizes = []
        try:
            offers = await call_bitrix_with_retry('catalog.product.offer.list', {
                'filter': {'parentId': bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId', 'property131']
            })
            offer_list = offers.get('offers', []) if isinstance(offers, dict) else []
            
            async def get_offer_details(offer_id, size_val):
                try:
                    o_img_res = await call_bitrix_with_retry('catalog.productImage.list', {'productId': offer_id})
                    imgs = []
                    if isinstance(o_img_res, dict):
                        imgs = [o_img.get('detailUrl') for o_img in o_img_res.get('productImages', []) if o_img.get('detailUrl')]
                except Exception:
                    imgs = []
                
                size_hash = None
                if isinstance(size_val, dict):
                    size_hash = size_val.get('value')
                elif size_val:
                    size_hash = str(size_val)
                    
                mapped_size = size_names_mapping.get(size_hash, size_hash)
                return imgs, mapped_size

            if offer_list:
                offer_details = await asyncio.gather(*(get_offer_details(o['id'], o.get('property131')) for o in offer_list))
                for img_list, sz in offer_details:
                    for img in img_list:
                        if img not in all_images:
                            all_images.append(img)
                    if sz and sz not in offer_sizes:
                        offer_sizes.append(sz)
        except Exception as e:
            logger.warning(f"Error getting offers for {bitrix_id}: {e}")
            
        # 2. Try the product itself catalog image list
        try:
            img_res = await call_bitrix_with_retry('catalog.productImage.list', {'productId': bitrix_id})
            if isinstance(img_res, dict):
                imgs = img_res.get('productImages', [])
                for img in imgs:
                    url = img.get('detailUrl')
                    if url and url not in all_images:
                        all_images.append(url)
        except Exception as e:
            logger.warning(f"Error getting product images for {bitrix_id}: {e}")

        # 3. Fallback to standard fields
        std_img_fields = ['PROPERTY_45', 'PREVIEW_PICTURE', 'DETAIL_PICTURE']
        for field in std_img_fields:
            val = p.get(field)
            if val:
                urls = []
                if isinstance(val, dict):
                    urls = [val.get('downloadUrl') or val.get('showUrl')]
                elif isinstance(val, list):
                    urls = [item.get('downloadUrl') or item.get('showUrl') if isinstance(item, dict) else item for item in val]
                else:
                    urls = [str(val)]
                
                for url in urls:
                    if url:
                        if url.startswith("/"):
                            url = f"https://yustex.bitrix24.uz{url}"
                        if url not in all_images:
                            all_images.append(url)

        image_url = all_images[0] if all_images else None
        images_str = ",".join(all_images) if all_images else None

        sku = p.get('PROPERTY_113', {}).get('value') if isinstance(p.get('PROPERTY_113'), dict) else p.get('PROPERTY_113')
        if not sku:
            sku = f"LW-{bitrix_id}"

        section_id = int(p.get('SECTION_ID', 0))
        category_name = category_map.get(section_id, "General")

        # Parse fabric composition / characteristics
        composition = None
        prop115 = p.get('PROPERTY_115')
        char_text = ""
        if isinstance(prop115, dict):
            char_text = prop115.get('value', '')
        elif prop115:
            char_text = str(prop115)
        
        if char_text:
            char_text_cleaned = char_text.replace('"', '').replace("'", "")
            if ':' in char_text_cleaned:
                parts = char_text_cleaned.split()
                current_key = None
                current_val_words = []
                characteristics = {}
                
                for word in parts:
                    if word.endswith(':'):
                        if current_key:
                            characteristics[current_key] = " ".join(current_val_words)
                        current_key = word[:-1].upper()
                        current_val_words = []
                    else:
                        current_val_words.append(word)
                if current_key and current_val_words:
                    characteristics[current_key] = " ".join(current_val_words)
                
                if "СОСТАВ" in characteristics:
                    composition = characteristics["СОСТАВ"]
            else:
                composition = char_text_cleaned

        sizes_str = ", ".join(offer_sizes) if offer_sizes else None

        return {
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
            "sizes": sizes_str,
            "composition": composition,
            "variants_json": None,
            "characteristics_json": None
        }

async def save_to_db(product_datas: List[Dict[str, Any]]):
    db = SessionLocal()
    try:
        updated_count = 0
        created_count = 0
        for data in product_datas:
            if not data:
                continue
            
            bitrix_id = data["bitrix_id"]
            product = db.query(Product).filter(Product.bitrix_id == bitrix_id).first()
            if product:
                for key, value in data.items():
                    setattr(product, key, value)
                updated_count += 1
            else:
                product = Product(**data)
                db.add(product)
                created_count += 1
        
        db.commit()
        logger.info(f"Successfully saved to DB! Created: {created_count}, Updated: {updated_count}")
    except Exception as e:
        logger.error(f"Error during database commit: {e}")
        db.rollback()
    finally:
        db.close()

async def sync_catalog():
    logger.info("Starting FAST ROBUST CONCURRENT catalog sync from Bitrix...")
    await ensure_admin()
    
    # 1. Fetch Categories
    sections = await call_bitrix_with_retry('crm.productsection.list', {'filter': {'CATALOG_ID': 15}})
    category_map = {int(s['ID']): s['NAME'] for s in sections} if isinstance(sections, list) else {}
    logger.info(f"Loaded {len(category_map)} categories from Bitrix")

    # 2. Fetch all products from Bitrix using retry logic
    products = await get_all_products_with_retry()
    logger.info(f"Fetched {len(products)} products from Bitrix. Starting concurrent image fetching...")

    # Limit concurrency to 2 parallel requests (extremely polite and bypasses 503)
    semaphore = asyncio.Semaphore(2)
    
    # Run concurrent fetching
    tasks = [sync_single_product_data(p, category_map, semaphore) for p in products]
    product_datas = await asyncio.gather(*tasks)
    
    logger.info("Concurrently fetched all images and product fields. Writing to database...")
    
    # Save all gathered data to DB in a single safe transaction
    await save_to_db(product_datas)
    logger.info("FAST Sync complete!")

if __name__ == "__main__":
    asyncio.run(sync_catalog())
