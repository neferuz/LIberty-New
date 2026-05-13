import asyncio
import sys
import os
from pathlib import Path

# Add the project root to sys.path so we can import 'app'
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bitrix_sync")

from app.db.session import engine, Base, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
Base.metadata.create_all(bind=engine)

def ensure_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin_user = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin"),
            full_name="Administrator",
            is_active=True,
            is_superuser=True,
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        logger.info("Admin user created: admin@example.com")
    db.close()

async def sync_catalog():
    db = SessionLocal()
    try:
        # Check if integration is enabled
        from app.models.page_content import PageContent
        setting = db.query(PageContent).filter(PageContent.page_name == "bitrix_integration").first()
        if setting and setting.data and not setting.data.get("enabled", True):
            logger.info("Bitrix24 integration is disabled. Skipping sync.")
            return

        ensure_admin()
        logger.info("Starting Bitrix24 catalog sync...")
        
        # 1. Fetch products from Bitrix
        bitrix_products = await bitrix_service.get_all_products()
        logger.info(f"Fetched {len(bitrix_products)} products from Bitrix24")
        
        for bp in bitrix_products:
            b_id = int(bp["ID"])
            b_name = bp["NAME"]
            b_price = float(bp.get("PRICE") or 0)
            b_section_id = int(bp.get("SECTION_ID") or 0)
            
            # Extract SKU
            b_sku = bp.get("PROPERTY_113")
            if isinstance(b_sku, dict): b_sku = b_sku.get("value")
            if not b_sku: b_sku = bp.get("XML_ID") or f"BX-{b_id}"
            
            # Extract Image
            b_image = None
            # Check PROPERTY_45 (Картинка)
            prop_45 = bp.get("PROPERTY_45")
            if prop_45:
                if isinstance(prop_45, dict):
                    b_image = prop_45.get("value") or prop_45.get("showUrl")
                elif isinstance(prop_45, list) and len(prop_45) > 0:
                    first = prop_45[0]
                    if isinstance(first, dict):
                        b_image = first.get("value") or first.get("showUrl")
                    else:
                        b_image = first
                else:
                    b_image = prop_45
            
            # Fallback to PREVIEW_PICTURE
            if not b_image and bp.get("PREVIEW_PICTURE"):
                pic = bp["PREVIEW_PICTURE"]
                b_image = pic.get("showUrl") if isinstance(pic, dict) else pic
            
            # Fallback to DETAIL_PICTURE
            if not b_image and bp.get("DETAIL_PICTURE"):
                pic = bp["DETAIL_PICTURE"]
                b_image = pic.get("showUrl") if isinstance(pic, dict) else pic
            
            # Ensure URL is absolute if it's relative from Bitrix
            if b_image and b_image.startswith("/"):
                b_image = f"https://yustex.bitrix24.uz{b_image}"

            b_desc = bp.get("DESCRIPTION")
            
            # Extract Composition
            b_composition = bp.get("PROPERTY_115")
            if isinstance(b_composition, dict): b_composition = b_composition.get("value")

            # Extract Sizes (Assuming PROPERTY_114 or similar might have them, or mock for now)
            # Let's try to see if name contains size or mock a few
            b_sizes = "S, M, L, XL" # Default for now if not found
            
            # Check if product already exists by bitrix_id
            product = db.query(Product).filter(Product.bitrix_id == b_id).first()
            
            if not product:
                # Try by SKU as fallback
                product = db.query(Product).filter(Product.sku == b_sku).first()
            
            if product:
                # Update
                product.name = b_name
                product.price = b_price
                product.description = b_desc
                product.image_url = b_image
                product.composition = b_composition
                product.sizes = b_sizes
                product.category_id = b_section_id
                product.bitrix_id = b_id
                logger.info(f"Updated product: {b_name} (ID: {b_id})")
            else:
                # Create
                new_product = Product(
                    bitrix_id=b_id,
                    sku=b_sku,
                    name=b_name,
                    price=b_price,
                    description=b_desc,
                    image_url=b_image,
                    composition=b_composition,
                    sizes=b_sizes,
                    category_id=b_section_id,
                    stock=0, # Initial stock
                    category="General" # Default category
                )
                db.add(new_product)
                logger.info(f"Created new product: {b_name} (ID: {b_id})")
        
        db.commit()
        logger.info("Catalog sync completed successfully")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during catalog sync: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(sync_catalog())
