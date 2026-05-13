import asyncio
import httpx

async def find_size_field():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    url = f"{base_url}crm.product.fields"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={})
        data = response.json()
        fields = data.get("result", {})
        
        for k, v in fields.items():
            title = v.get("title", "")
            if "Размер" in title or "размер" in title:
                print(f"Key: {k}, Title: {title}")

if __name__ == "__main__":
    asyncio.run(find_size_field())
