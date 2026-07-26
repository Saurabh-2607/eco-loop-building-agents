import asyncio
import json
from loguru import logger

from app.core.pubsub import pubsub_broker
from app.utils.background_tasks import active_overrides

async def run_realtime_ai_agent():
    """
    Subscribes to simulation telemetry updates, runs active AI optimization reasoning,
    publishes recommendations, and updates active control overrides dynamically.
    """
    logger.info("Starting background Real-Time AI Optimization Agent subscriber loop.")
    
    try:
        async for raw_message in pubsub_broker.subscribe("building:events"):
            try:
                packet = json.loads(raw_message)
                event = packet.get("event")
                run_id = packet.get("run_id")
                
                if event == "ENERGY_UPDATE":
                    step_data = packet.get("data", {})
                    step = step_data.get("step", 0)
                    indoor_temp = step_data.get("indoor_temp", 22.0)
                    occupancy = step_data.get("occupancy", 0)
                    hvac_power = step_data.get("hvac_power", 0.0)
                    
                    # Run AI Audit Analysis every 4 steps (simulated monitoring intervals)
                    if step > 0 and step % 4 == 0:
                        logger.info(f"AI Agent executing control loop check for step: {step}")
                        
                        # 1. Publish AI_ANALYSIS_STARTED event to show "thinking" logs on frontend
                        await pubsub_broker.publish("building:events", {
                            "event": "AI_ANALYSIS_STARTED",
                            "run_id": run_id,
                            "timestamp": step_data.get("timestamp"),
                            "data": {
                                "message": f"Analyzing HVAC thermal load spikes ({hvac_power} kW)...",
                                "step": step
                            }
                        })
                        
                        # Short delay to represent cognitive reasoning latency
                        await asyncio.sleep(1.2)
                        
                        # 2. Compute dynamic recommendations responding to real-time telemetry
                        hvac_setpoint = 22.5
                        lighting_dim = 80
                        reason = ""
                        
                        # HVAC setpoint adjustment reasoning
                        if indoor_temp > 24.0:
                            hvac_setpoint = 21.0
                            reason = f"Indoor temp ({indoor_temp}°C) is warm. Lowering cooling setpoint to 21.0°C to secure comfort bounds."
                        elif indoor_temp < 20.0:
                            hvac_setpoint = 24.0
                            reason = f"Indoor temp ({indoor_temp}°C) is cool. Raising cooling setpoint to 24.0°C to conserve compressor load."
                        else:
                            hvac_setpoint = 22.5
                            reason = f"Optimal temperature ({indoor_temp}°C) detected. Maintaining comfort setpoint at 22.5°C."
                            
                        # Lighting control reasoning based on occupant density
                        if occupancy > 25:
                            lighting_dim = 95
                            reason += f" High building occupancy ({occupancy} people) detected; increasing light output to 95%."
                        elif occupancy < 5:
                            lighting_dim = 25
                            reason += " Zone is empty; dimming interior lights to 25% standby energy conservation mode."
                        else:
                            lighting_dim = 70
                            reason += f" Moderate occupancy ({occupancy} people) detected; scaling light output to 70%."
                            
                        # Projected savings multiplier
                        savings_projection = round(12.0 + (30.0 - hvac_setpoint) * 1.5 - (lighting_dim / 100.0) * 4.0, 1)
                        savings_projection = max(4.0, min(25.0, savings_projection))
                        
                        # 3. Apply overrides back to simulation loop in real-time!
                        active_overrides["hvac_setpoint"] = hvac_setpoint
                        active_overrides["lighting_dim"] = lighting_dim
                        
                        # 4. Broadcast AI_RECOMMENDATION event
                        await pubsub_broker.publish("building:events", {
                            "event": "AI_RECOMMENDATION",
                            "run_id": run_id,
                            "timestamp": step_data.get("timestamp"),
                            "data": {
                                "hvac_setpoint": hvac_setpoint,
                                "lighting_dim": lighting_dim,
                                "reason": reason,
                                "savings": savings_projection,
                                "confidence": "98.4%",
                                "step": step
                            }
                        })
                        logger.info(f"AI recommendation applied and broadcast: Setpoint={hvac_setpoint}, Dim={lighting_dim}")
            except Exception as e:
                logger.error(f"Error handling pubsub message in AI agent: {e}")
    except asyncio.CancelledError:
        logger.info("Real-Time AI Agent task loop cancelled.")
    except Exception as e:
        logger.error(f"Real-Time AI Agent crashed: {e}")
