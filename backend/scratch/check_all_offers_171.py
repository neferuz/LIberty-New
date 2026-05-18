import asyncio
from app.services.bitrix import bitrix_service

async def check_all_offers():
    offers_res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': 2621, 'iblockId': 17},
        'select': ['id', 'iblockId', 'property125', 'property131']
    })
    offers = offers_res.get('offers', []) if isinstance(offers_res, dict) else []
    print(f"Total offers found: {len(offers)}")
    colors = {}
    for o in offers:
        color_val = o.get('property125')
        color_hash = color_val.get('value') if isinstance(color_val, dict) else str(color_val)
        
        size_val = o.get('property131')
        size_hash = size_val.get('value') if isinstance(size_val, dict) else str(size_val)
        
        if color_hash not in colors:
            colors[color_hash] = []
        colors[color_hash].append((o.get('id'), size_hash))
        
    for ch, items in colors.items():
        print(f"Color Hash: {ch} | Offers count: {len(items)}")
        print(f"  Offers: {items}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(check_all_offers())
