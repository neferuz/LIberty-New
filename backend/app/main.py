from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine, Base, get_db
from app import models # Import models to ensure they are registered

Base.metadata.create_all(bind=engine)

# Inline database migration for addresses_json column
try:
    from sqlalchemy import text
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN addresses_json TEXT"))
        print("Successfully migrated: Added addresses_json column to users table.")
except Exception as e:
    # Column already exists, fail silently is normal
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to Liberty Wear API", "version": "1.0.1"}
