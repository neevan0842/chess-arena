from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.future import select
from app.schemas.auth import (
    LoginResponse,
    RefreshResponse,
    UserRegister,
    UserResponse,
)
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.models.user import User
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_tokens,
    delete_refresh_token_cookie,
    get_current_active_user,
    get_google_oauth_url,
    get_password_hash,
    get_token_via_google_code,
    get_user,
    set_refresh_token_cookie,
    store_refresh_token,
    verify_refresh_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user: UserRegister, db: AsyncSession = Depends(get_db)):

    if await get_user(email=user.email, db=db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists"
        )
    if await get_user(username=user.username, db=db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
        )
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):

    user = await authenticate_user(
        username=form_data.username, password=form_data.password, db=db
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token, refresh_token = create_tokens(data={"id": user.id})
    await store_refresh_token(db=db, user_id=user.id, refresh_token=refresh_token)
    # Set refresh token as httpOnly cookie
    set_refresh_token_cookie(response=response, refresh_token=refresh_token)
    return LoginResponse(access_token=access_token, token_type="bearer")


@router.post("/refresh")
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    db_user = await verify_refresh_token(refresh_token=refresh_token, db=db)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    access_token = create_access_token(data={"id": db_user.id})
    return RefreshResponse(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove the refresh token from the current user, effectively logging them out
    """
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    db_user = result.scalars().first()
    db_user.refresh_token = None
    await db.commit()
    delete_refresh_token_cookie(response=response)
    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "Logout Successful"}
    )


@router.get("/google")
async def oauth_google_redirect_url():
    google_oauth_url = get_google_oauth_url()
    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"url": google_oauth_url}
    )


@router.get("/google/callback")
async def oauth_google_callback(
    code: str, response: Response, db: AsyncSession = Depends(get_db)
):
    access_token, refresh_token = await get_token_via_google_code(code, db)
    # Set refresh token as httpOnly cookie
    set_refresh_token_cookie(response=response, refresh_token=refresh_token)
    return LoginResponse(access_token=access_token, token_type="bearer")
