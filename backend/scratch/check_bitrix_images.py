import asyncio
import sys
import os
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def check_images():
    print("Listing 10 most recent products...")
    products = await bitrix_service._call("crm.product.list", {
        "order": {"ID": "DESC"},
        "limit": 10
    })
    
    if products and isinstance(products, list):
        for p in products:
            print(f"ID: {p['ID']} - {p['NAME']}")
            has_img = False
            for k, v in p.items():
                if v and ("PICTURE" in k or "PHOTO" in k or k == "PROPERTY_45"):
                    print(f"  {k}: {v}")
                    has_img = True
            if not has_img:
                print("  No images.")
    else:
        print("Error or no products.")

if __name__ == "__main__":
    asyncio.run(check_images())
