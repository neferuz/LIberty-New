import asyncio
from app.services.bitrix import bitrix_service

async def find_color_v4():
    p_id = 711
    res = await bitrix_service._call('catalog.product.offer.list', {
        'filter': {'parentId': p_id, 'iblockId': 17},
        'select': ['id', 'name', 'iblockId']
    })
    
    if res.get('offers'):
        offer_id = res['offers'][0]['id']
        print(f"Offer ID: {offer_id}")
        
        # Now try to get product info using crm.product.get for the offer
        try:
            res_p = await bitrix_service._call('crm.product.get', {'id': offer_id})
            print(f"CRM Data keys: {res_p.keys()}")
            for k, v in res_p.items():
                if 'PROPERTY' in k:
                    print(f"{k}: {v}")
        except Exception as e:
            print(f"CRM product get failed: {e}")

if __name__ == "__main__":
    asyncio.run(find_color_v4())
