import asyncio
from app.services.bitrix import bitrix_service

async def get_property_info():
    # iblockId 17 is for offers
    res = await bitrix_service._call('catalog.property.get', {'id': 131})
    print(f"Property 131 info: {res}")
    
    # Also check enum values if it's a list
    res_enum = await bitrix_service._call('catalog.property.enum.list', {
        'filter': {'propertyId': 131}
    })
    print(f"Property 131 enum values: {res_enum}")

if __name__ == "__main__":
    asyncio.run(get_property_info())
