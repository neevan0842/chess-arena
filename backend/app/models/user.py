import uuid
from sqlalchemy import TIMESTAMP, Boolean, Column, String, Text, UUID
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String(50), unique=True, nullable=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(Text, nullable=True)  # NULL if using OAuth
    oauth_provider = Column(String(50), nullable=True)  # 'google' or NULL
    oauth_provider_id = Column(String(255), unique=True, nullable=True)  # GOOGLE ID
    refresh_token = Column(Text, nullable=True)

    is_active = Column(Boolean(), default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
