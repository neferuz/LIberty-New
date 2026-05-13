from fastapi import APIRouter
from app.api.v1.endpoints import products, login, users, pages, orders, bitrix_webhooks, inquiries, chats, search

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(pages.router, prefix="/pages", tags=["pages"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["inquiries"])
api_router.include_router(chats.router, prefix="/chats", tags=["chats"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(bitrix_webhooks.router, prefix="/bitrix-webhooks", tags=["bitrix-webhooks"])
