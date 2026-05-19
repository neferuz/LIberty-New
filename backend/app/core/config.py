from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
import os

_base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_db_path = os.path.join(_base_dir, "liberty_wear.db")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Liberty Wear API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "liberty_wear"
    SQLALCHEMY_DATABASE_URI: str = f"sqlite:///{_db_path}"

    # Security
    SECRET_KEY: str = "SUPER_SECRET_KEY_FOR_JWT_TOKEN_GEN_CHANGE_IN_PROD"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Payme Keys
    PAYME_MERCHANT_ID: str = "69454dd1656e7b8e815da033"
    PAYME_TEST_KEY: str = "P4@SxSpUsn4o@9xTAyoqUG3&FDwSHQe4Gbip"
    PAYME_KEY: str = "@7wuy2MpOQc&YXhUYiwbHnwARtzJTUohtkxh"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
