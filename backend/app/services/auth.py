import jwt
import requests
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
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI


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
        db_user = get_user(email=email, db=db)
        if not db_user:
            # Generate a unique username
            username = await generate_unique_username(
                user_info_data.get("email").split("@")[0], db
            )
            user = User(
                email=email,
                username=username,
                oauth_provider="google",
                oauth_provider_id=user_info_data.get("id"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            db_user = user

        # Step 4: Generate JWT tokens
        access_token, refresh_token = create_tokens({"id": db_user.id})
        store_refresh_token(db=db, user_id=db_user.id, refresh_token=refresh_token)

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
    similar_users = (
        db.query(User.username).filter(User.username.ilike(f"{base_username}%")).all()
    )

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

    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise credentials_exception
    return db_user


# get current active user
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user
