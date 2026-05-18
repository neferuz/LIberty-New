import asyncio
from app.services.bitrix import bitrix_service

async def check_properties():
    # Let's call catalog.property.get or check property fields to retrieve real name dictionaries
    print("=== QUERYING CATALOG PROPERTY 125 ===")
    try:
        # Check catalog property details for property ID 125
        prop_res = await bitrix_service._call('catalog.property.get', {'id': 125})
        print("Property 125 details:")
        print(prop_res)
    except Exception as e:
        print(f"catalog.property.get failed: {e}")
        
    try:
        # Let's also check if we can list property values or list enum values
        enum_res = await bitrix_service._call('catalog.property.enum.list', {
            'filter': {'propertyId': 125}
        })
        print("\nEnum values list for 125:")
        print(enum_res)
    except Exception as e:
        print(f"catalog.property.enum.list failed: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_properties())
