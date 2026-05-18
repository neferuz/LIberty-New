import asyncio
from app.services.bitrix import bitrix_service

async def group_products_by_name():
    # Fetch all products from CRM
    res = await bitrix_service._call('crm.product.list', {'limit': 500})
    
    groups = {}
    for p in res:
        name = p['NAME']
        if name not in groups:
            groups[name] = []
        groups[name].append(p['ID'])
    
    # Print groups with more than 1 product
    found = False
    for name, ids in groups.items():
        if len(ids) > 1:
            print(f"Group: '{name}' -> IDs: {ids}")
            found = True
    
    if not found:
        print("No products with identical names found.")

if __name__ == "__main__":
    asyncio.run(group_products_by_name())
