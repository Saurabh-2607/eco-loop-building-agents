from typing import List
from fastapi import WebSocket
from app.websocket.connection import ActiveConnection
from loguru import logger

class WebSocketManager:
    def __init__(self):
        self.connections: List[ActiveConnection] = []

    async def connect(self, websocket: WebSocket, client_id: str):
        """
        Accept connection and register into client list.
        """
        await websocket.accept()
        conn = ActiveConnection(websocket, client_id)
        self.connections.append(conn)
        logger.info(f"Registered WebSocket client: {client_id}. Active: {len(self.connections)}")

    def disconnect(self, websocket: WebSocket):
        """
        Remove client connection from registry.
        """
        for conn in self.connections:
            if conn.websocket == websocket:
                self.connections.remove(conn)
                logger.info(f"Deregistered client connection: {conn.client_id}. Remaining: {len(self.connections)}")
                break

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send payload specifically to one client websocket context.
        """
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        """
        Broadcast updates to all active listeners.
        """
        dead_connections = []
        for conn in self.connections:
            try:
                await conn.websocket.send_json(message)
            except Exception as e:
                logger.warning(f"Error during WS broadcast to {conn.client_id}: {e}")
                dead_connections.append(conn.websocket)

        # Cleanup dead websocket connections
        for dead in dead_connections:
            self.disconnect(dead)
