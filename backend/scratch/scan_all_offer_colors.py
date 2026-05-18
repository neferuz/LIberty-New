import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def scan_colors():
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.bitrix_id.isnot(None)).all()
        print(f"Scanning {len(products)} products in local DB...")
        
        color_hashes = {}
        for p in products:
            try:
                offers_res = await bitrix_service._call('catalog.product.offer.list', {
                    'filter': {'parentId': p.bitrix_id, 'iblockId': 17},
                    'select': ['id', 'property125', 'property131']
                })
                offers = offers_res.get('offers', [])
                if offers:
                    for o in offers:
                        color_val = o.get('property125')
                        color_hash = None
                        if isinstance(color_val, dict):
                            color_hash = color_val.get('value')
                        elif color_val:
                            color_hash = str(color_val)
                            
                        if color_hash and color_hash not in color_hashes:
                            # Get one image to help identify the color
                            img_res = await bitrix_service._call('catalog.productImage.list', {'productId': o['id']})
                            imgs = img_res.get('productImages', [])
                            img_url = imgs[0].get('detailUrl') if imgs else "No Image"
                            
                            color_hashes[color_hash] = {
                                "product_name": p.name,
                                "sample_image": img_url
                            }
                            print(f"NEW COLOR HASH: '{color_hash}' -> found in '{p.name}' | Img: {img_url}")
            except Exception as e:
                # Keep scanning other products
                continue
                
        print("\n=== SUMMARY OF ALL UNIQUE COLOR HASHES ===")
        for h, info in color_hashes.items():
            print(f"Hash: '{h}' | Product: '{info['product_name']}' | Img: {info['sample_image']}")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(scan_colors())
