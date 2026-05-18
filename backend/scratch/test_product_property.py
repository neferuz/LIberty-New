import asyncio
from app.services.bitrix import bitrix_service

async def test_properties():
    print("=== TESTING catalog.productProperty.list ===")
    try:
        res = await bitrix_service._call('catalog.productProperty.list', {
            'filter': {'iblockId': 17}
        })
        print("Properties list response:")
        if isinstance(res, dict) and 'properties' in res:
            for p in res['properties']:
                print(f"ID: {p.get('id')} | Name: {p.get('name')} | Code: {p.get('code')} | Type: {p.get('propertyType')}")
        else:
            print(res)
    except Exception as e:
        print(f"Failed to query productProperty: {e}")
        
    print("\n=== TESTING catalog.productPropertyEnum.list ===")
    try:
        res = await bitrix_service._call('catalog.productPropertyEnum.list', {
            'filter': {'propertyId': 125}
        })
        print("Enum values response:")
        if isinstance(res, dict) and 'productPropertyEnums' in res:
            enums = res['productPropertyEnums']
            print(f"Found {len(enums)} values!")
            for val in enums[:20]: # Print first 20 color entries
                print(f"  ID: {val.get('id')} | Value: {val.get('value')} | XML_ID (hash): {val.get('xmlId')}")
        else:
            print(res)
    except Exception as e:
        print(f"Failed to query productPropertyEnum: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(test_properties())
