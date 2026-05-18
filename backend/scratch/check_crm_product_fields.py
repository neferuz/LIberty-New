import asyncio
from app.services.bitrix import bitrix_service

async def check_crm_fields():
    print("=== QUERYING CRM PRODUCT FIELDS ===")
    fields_res = await bitrix_service._call('crm.product.fields')
    
    # Filter keys containing property or prop
    prop_keys = [k for k in fields_res.keys() if 'property' in k.lower()]
    print(f"Total property-like fields found: {len(prop_keys)}")
    for k in prop_keys[:15]: # Show first 15
        field_info = fields_res.get(k)
        print(f"Field: {k} | Title: {field_info.get('title')} | Type: {field_info.get('type')}")
        if 'items' in field_info:
            print(f"  Items (first 5): {field_info.get('items')[:5]}")
        print("-" * 40)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_crm_fields())
