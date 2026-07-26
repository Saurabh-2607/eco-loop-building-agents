import asyncio
import json
from fastapi import FastAPI, Request, status, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from uuid import uuid4

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.custom_exceptions import EcoLoopException
from app.api.v1.router import api_router
from app.core.pubsub import pubsub_broker
from app.workers.data_collector import run_data_collector
from app.workers.optimization_worker import run_optimization_worker
from app.websocket.manager import WebSocketManager
from app.api.dependencies import get_websocket_manager

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

    # Task to forward all published Pub/Sub events down the WebSocket to this client
    async def event_forwarder():
        try:
            async for raw_message in pubsub_broker.subscribe("building:events"):
                try:
                    payload = json.loads(raw_message)
                    await websocket.send_json(payload)
                except Exception as ex:
                    logger.error(f"Error forwarding pubsub event to WS client: {ex}")
        except asyncio.CancelledError:
            pass

    forwarder_task = asyncio.create_task(event_forwarder())

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        forwarder_task.cancel()
        try:
            await forwarder_task
        except asyncio.CancelledError:
            pass

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

# Task reference tracking for background workers
bg_data_collector_task = None
bg_optimization_task = None

@app.on_event("startup")
async def startup_event():
    global bg_data_collector_task, bg_optimization_task
    logger.info("EcoLoop API application started.")
    
    # Spawn continuous background tasks
    bg_data_collector_task = asyncio.create_task(run_data_collector())
    bg_optimization_task = asyncio.create_task(run_optimization_worker())

@app.on_event("shutdown")
async def shutdown_event():
    global bg_data_collector_task, bg_optimization_task
    logger.info("EcoLoop API application shutting down.")
    
    if bg_data_collector_task:
        bg_data_collector_task.cancel()
        try:
            await bg_data_collector_task
        except asyncio.CancelledError:
            pass
            
    if bg_optimization_task:
        bg_optimization_task.cancel()
        try:
            await bg_optimization_task
        except asyncio.CancelledError:
            pass
