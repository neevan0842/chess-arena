import uuid
from sqlalchemy.sql import text
from sqlalchemy import TIMESTAMP, Boolean, Column, String, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(Text, nullable=True)  # NULL if using OAuth
    oauth_provider = Column(String(50), nullable=True)  #'google' or NULL
    oauth_provider_id = Column(String(255), unique=True, nullable=True)  # GOOGLE ID
    refresh_token = Column(Text, nullable=True)
    is_active = Column(Boolean(), default=True)
    created_at = Column(
        TIMESTAMP, server_default=text("CURRENT_TIMESTAMP")
    )  # SQLite-compatible timestamp
