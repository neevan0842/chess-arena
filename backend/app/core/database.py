from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import MetaData
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from sqlalchemy.ext.declarative import declarative_base


DATABASE_URL_ASYNC = settings.DATABASE_URL_ASYNC

# Create async engine
engine = create_async_engine(DATABASE_URL_ASYNC, echo=True, future=True)

# Async session factory
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

metadata = MetaData()

Base = declarative_base()
