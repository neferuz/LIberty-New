import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from app.services.bitrix import bitrix_service

async def inspect():
    print("Fetching products with all properties...")
    # CRM Product list might need specific properties in select
    # Let's try to get one and see everything
    fields = await bitrix_service.get_product_fields()
    prop_fields = [k for k in fields.keys() if k.startswith('PROPERTY_')]
    
    res = await bitrix_service._call('crm.product.list', {
        'select': ['ID', 'NAME', 'PREVIEW_PICTURE', 'DETAIL_PICTURE'] + prop_fields
    })
    
    if not res:
        print("No products found")
        return

    for p in res:
        found_img = False
        img_data = None
        
        if p.get('PREVIEW_PICTURE'):
            found_img = True
            img_data = ("PREVIEW_PICTURE", p['PREVIEW_PICTURE'])
        elif p.get('DETAIL_PICTURE'):
            found_img = True
            img_data = ("DETAIL_PICTURE", p['DETAIL_PICTURE'])
        else:
            for k, v in p.items():
                if k.startswith('PROPERTY_') and v:
                    # Check if this property looks like a file/image
                    field_info = fields.get(k, {})
                    if field_info.get('propertyType') == 'F' or 'Картинка' in str(field_info.get('title')):
                        found_img = True
                        img_data = (k, v)
                        break
        
        if found_img:
            print(f"Product ID: {p['ID']} - Name: {p['NAME']}")
            print(f"  Found Image in {img_data[0]}: {img_data[1]}")
            # Try to get the actual URL if it's an ID
            if isinstance(img_data[1], (int, str)) and str(img_data[1]).isdigit():
                print(f"  Image appears to be an ID: {img_data[1]}")
            return # Just need one example

    print("No images found in any product fields")

if __name__ == "__main__":
    asyncio.run(inspect())
