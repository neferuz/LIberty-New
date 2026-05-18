import asyncio
from app.services.bitrix import bitrix_service

async def find_color_property():
    o_id = 713
    print(f"Checking properties for Offer ID: {o_id}")
    
    # In catalog.product.offer.list we can't easily get all properties like in CRM
    # So we use crm.product.get for the offer ID if it works, or crm.item.get
    try:
        res = await bitrix_service._call('crm.product.get', {'id': o_id})
        print(f"Offer properties (CRM): {res}")
    except:
        print("CRM product get failed for offer")
    
    # Try another way
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'id': o_id},
        'select': ['*', 'property*']
    })
    print(f"Offer properties (Catalog): {res}")

if __name__ == "__main__":
    asyncio.run(find_color_property())
