from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.api.dependencies import get_websocket_service
from app.services.websocket_service import WebSocketService
from loguru import logger

router = APIRouter()

@router.websocket("/ws/live")
async def websocket_endpoint(
    websocket: WebSocket,
    service: WebSocketService = Depends(get_websocket_service)
):
    # Register and accept socket handshake
    await service.connect(websocket)
    
    # Send required initial response
    await websocket.send_text("Connected")
    
    try:
        while True:
            # Receive loop to keep socket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        service.disconnect(websocket)
