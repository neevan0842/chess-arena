from redis.asyncio import Redis, ConnectionError
from app.core.config import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True,
)


async def is_redis_available() -> bool:
    """Check if connection to Redis is available."""
    try:
        await redis_client.ping()
        print("Redis is available", flush=True)
        return True
    except ConnectionError:
        print("Redis is not available", flush=True)
        return False
