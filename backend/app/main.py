from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.endpoints import auth, users

app = FastAPI(debug=True)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router=auth.router, prefix="/api/v1")
app.include_router(router=users.router, prefix="/api/v1")


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
