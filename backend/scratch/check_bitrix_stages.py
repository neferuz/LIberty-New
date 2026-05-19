import asyncio
import httpx

async def main():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(f"{base_url}crm.status.list", json={
            "filter": {"ENTITY_ID": "DEAL_STAGE"}
        })
        print("Deal Stages in Bitrix24:")
        stages = res.json().get("result", [])
        for s in stages:
            print(f"STATUS_ID: {s.get('STATUS_ID')}, NAME: {s.get('NAME')}, ENTITY_ID: {s.get('ENTITY_ID')}")

if __name__ == "__main__":
    asyncio.run(main())
