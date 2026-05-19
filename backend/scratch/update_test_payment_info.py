import asyncio
import httpx

async def main():
    base_url = "https://yustex.bitrix24.uz/rest/11/6kuit00wrbcyega9/"
    
    # 1. Get current deal 1155
    async with httpx.AsyncClient(timeout=30.0) as client:
        res_get = await client.post(f"{base_url}crm.deal.get", json={"id": 1155})
        existing = res_get.json().get("result", {})
        current_title = existing.get("TITLE", "")
        current_comments = existing.get("COMMENTS", "")
        
        # Clean existing tags
        clean_title = current_title
        for tag in ["[Оплачено через CLICK]", "[Оплачено через Payme]", "[Наличными при получении]"]:
            clean_title = clean_title.replace(tag, "").strip()
            
        new_title = f"{clean_title} [Оплачено через Payme]"
        new_comments = f"{current_comments}\n\n[Информация об оплате]: Тест: Успешно оплачено онлайн через Payme!"
        
        # 2. Update deal 1155
        res_update = await client.post(f"{base_url}crm.deal.update", json={
            "id": 1155,
            "fields": {
                "STAGE_ID": "FINAL_INVOICE",
                "TITLE": new_title,
                "COMMENTS": new_comments
            }
        })
        print("Update response:")
        print(res_update.json())

if __name__ == "__main__":
    asyncio.run(main())
