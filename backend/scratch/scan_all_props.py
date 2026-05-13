import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def inspect_properties():
    print("Fetching product properties...")
    # crm.product.property.list doesn't exist, we use crm.product.fields
    # but we can also try to list properties specifically if it's a catalog
    fields = await bitrix_service.get_product_fields()
    
    print("--- ALL PROPERTIES ---")
    for k, v in sorted(fields.items()):
        if k.startswith('PROPERTY_'):
            title = v.get('title', v.get('formLabel', ''))
            is_multiple = v.get('isMultiple')
            prop_type = v.get('type')
            print(f"{k}: {title} | Multiple: {is_multiple} | Type: {prop_type}")

    # Now let's try to find ANY product that has ANY property with a file-like value
    print("\nScanning first 50 products for ANY property with a value...")
    products = await bitrix_service._call('crm.product.list', {
        'order': {'ID': 'ASC'},
        'select': ['ID', 'NAME', 'PROPERTY_*'],
        'limit': 50
    })
    
    if products:
        for p in products:
            p_id = p.get('ID')
            name = p.get('NAME')
            found_props = []
            for k, v in p.items():
                if k.startswith('PROPERTY_') and v:
                    # Filter out simple values
                    if isinstance(v, (dict, list)) or (isinstance(v, str) and (v.startswith('http') or len(v) > 20)):
                        found_props.append((k, v))
            
            if found_props:
                print(f"Product {p_id} ({name}):")
                for k, v in found_props:
                    print(f"  {k}: {v}")

if __name__ == "__main__":
    asyncio.run(inspect_properties())
