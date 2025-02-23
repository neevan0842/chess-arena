from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int

    # Auth
    ACCESS_TOKEN_SECRET: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_MINUTES: int

    # OAuth Google
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # Frontend URL
    FRONTEND_URLS: str

    # Cookie
    SECURE_COOKIE: bool = False

    model_config = ConfigDict(env_file=".env")


settings = Settings()
