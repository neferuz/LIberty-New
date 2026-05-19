import asyncio
import httpx

async def main():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    
    import datetime
    deadline_str = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
    
    # Create modern todo activity linked to deal 1155
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(f"{base_url}crm.activity.todo.add", json={
            "ownerTypeId": 2, # 2 is Deal
            "ownerId": 1155,
            "deadline": deadline_str,
            "title": "Подтвердить заказ с сайта #1155",
            "description": "Новый заказ с сайта! Пожалуйста, позвоните клиенту для подтверждения деталей."
        })
        print("Todo creation response:")
        print(res.json())

if __name__ == "__main__":
    asyncio.run(main())
