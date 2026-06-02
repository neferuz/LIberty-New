from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.services.bitrix import bitrix_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def is_valid_size(size: str) -> bool:
    if not size:
        return False
    clean = size.strip().upper()
    
    # 1. Standard clothing sizes (whitelist)
    standard_sizes = {"XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL", "2XS", "3XS", "4XL", "5XL", "6XL"}
    if clean in standard_sizes:
        return True
        
    # 2. One Size keywords (whitelist)
    one_size_keywords = {"ONE SIZE", "ONESIZE", "OS", "O/S", "UNISEX", "UNI", "ONE-SIZE"}
    if clean in one_size_keywords:
        return True
        
    # 3. Numeric sizes (usually 2 or 3 digits)
    import re
    if re.match(r"^\d{2,3}$", clean):
        num = int(clean)
        # Allow standard heights (92-188) or European/Russian clothing/shoe sizes (24-68)
        return (24 <= num <= 68) or (92 <= num <= 188)
        
    # 4. Slashed numeric sizes like 42/44 or 42-44
    if re.match(r"^\d{2}[/-]\d{2}$", clean):
        return True
        
    # 5. Slashed letter sizes like S/M or XS-S
    if re.match(r"^[A-Z]{1,3}[/-][A-Z]{1,3}$", clean):
        return True
        
    # 6. Very short codes (1-3 chars) consisting only of letters or digits
    if len(clean) <= 3 and re.match(r"^[A-Z0-9]+$", clean):
        return True
        
    return False

async def sync_single_product(product_id: int, db: Session, category_map: dict = None):
    """Fetch specific product from Bitrix and update local DB"""
    try:
        logger.info(f"Webhook: Syncing product ID {product_id}")
        # Fetch full details for this product (including PROPERTY_115 for composition)
        p = await bitrix_service._call('crm.product.get', {'id': product_id})
        
        if not p or 'ID' not in p:
            logger.warning(f"Webhook: Product {product_id} not found in Bitrix")
            return

        bitrix_id = int(p["ID"])
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

        # 1. Fetch images and sizes from offers
        offer_sizes = []
        offers = await bitrix_service._call('catalog.product.offer.list', {
            'filter': {'parentId': bitrix_id, 'iblockId': 17},
            'select': ['id', 'iblockId', 'property131']
        })
        offer_list = offers.get('offers', []) if isinstance(offers, dict) else []
        
        # Parallel fetch images for all offers
        import asyncio
        if offer_list:
            coroutines = [
                bitrix_service._call('catalog.productImage.list', {'productId': offer['id']})
                for offer in offer_list
            ]
            images_responses = await asyncio.gather(*coroutines, return_exceptions=True)
            
            for idx, offer in enumerate(offer_list):
                o_img_res = images_responses[idx]
                if isinstance(o_img_res, dict):
                    o_imgs = o_img_res.get('productImages', [])
                    for o_img in o_imgs:
                        url = o_img.get('detailUrl')
                        if url and url not in all_images:
                            all_images.append(url)
                            
                size_val = offer.get('property131')
                size_hash = None
                if isinstance(size_val, dict):
                    size_hash = size_val.get('value')
                elif size_val:
                    size_hash = str(size_val)
                    
                mapped_size = size_names_mapping.get(size_hash, size_hash)
                if mapped_size:
                    mapped_size = mapped_size.strip()
                    if is_valid_size(mapped_size) and mapped_size not in offer_sizes:
                        offer_sizes.append(mapped_size)
        
        # 2. Try the product itself catalog image list
        img_res = await bitrix_service._call('catalog.productImage.list', {'productId': bitrix_id})
        imgs = img_res.get('productImages', []) if isinstance(img_res, dict) else []
        for img in imgs:
            url = img.get('detailUrl')
            if url and url not in all_images:
                all_images.append(url)
        
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

        # Fetch categories to map category name
        if category_map is None:
            sections = await bitrix_service._call('crm.productsection.list', {'filter': {'CATALOG_ID': 15}})
            category_map = {int(s['ID']): s['NAME'] for s in sections} if isinstance(sections, list) else {}
        
        section_id = int(p.get('SECTION_ID', 0))
        category_name = category_map.get(section_id, "General")

        # Parse fabric composition / characteristics from PROPERTY_115
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

        # Clean adult letter sizes if children's numeric sizes are present
        has_numeric_sizes = any(sz.isdigit() for sz in offer_sizes)
        if has_numeric_sizes:
            letter_sizes = {"XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"}
            offer_sizes = [sz for sz in offer_sizes if sz not in letter_sizes]

        sizes_str = ", ".join(offer_sizes) if offer_sizes else None

        product = db.query(Product).filter(Product.bitrix_id == bitrix_id).first()
        if not product:
            product = db.query(Product).filter(Product.sku == sku).first()

        product_data = {
            "name": p['NAME'],
            "sku": sku,
            "description": p.get('DESCRIPTION', ''),
            "price": float(p.get('PRICE', 0)),
            "image_url": image_url,
            "images": images_str,
            "is_active": p.get('ACTIVE') == 'Y',
            "category": category_name,
            "category_id": section_id,
            "bitrix_id": bitrix_id,
            "sizes": sizes_str,
            "composition": composition,
            "variants_json": None,
            "characteristics_json": None
        }

        if product:
            for key, value in product_data.items():
                setattr(product, key, value)
            logger.info(f"Webhook: Updated product {p['NAME']}. Images count: {len(all_images)}")
        else:
            product = Product(**product_data)
            db.add(product)
            logger.info(f"Webhook: Created new product {p['NAME']}. Images count: {len(all_images)}")
            
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Webhook: Error syncing product {product_id}: {str(e)}")

async def delete_single_product(product_id: int, db: Session):
    """Delete specific product from local DB when deleted in Bitrix"""
    try:
        logger.info(f"Webhook: Deleting product ID {product_id}")
        product = db.query(Product).filter(Product.bitrix_id == product_id).first()
        if product:
            db.delete(product)
            db.commit()
            logger.info(f"Webhook: Successfully deleted product {product.name} (ID: {product_id})")
        else:
            logger.warning(f"Webhook: Product ID {product_id} not found in DB for deletion")
    except Exception as e:
        db.rollback()
        logger.error(f"Webhook: Error deleting product {product_id}: {str(e)}")

@router.post("/events")
async def bitrix_event_handler(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle incoming webhooks from Bitrix24"""
    form_data = await request.form()
    event = form_data.get("event")
    data = form_data.get("data[FIELDS][ID]")
    
    logger.info(f"Received Bitrix event: {event} for ID: {data}")
    
    if event in ["ONCRMPRODUCTUPDATE", "ONCRMPRODUCTADD"]:
        if data:
            # Run sync in background to respond quickly to Bitrix
            background_tasks.add_task(sync_single_product, int(data), db)
    elif event == "ONCRMPRODUCTDELETE":
        if data:
            background_tasks.add_task(delete_single_product, int(data), db)
            
    return {"status": "ok"}
