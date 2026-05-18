import asyncio
from app.services.bitrix import bitrix_service

async def scan_all():
    products = await bitrix_service.get_all_products()
    count = 0
    for p in products:
        # Check all possible image fields
        fields_to_check = ['PREVIEW_PICTURE', 'DETAIL_PICTURE', 'PROPERTY_45']
        has_img = any(p.get(f) for f in fields_to_check)
        if has_img:
            print(f"✅ FOUND IMAGE for Product ID: {p.get('ID')} ({p.get('NAME')})")
            count += 1
    
    print(f"\nScan finished. Total products: {len(products)}. Products with images: {count}")

if __name__ == "__main__":
    asyncio.run(scan_all())
