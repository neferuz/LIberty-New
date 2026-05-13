import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_product(product_id):
    print(f"Fetching full details for product {product_id}...")
    res = await bitrix_service._call('crm.product.get', {'id': product_id})
    if res:
        print("--- FULL PRODUCT DATA ---")
        for k, v in sorted(res.items()):
            if v:
                print(f"{k}: {v}")
    else:
        print("Product not found or error occurred")

    print("\n--- ALL AVAILABLE FIELDS ---")
    fields = await bitrix_service.get_product_fields()
    for k, v in sorted(fields.items()):
        title = v.get('title', v.get('formLabel', ''))
        if any(word in title.lower() for word in ['фото', 'картинка', 'изображение', 'image', 'pic', 'файл']):
            print(f"POTENTIAL IMAGE FIELD: {k} -> {title} ({v.get('type')})")

if __name__ == "__main__":
    target_id = 787 # Женская майка на лямках
    asyncio.run(inspect_product(target_id))
