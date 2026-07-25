from typing import List
from fastapi import WebSocket
from loguru import logger

class WebSocketService:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Accept and register new WebSocket connection.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """
        Deregister connection when a client disconnects.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Send message directly to a single client.
        """
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        """
        Broadcast JSON messages to all registered connections.
        """
        logger.debug(f"Broadcasting message to {len(self.active_connections)} clients: {message}")
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                # Catch closed/dead socket errors and prune them
                logger.error(f"Failed to send websocket broadcast: {e}")
                self.disconnect(connection)
