from app.core.database import SessionLocal
from app.core.redis_client import redis_client


# get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# get redis connection
async def get_redis_client():
    yield redis_client
