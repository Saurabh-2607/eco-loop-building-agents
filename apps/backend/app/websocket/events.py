from typing import Dict, Any

def create_websocket_event(event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format standard structured WebSocket frames messages.
    """
    return {
        "event": event_type,
        "payload": data
    }
