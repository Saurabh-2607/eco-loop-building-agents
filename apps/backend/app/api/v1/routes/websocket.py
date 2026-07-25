from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.api.dependencies import get_websocket_manager
from app.websocket.manager import WebSocketManager
from uuid import uuid4
from loguru import logger

router = APIRouter()

@router.websocket("/ws/live")
async def websocket_endpoint(
    websocket: WebSocket,
    manager: WebSocketManager = Depends(get_websocket_manager)
):
    # Generate client tracking session ID
    client_id = f"client-{uuid4().hex[:6]}"
    
    # Accept client handshake
    await manager.connect(websocket, client_id)
    
    # Send handshake acknowledgement
    await websocket.send_json({"event": "HANDSHAKE", "status": "Connected", "client_id": client_id})
    
    try:
        while True:
            # Maintain active connection wait state
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
