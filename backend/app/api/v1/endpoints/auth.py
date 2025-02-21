from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import (
    LoginResponse,
    RefreshResponse,
    RegisterRequest,
    UserRegister,
    UserResponse,
)
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.user import User
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_tokens,
    get_current_active_user,
    get_password_hash,
    get_user,
    store_refresh_token,
    verify_refresh_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    Parameters:
    - user (UserRegister): The user to create.
    - db (Session): The database session.

    Returns:
    - UserResponse: The newly created user.

    Raises:
    - HTTPException: If the email or username already exist.
    """
    print(user, flush=True)
    if get_user(email=user.email, db=db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists"
        )
    if get_user(username=user.username, db=db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
        )
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Authenticate user and generate access and refresh tokens.

    This endpoint allows a user to log in by providing their username and
    password. If the credentials are valid, an access token and a refresh
    token are generated and returned. The refresh token is stored in the
    database for future use.

    Parameters:
    - form_data (OAuth2PasswordRequestForm): An object containing the user's
      credentials (username and password).
    - db (Session): The database session dependency.

    Returns:
    - LoginResponse: An object containing the access token, refresh token,
      and token type.

    Raises:
    - HTTPException: If the credentials are incorrect or if the refresh
      token could not be saved to the database.
    """

    user = authenticate_user(
        username=form_data.username, password=form_data.password, db=db
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token, refresh_token = create_tokens(data={"id": user.id})
    user = store_refresh_token(db=db, user_id=user.id, refresh_token=refresh_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Refresh token could not be saved",
        )
    return LoginResponse(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )


@router.post("/refresh")
async def refresh_token(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Refresh the access token using a valid refresh token.

    This endpoint allows a user to obtain a new access token by providing
    a valid refresh token. If the refresh token is invalid or expired,
    an HTTP 401 Unauthorized error is raised.

    Parameters:
    - payload (RegisterRequest): An object containing the refresh token.
    - db (Session): Database session dependency.

    Returns:
    - RefreshResponse: An object containing the new access token and token type.
    """

    refresh_token = payload.refresh_token
    db_user = verify_refresh_token(refresh_token=refresh_token, db=db)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    access_token = create_access_token(data={"id": db_user.id})
    return RefreshResponse(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """
    Remove the refresh token from the current user, effectively logging them out
    """

    db_user = db.query(User).filter(User.id == current_user.id).first()
    db_user.refresh_token = None
    db.commit()
    return JSONResponse(
        status_code=status.HTTP_200_OK, content={"message": "Logout Successful"}
    )
