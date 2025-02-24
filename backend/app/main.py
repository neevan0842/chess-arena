from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.endpoints import auth, users, game
from app.core.config import settings
from app.core.redis_client import redis_client, is_redis_available

FRONTEND_URLS = settings.FRONTEND_URLS


@asynccontextmanager
async def lifespan(app: FastAPI):
    await is_redis_available()
    yield
    await redis_client.close()


app = FastAPI(lifespan=lifespan, debug=True)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router=auth.router, prefix="/api/v1")
app.include_router(router=users.router, prefix="/api/v1")
app.include_router(router=game.router, prefix="/api/v1")


# Root route
@app.get("/")
async def root():
    return {"message": "Hello World"}


# Healthcheck route
@app.get("/healthcheck", tags=["healthcheck"])
async def healthcheck():
    return {"message": "API Working"}


# Exception handler example
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )
