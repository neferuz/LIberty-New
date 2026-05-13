import asyncio
import httpx
import json

async def check_product_fields():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    url = f"{base_url}crm.product.fields"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={})
        data = response.json()
        fields = data.get("result", {})
        
        # Also check one specific product to see values
        url_prod = f"{base_url}crm.product.get"
        resp_prod = await client.post(url_prod, json={"id": 2251}) # One of the IDs from sync logs
        prod = resp_prod.json().get("result", {})
        
        print("Product fields with values for ID 2251:")
        for k, v in prod.items():
            if v and k.startswith("PROPERTY_"):
                print(f"{k}: {v}")

if __name__ == "__main__":
    asyncio.run(check_product_fields())
