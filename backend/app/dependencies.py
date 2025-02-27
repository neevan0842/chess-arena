from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import SessionLocal
from app.core.redis_client import redis_client


# get database session
async def get_db():
    async with SessionLocal() as db:
        yield db


# get redis connection
async def get_redis_client():
    yield redis_client
