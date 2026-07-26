import asyncio
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.custom_exceptions import EcoLoopException
from app.api.v1.router import api_router
from app.utils.background_tasks import broadcast_dummy_telemetry_loop

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

from fastapi import WebSocket, WebSocketDisconnect, Depends
from uuid import uuid4
from app.websocket.manager import WebSocketManager
from app.api.dependencies import get_websocket_manager


@app.websocket("/ws/live")
async def websocket_endpoint(
    websocket: WebSocket,
    manager: WebSocketManager = Depends(get_websocket_manager)
):
    client_id = f"client-{uuid4().hex[:6]}"

    await manager.connect(websocket, client_id)

    await websocket.send_json({
        "event": "HANDSHAKE",
        "status": "Connected",
        "client_id": client_id
    })

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {"status": "running", "version": "1.0.0"}

# Custom Application Exception Handler
@app.exception_handler(EcoLoopException)
async def ecoloop_exception_handler(request: Request, exc: EcoLoopException):
    logger.warning(f"Business logic error caught on path {request.url.path}: [{exc.code}] {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception caught on request path {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred while processing the request."
            }
        }
    )

# Task reference tracking
bg_broadcast_task = None

@app.on_event("startup")
async def startup_event():
    global bg_broadcast_task
    logger.info("EcoLoop API application started.")
    bg_broadcast_task = asyncio.create_task(broadcast_dummy_telemetry_loop())

@app.on_event("shutdown")
async def shutdown_event():
    global bg_broadcast_task
    logger.info("EcoLoop API application shutting down.")
    if bg_broadcast_task:
        bg_broadcast_task.cancel()
        try:
            await bg_broadcast_task
        except asyncio.CancelledError:
            pass
