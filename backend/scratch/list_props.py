import asyncio
import httpx

async def list_props():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    url = f"{base_url}crm.product.property.list"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={})
        data = response.json()
        props = data.get("result", [])
        
        for p in props:
            print(p)

if __name__ == "__main__":
    asyncio.run(list_props())
