import asyncio
import random
from datetime import datetime
from loguru import logger
from app.api.dependencies import get_websocket_manager
from app.websocket.events import create_websocket_event

async def broadcast_dummy_telemetry_loop():
    """
    Periodic task loop that broadcasts fake simulation readings over websocket connections.
    """
    logger.info("Starting background WebSocket broadcast telemetry loop.")
    ws_manager = get_websocket_manager()
    
    try:
        while True:
            if len(ws_manager.connections) > 0:
                # Generate random walk readings
                fake_temp = 22.0 + random.uniform(-0.5, 0.5)
                fake_power = 15.0 + random.uniform(-1.0, 2.0)
                
                event_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "indoor_temp": round(fake_temp, 2),
                    "hvac_power_kw": round(fake_power, 2),
                    "status": "simulating"
                }
                
                logger.debug(f"Broadcasting periodic telemetry updates: {event_data}")
                event = create_websocket_event("SIMULATION_STEP", event_data)
                await ws_manager.broadcast(event)
                
            await asyncio.sleep(3.0)  # Interval every 3 seconds
    except asyncio.CancelledError:
        logger.info("Background telemetry loop task cancelled.")
    except Exception as e:
        logger.error(f"Error in background telemetry broadcast: {e}")
