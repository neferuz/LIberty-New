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
        bp = await bitrix_service._call('crm.product.get', {'id': product_id})
        
        if not bp or 'ID' not in bp:
            logger.warning(f"Webhook: Product {product_id} not found in Bitrix")
            return

        b_id = int(bp["ID"])
        b_name = bp["NAME"]
        b_price = float(bp.get("PRICE") or 0)
        
        # Extract SKU
        b_sku = bp.get("PROPERTY_113")
        if isinstance(b_sku, dict): b_sku = b_sku.get("value")
        if not b_sku: b_sku = bp.get("XML_ID") or f"BX-{b_id}"
        
        # Extract Image
        b_image = None
        prop_45 = bp.get("PROPERTY_45")
        if prop_45:
            if isinstance(prop_45, dict):
                b_image = prop_45.get("value") or prop_45.get("showUrl")
            elif isinstance(prop_45, list) and len(prop_45) > 0:
                first = prop_45[0]
                b_image = first.get("value") or first.get("showUrl") if isinstance(first, dict) else first
            else:
                b_image = prop_45
        
        if not b_image and bp.get("PREVIEW_PICTURE"):
            pic = bp["PREVIEW_PICTURE"]
            b_image = pic.get("showUrl") if isinstance(pic, dict) else pic

        if not b_image and bp.get("DETAIL_PICTURE"):
            pic = bp["DETAIL_PICTURE"]
            b_image = pic.get("showUrl") if isinstance(pic, dict) else pic
            
        if b_image and b_image.startswith("/"):
            b_image = f"https://yustex.bitrix24.uz{b_image}"

        # Update local DB
        product = db.query(Product).filter(Product.bitrix_id == b_id).first()
        if not product:
            product = db.query(Product).filter(Product.sku == b_sku).first()
            
        if product:
            product.name = b_name
            product.price = b_price
            product.description = bp.get("DESCRIPTION")
            product.image_url = b_image
            product.bitrix_id = b_id
            logger.info(f"Webhook: Updated product {b_name}")
        else:
            new_product = Product(
                bitrix_id=b_id,
                sku=b_sku,
                name=b_name,
                price=b_price,
                description=bp.get("DESCRIPTION"),
                image_url=b_image,
                stock=0,
                category="General"
            )
            db.add(new_product)
            logger.info(f"Webhook: Created new product {b_name}")
            
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
