from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.services.bitrix import bitrix_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

async def sync_single_product(product_id: int, db: Session):
    """Fetch specific product from Bitrix and update local DB"""
    try:
        logger.info(f"Webhook: Syncing product ID {product_id}")
        # Fetch full details for this product
        p = await bitrix_service._call('crm.product.get', {'id': product_id})
        
        if not p or 'ID' not in p:
            logger.warning(f"Webhook: Product {product_id} not found in Bitrix")
            return

        bitrix_id = int(p["ID"])
        all_images = []
        
        # 1. Fetch images from offers
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
        
        # 2. Try the product itself catalog image list
        img_res = await bitrix_service._call('catalog.productImage.list', {'productId': bitrix_id})
        imgs = img_res.get('productImages', [])
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
        sections = await bitrix_service._call('crm.productsection.list', {'filter': {'CATALOG_ID': 15}})
        category_map = {int(s['ID']): s['NAME'] for s in sections} if isinstance(sections, list) else {}
        
        section_id = int(p.get('SECTION_ID', 0))
        category_name = category_map.get(section_id, "General")

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
            "bitrix_id": bitrix_id
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
            
    return {"status": "ok"}
