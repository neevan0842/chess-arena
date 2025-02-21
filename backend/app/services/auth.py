import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import settings
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.dependencies import get_db
from jwt.exceptions import InvalidTokenError


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ACCESS_TOKEN_SECRET = settings.ACCESS_TOKEN_SECRET
ALGORITHM = settings.ALGORITHM
REFRESH_TOKEN_EXPIRE_MINUTES = settings.REFRESH_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_SECRET = settings.REFRESH_TOKEN_SECRET


# Hash password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Create access token
def create_access_token(data: dict):
    access_token_expires = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = data.copy()
    to_encode.update({"exp": access_token_expires})
    encoded_jwt = jwt.encode(to_encode, ACCESS_TOKEN_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


# create refresh token
def create_refresh_token(data: dict):
    refresh_token_expires = datetime.now(timezone.utc) + timedelta(
        minutes=REFRESH_TOKEN_EXPIRE_MINUTES
    )
    to_encode = data.copy()
    to_encode.update({"exp": refresh_token_expires})
    encoded_jwt = jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


# Create access and refresh tokens
def create_tokens(data: dict):
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)

    return access_token, refresh_token


# Save refresh token to DB
def store_refresh_token(db: Session, user_id: str, refresh_token: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.refresh_token = refresh_token
    else:
        return None
    db.commit()
    return user


# verify refresh token
def verify_refresh_token(refresh_token: str, db: Session):
    try:
        payload = jwt.decode(
            refresh_token, REFRESH_TOKEN_SECRET, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("id")
        if user_id is None:
            return None
    except InvalidTokenError:
        return None
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    if db_user.refresh_token != refresh_token:
        return None
    return db_user


# get user from email or username
def get_user(db: Session, email: str | None = None, username: str | None = None):
    if email:
        db_user = db.query(User).filter(User.email == email).first()
    elif username:
        db_user = db.query(User).filter(User.username == username).first()
    else:
        return None
    return db_user


# authenticate user
def authenticate_user(username: str, password: str, db: Session):
    db_user = get_user(username=username, db=db)
    if not db_user:
        return False
    if not verify_password(password, db_user.hashed_password):
        return False
    return db_user


# get current users
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise credentials_exception
    return db_user


# get current active user
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user
