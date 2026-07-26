import asyncio
import json
from uuid import UUID
from loguru import logger
from datetime import datetime, timedelta

from app.core.pubsub import pubsub_broker
from app.database.session import async_session_maker
from app.database.repositories.metrics_repository import MetricsRepository
from app.database.models.metrics import SimulationMetric
from app.websocket.manager import ws_manager
from app.websocket.events import create_websocket_event

async def run_data_collector():
    """
    Background worker that subscribes to the raw simulator output feed,
    polls/collects metrics hourly, commits to the SQL database,
    and publishes processed telemetry events via Redis Pub/Sub.
    """
    logger.info("Starting background Data Collector Service loop.")
    
    try:
        # Subscribe to the raw data stream from the simulator
        async for raw_message in pubsub_broker.subscribe("building:raw_simulator_stream"):
            try:
                packet = json.loads(raw_message)
                run_id = packet.get("run_id")
                data = packet.get("data", {})
                step = data.get("step", 1)
                
                logger.info(f"Data Collector: Received raw telemetry for simulated hour step: {step}")
                
                # Parse variables pooled from the simulator
                indoor_temp = float(data.get("indoor_temp", 22.0))
                outdoor_temp = float(data.get("outdoor_temp", 28.0))
                humidity = float(data.get("humidity", 45.0))
                occupancy = float(data.get("occupancy", 0.0))
                hvac_power = float(data.get("hvac_power", 0.0))
                lighting_power = float(data.get("lighting_power", 0.0))
                energy = float(data.get("energy", 0.0))
                timestamp = data.get("timestamp", datetime.utcnow().strftime("%H:%M"))
                
                # 1. Commit metrics to the database on an hourly basis
                async with async_session_maker() as session:
                    metrics_repo = MetricsRepository(session)
                    
                    db_metric = SimulationMetric(
                        simulation_id=UUID(run_id),
                        temperature=indoor_temp,
                        humidity=humidity,
                        occupancy=occupancy,
                        energy_usage=energy,
                        hvac_load=hvac_power,
                        lighting_load=lighting_power,
                        recorded_at=datetime.utcnow() + timedelta(hours=step)
                    )
                    await metrics_repo.create(db_metric)
                
                # 2. Publish processed telemetry event via Redis/PubSub broker to the building:telemetry channel
                telemetry_packet = {
                    "event": "ENERGY_UPDATE",
                    "run_id": run_id,
                    "data": {
                        "timestamp": timestamp,
                        "indoor_temp": round(indoor_temp, 2),
                        "outdoor_temp": round(outdoor_temp, 2),
                        "humidity": round(humidity, 2),
                        "occupancy": int(occupancy),
                        "hvac_power": round(hvac_power, 2),
                        "lighting_power": round(lighting_power, 2),
                        "energy": round(energy, 2),
                        "step": step,
                        "total_steps": 24
                    }
                }
                
                # Publish event to Redis PubSub telemetry topic
                await pubsub_broker.publish("building:telemetry", telemetry_packet)
                
                # Broadcast simulation progress event to client WebSocket connections
                ws_progress_event = create_websocket_event("SIMULATION_STEP", telemetry_packet["data"])
                await ws_manager.broadcast(ws_progress_event)
                
                logger.debug(f"Data Collector: Processed and published step {step} hourly telemetry.")
                
            except Exception as e:
                logger.error(f"Data Collector: Error processing telemetry: {e}")
                
    except asyncio.CancelledError:
        logger.info("Data Collector Service loop cancelled.")
    except Exception as e:
        logger.error(f"Data Collector Service crashed: {e}")
