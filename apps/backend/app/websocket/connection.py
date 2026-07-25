from fastapi import WebSocket

class ActiveConnection:
    def __init__(self, websocket: WebSocket, client_id: str):
        self.websocket = websocket
        self.client_id = client_id
