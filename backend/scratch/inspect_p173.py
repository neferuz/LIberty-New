import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.services.bitrix import bitrix_service

async def inspect_product():
    db = SessionLocal()
    try:
        p = db.query(Product).filter(Product.id == 173).first()
        if not p:
            print("Product 173 not found in database!")
            return
            
        if p.bitrix_id:
            offers_res = await bitrix_service._call('catalog.product.offer.list', {
                'filter': {'parentId': p.bitrix_id, 'iblockId': 17},
                'select': ['id', 'iblockId', 'property125', 'property131']
            })
            offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
            
            color_names_mapping = {
                "d59fd1cd1249b6c2749b5576405c3f23": "Черный (Classic Black)",
                "823a3e75274ac66ba93a3d67f0fe634b": "Темно-синий (Classic Navy)",
                "40515b3120fd36ba18be1c467b93cf0b": "Серый (Classic Grey)",
                "6acbfc2b21013ca13a8e7308cd7b9a31": "Белый (Classic White)",
                "a7d87f9fe860860dd468832eff40fe99": "Темно-синий (Classic Navy)",
                "ebcd1eee9579b3a525b3a9d28f0688f2": "Розовый (Classic Pink)",
                "a8c212a52ded4ba7964c86c662abe9cd": "Нежно-розовый (Soft Pink)",
            }
            
            size_names_mapping = {
                "0a9ba8f9c12f6df659dc009a22db8197": "XXS",
                "2bb51496fe8b72b6aa984b8975ab528c": "XS",
                "ac7c6f452cc57aeca3ed9c14e0aa4d06": "S",
                "c4150de8d2bab3737740665dac14885f": "M",
                "526ba9f8e4f82e3ffa85b69dd75ff8e7": "L",
                "7dda4dcd82e2423ec6866c4643cf5857": "XL",
                "994738ea6cfd61e697cc6ad5efd9886a": "92",
                "c19589efc595abbba590a20ceee38064": "98",
                "66675c702b09d7d26366fdb68979e601": "104",
                "3f3962a3fd59bfedd1c42c4c2b6ab49a": "110",
                "27c2cfc5479ed00908af0f3c3fd8da99": "116",
            }
            
            print(f"=== DETAILED OFFERS FOR '{p.name}' ===")
            for o in offers:
                color_val = o.get('property125')
                color_hash = color_val.get('value') if isinstance(color_val, dict) else color_val
                mapped_color = color_names_mapping.get(color_hash, color_hash)
                
                size_val = o.get('property131')
                size_hash = size_val.get('value') if isinstance(size_val, dict) else size_val
                mapped_size = size_names_mapping.get(size_hash, size_hash)
                
                print(f"Offer ID: {o.get('id')} | Color: {mapped_color} | Size: {mapped_size}")
                
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(inspect_product())
