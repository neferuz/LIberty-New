import asyncio
import httpx

async def main():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(f"{base_url}crm.deal.list", json={
            "order": {"DATE_CREATE": "DESC"},
            "select": ["ID", "TITLE", "OPPORTUNITY", "STAGE_ID", "CATEGORY_ID", "DATE_CREATE"],
            "limit": 10
        })
        print("Deals from Bitrix24:")
        deals = res.json().get("result", [])
        for d in deals:
            print(f"ID: {d.get('ID')}, TITLE: {d.get('TITLE')}, STAGE: {d.get('STAGE_ID')}, CATEGORY_ID: {d.get('CATEGORY_ID')}, OPPORTUNITY: {d.get('OPPORTUNITY')}, CREATED: {d.get('DATE_CREATE')}")

if __name__ == "__main__":
    asyncio.run(main())
