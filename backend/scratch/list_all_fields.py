import asyncio
import httpx

async def list_all_fields():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    url = f"{base_url}crm.product.fields"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={})
        data = response.json()
        fields = data.get("result", {})
        
        for k, v in fields.items():
            print(f"{k}: {v.get('title')}")

if __name__ == "__main__":
    asyncio.run(list_all_fields())
