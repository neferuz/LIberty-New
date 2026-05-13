import asyncio
import sys
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.bitrix import bitrix_service

async def check_skus(product_id):
    print(f"Checking if product {product_id} has SKUs (Offers)...")
    
    # Try to find SKUs linked to this product
    # In CRM, SKUs are often other products where 'PROPERTY_SKU_ID' or similar points to the parent
    # Or we can use the catalog.product.sku.list if it's available via this webhook
    
    res = await bitrix_service._call('catalog.product.sku.list', {
        'select': ['ID', 'NAME', 'PREVIEW_PICTURE', 'DETAIL_PICTURE', 'PROPERTY_*'],
        'filter': {'PRODUCT_ID': product_id}
    })
    
    if res and 'items' in res:
        print(f"Found {len(res['items'])} SKUs:")
        for item in res['items']:
            print(f"SKU ID: {item.get('ID')} - {item.get('NAME')}")
            for k, v in item.items():
                if v and (k in ['PREVIEW_PICTURE', 'DETAIL_PICTURE'] or k.startswith('PROPERTY_')):
                    print(f"  {k}: {v}")
    else:
        print("No SKUs found via catalog.product.sku.list")
        
        # Fallback: Search all products where parent ID might be in a property
        print("\nSearching for products that might be SKUs of this one...")
        # We need to know which property is the SKU link. Often it's PROPERTY_XX where XX is ID of 'Parent'
        fields = await bitrix_service.get_product_fields()
        parent_prop = None
        for k, v in fields.items():
            if 'родитель' in str(v.get('title', '')).lower() or 'parent' in str(v.get('title', '')).lower():
                parent_prop = k
                break
        
        if parent_prop:
            print(f"Parent property seems to be {parent_prop}. Searching...")
            skus = await bitrix_service._call('crm.product.list', {
                'filter': {parent_prop: product_id}
            })
            if skus:
                print(f"Found {len(skus)} potential SKUs:")
                for s in skus:
                    print(f"  ID: {s.get('ID')} | NAME: {s.get('NAME')} | IMG: {s.get('PREVIEW_PICTURE')}")
            else:
                print("No products found linking to this parent.")
        else:
            print("Could not find a property that links SKUs to parents.")

if __name__ == "__main__":
    asyncio.run(check_skus(787))
