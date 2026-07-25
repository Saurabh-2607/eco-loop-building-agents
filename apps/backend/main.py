import sys
import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Insert apps/backend into path for package resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router

# Initialize Loguru Sinks
setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include versioned API router under prefix /api/v1
app.include_router(api_router, prefix="/api/v1")

# Mount WS live at the root level also for client ease of connection
from app.api.v1.routes.websocket import router as ws_router
app.include_router(ws_router)

@app.get("/")
def root():
    return {"status": "running", "version": "1.0.0"}

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception caught on request path {request.url.path}: {exc}")
    
    # Return standardized JSON response format on failure
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred while processing the request."
        }
    )

@app.on_event("startup")
async def startup_event():
    logger.info("EcoLoop API application started.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("EcoLoop API application shutting down.")
