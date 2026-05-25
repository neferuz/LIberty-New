import asyncio
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add project root to sys.path
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def run_cleanup():
    logger.info("Starting one-off cleanup of deleted products...")
    db = SessionLocal()
    try:
        # 1. Fetch active products list from Bitrix
        bitrix_prods = await bitrix_service.get_all_products()
        if not bitrix_prods:
            logger.error("No products fetched from Bitrix24 or failed to connect. Aborting cleanup to prevent accidental deletion.")
            return

        bitrix_ids = {int(p["ID"]) for p in bitrix_prods}
        logger.info(f"Active Bitrix products count: {len(bitrix_ids)}")

        # 2. Get local products that have a bitrix_id
        local_products = db.query(Product).filter(Product.bitrix_id.isnot(None)).all()
        logger.info(f"Local products with Bitrix ID count: {len(local_products)}")

        deleted_count = 0
        for lp in local_products:
            if lp.bitrix_id not in bitrix_ids:
                logger.info(f"Removing deleted product: {lp.name} (ID: {lp.id}, SKU: {lp.sku}, Bitrix ID: {lp.bitrix_id})")
                db.delete(lp)
                deleted_count += 1

        if deleted_count > 0:
            db.commit()
            logger.info(f"Successfully cleaned up {deleted_count} deleted products from the local DB!")
        else:
            logger.info("No deleted products found in the local DB. Database is fully in sync!")

    except Exception as e:
        logger.error(f"Error during database cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_cleanup())
