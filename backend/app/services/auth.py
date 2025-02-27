import uuid
import jwt
import requests
from fastapi import Depends, HTTPException, Response, WebSocket, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.future import select
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
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI
SECURE_COOKIE = settings.SECURE_COOKIE


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
def create_refresh_token():
    return str(uuid.uuid4())


# Create access and refresh tokens
def create_tokens(data: dict):
    access_token = create_access_token(data)
    refresh_token = create_refresh_token()

    return access_token, refresh_token


# Save refresh token to DB
async def store_refresh_token(db: Session, user_id: str, refresh_token: str):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.refresh_token = refresh_token
    await db.commit()


# verify refresh token
async def verify_refresh_token(refresh_token: str, db: Session):
    stmt = select(User).where(User.refresh_token == refresh_token)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        return None
    return user  # Return user object if valid


# Set refresh token as httpOnly cookie
def set_refresh_token_cookie(
    response: Response,
    refresh_token: str,
    max_age: int = 60 * REFRESH_TOKEN_EXPIRE_MINUTES,
    secure: bool = SECURE_COOKIE,
    httponly: bool = True,
    samesite: str = "lax",
):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=httponly,
        secure=secure,
        samesite=samesite,
        max_age=max_age,
    )


# Delete refresh token cookie
def delete_refresh_token_cookie(
    response: Response,
    secure: bool = SECURE_COOKIE,
    httponly: bool = True,
    samesite: str = "lax",
):
    response.delete_cookie(
        key="refresh_token", secure=secure, httponly=httponly, samesite=samesite
    )


# get user from email or username
async def get_user(db: Session, email: str | None = None, username: str | None = None):
    if email:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        db_user = result.scalars().first()
    elif username:
        stmt = select(User).where(User.username == username)
        result = await db.execute(stmt)
        db_user = result.scalars().first()
    else:
        return None
    return db_user


# authenticate user
async def authenticate_user(username: str, password: str, db: Session):
    db_user = await get_user(username=username, db=db)
    if not db_user:
        return False
    if not verify_password(password, db_user.hashed_password):
        return False
    return db_user


# Get google oauth url
def get_google_oauth_url():
    google_oauth_url = f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline"
    return google_oauth_url


# get user details from google oauth via code
async def get_token_via_google_code(code: str, db: Session):
    try:
        # Step 1: Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        response = requests.post(token_url, data=data)

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get access token from Google",
            )

        access_token = response.json().get("access_token")

        # Step 2: Retrieve user info from Google
        user_info = requests.get(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_info.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google",
            )

        user_info_data = user_info.json()
        email = user_info_data.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account did not return an email",
            )

        # Step 3: Check if user exists in the database
        db_user = await get_user(email=email, db=db)
        if not db_user:
            # Generate a unique username
            username = await generate_unique_username(
                user_info_data.get("email").split("@")[0], db
            )
            db_user = User(
                email=email,
                username=username,
                oauth_provider="google",
                oauth_provider_id=user_info_data.get("id"),
            )
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)

        # Step 4: Generate JWT tokens
        access_token, refresh_token = create_tokens({"id": db_user.id})
        await store_refresh_token(
            db=db, user_id=db_user.id, refresh_token=refresh_token
        )

        return access_token, refresh_token

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid code: {str(e)}"
        )


# generate unique username
async def generate_unique_username(base_username: str, db: Session) -> str:
    """
    Generate a unique username based on base_username.
    This function queries the database for existing usernames that
    start with the given base_username and then determines a unique
    username by appending a number if necessary.
    """
    # Query all usernames that start with the base_username (case-insensitive)
    stmt = select(User.username).where(User.username.ilike(f"{base_username}%"))
    result = await db.execute(stmt)
    similar_users = result.scalars().all()

    # Flatten the result into a list of strings
    similar_usernames = [username for (username,) in similar_users]

    # If no user exists with the base username, return it directly.
    if base_username not in similar_usernames:
        return base_username

    # Extract numeric suffixes from existing usernames.
    suffixes = []
    for uname in similar_usernames:
        if uname == base_username:
            suffixes.append(0)
        else:
            suffix = uname.replace(base_username, "")
            if suffix.isdigit():
                suffixes.append(int(suffix))

    # Determine the next available suffix.
    next_suffix = max(suffixes) + 1 if suffixes else 1
    return f"{base_username}{next_suffix}"


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

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    db_user = result.scalars().first()
    if db_user is None:
        raise credentials_exception
    return db_user


# get current active user
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user


# verify logged in user and return token if authenticated
async def verify_logged_in_user_ws(
    websocket: WebSocket, db: Session = Depends(get_db)
) -> str:

    async def credentials_exception():
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing token in sec-websocket-protocol header",
        )

    access_token = websocket.headers.get("sec-websocket-protocol")

    if not access_token:
        await credentials_exception()
    try:
        payload = jwt.decode(access_token, ACCESS_TOKEN_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if user_id is None:
            await credentials_exception()
    except InvalidTokenError:
        await credentials_exception()

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    db_user = result.scalars().first()
    if db_user is None:
        await credentials_exception()
    return access_token
