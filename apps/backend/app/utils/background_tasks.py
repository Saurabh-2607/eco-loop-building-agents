import asyncio
import random
from datetime import datetime
from loguru import logger
from app.websocket.manager import ws_manager
from app.websocket.events import create_websocket_event

# Shared active control overrides (set by frontend/API)
active_overrides = {
    "hvac_setpoint": 22.0,
    "lighting_dim": 80
}

async def broadcast_dummy_telemetry_loop():
    """
    Periodic task loop that broadcasts simulation readings over websocket connections,
    dynamically responding to active user control overrides.
    """
    logger.info("Starting background WebSocket broadcast telemetry loop.")
    
    current_temp = 22.0
    
    try:
        while True:
            if len(ws_manager.connections) > 0:
                # Get target values from overrides
                target_temp = active_overrides.get("hvac_setpoint", 22.0)
                light_dim = active_overrides.get("lighting_dim", 80)
                
                # Steer current temp toward target setpoint with a small step size plus minor noise
                diff = target_temp - current_temp
                current_temp += diff * 0.15 + random.uniform(-0.1, 0.1)
                current_temp = max(16.0, min(32.0, current_temp))
                
                # Model HVAC load based on difference between ambient (assume 28.0°C) and target temp
                hvac_base = max(1.5, (28.0 - target_temp) * 3.5)
                # Model Lighting load based on dimming intensity percentage
                lighting_base = (light_dim / 100.0) * 4.5
                
                # Combine loads with some random variance
                total_power = hvac_base + lighting_base + random.uniform(-0.3, 0.3)
                total_power = max(0.5, total_power)
                
                event_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "indoor_temp": round(current_temp, 2),
                    "hvac_power_kw": round(total_power, 2),
                    "status": "simulating"
                }
                
                logger.debug(f"Broadcasting periodic telemetry updates: {event_data} (Overrides: HVAC={target_temp}°C, Light={light_dim}%)")
                event = create_websocket_event("SIMULATION_STEP", event_data)
                await ws_manager.broadcast(event)
                
            await asyncio.sleep(3.0)  # Interval every 3 seconds
    except asyncio.CancelledError:
        logger.info("Background telemetry loop task cancelled.")
    except Exception as e:
        logger.error(f"Error in background telemetry broadcast: {e}")
