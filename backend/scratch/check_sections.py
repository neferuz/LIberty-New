import asyncio
import httpx
import json

async def check_sections():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    url = f"{base_url}crm.productsection.list"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={})
        data = response.json()
        sections = data.get("result", [])
        
        print(f"Found {len(sections)} sections:")
        for s in sections:
            parent_id = s.get("SECTION_ID")
            print(f"ID: {s['ID']}, Name: {s['NAME']}, Parent ID: {parent_id}")

if __name__ == "__main__":
    asyncio.run(check_sections())
