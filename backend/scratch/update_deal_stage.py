import asyncio
import httpx

async def main():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    
    # Try updating deal 1155 to EXECUTION
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(f"{base_url}crm.deal.update", json={
            "id": 1155,
            "fields": {"STAGE_ID": "EXECUTION"}
        })
        print("Update Deal Response:")
        print(res.json())

if __name__ == "__main__":
    asyncio.run(main())
