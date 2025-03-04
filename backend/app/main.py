from contextlib import asynccontextmanager
import chess
import chess.engine
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.endpoints import auth, users, game, ws
from app.core.config import settings
from app.core.redis_client import redis_client, is_redis_available
from app.middlewares.logger import LoggingMiddleware

FRONTEND_URLS = settings.FRONTEND_URLS
STOCKFISH_PATH = settings.STOCKFISH_PATH


@asynccontextmanager
async def lifespan(app: FastAPI):
    await is_redis_available()
    transport, engine = await chess.engine.popen_uci(STOCKFISH_PATH)
    app.state.engine = engine
    try:
        yield
    finally:
        await redis_client.close()
        await engine.quit()


app = FastAPI(lifespan=lifespan)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

app.include_router(router=auth.router, prefix="/api/v1")
app.include_router(router=users.router, prefix="/api/v1")
app.include_router(router=game.router, prefix="/api/v1")
app.include_router(router=ws.router, prefix="/api/v1")


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
