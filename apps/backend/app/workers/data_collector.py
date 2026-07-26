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

# Local memory fallback buffer for raw sub-hourly telemetry
local_raw_buffers = {}

async def run_data_collector():
    """
    Background worker that subscribes to the raw simulator output feed,
    buffers sub-hourly telemetry points, aggregates them on simulated hour boundaries,
    commits the averaged hourly metrics to the SQL database,
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
                
                logger.info(f"Data Collector: Received raw sub-hourly telemetry for step: {step}")
                
                redis_key = f"simulation:{run_id}:raw_metrics"
                pushed_to_redis = False
                
                # Push data point to Redis list if active
                if pubsub_broker.use_redis and pubsub_broker.redis_client:
                    try:
                        await pubsub_broker.redis_client.rpush(redis_key, json.dumps(data))
                        await pubsub_broker.redis_client.expire(redis_key, 86400)
                        pushed_to_redis = True
                    except Exception as redis_err:
                        logger.warning(f"Data Collector: Redis list push failed, using local memory: {redis_err}")
                
                # Fallback to local memory buffer
                if not pushed_to_redis:
                    if run_id not in local_raw_buffers:
                        local_raw_buffers[run_id] = []
                    local_raw_buffers[run_id].append(data)
                
                # Fetch count of currently buffered sub-hourly steps
                buffered_count = 0
                if pubsub_broker.use_redis and pubsub_broker.redis_client and pushed_to_redis:
                    try:
                        buffered_count = await pubsub_broker.redis_client.llen(redis_key)
                    except Exception as redis_err:
                        logger.warning(f"Data Collector: Redis llen failed: {redis_err}")
                        buffered_count = len(local_raw_buffers.get(run_id, []))
                else:
                    buffered_count = len(local_raw_buffers.get(run_id, []))
                
                # If 4 sub-hourly steps (representing 1 hour) are buffered, run aggregation
                if buffered_count >= 4:
                    raw_points = []
                    if pubsub_broker.use_redis and pubsub_broker.redis_client and pushed_to_redis:
                        try:
                            elements = await pubsub_broker.redis_client.lrange(redis_key, 0, -1)
                            await pubsub_broker.redis_client.delete(redis_key)
                            raw_points = [json.loads(el) for el in elements]
                        except Exception as redis_err:
                            logger.warning(f"Data Collector: Redis lrange/delete failed: {redis_err}")
                            raw_points = local_raw_buffers.pop(run_id, [])
                    else:
                        raw_points = local_raw_buffers.pop(run_id, [])
                    
                    if not raw_points:
                        continue
                    
                    # Compute averaged metrics for Comfort, Occupancy and Load curves
                    num_points = len(raw_points)
                    avg_indoor_temp = sum(float(p.get("indoor_temp", 22.0)) for p in raw_points) / num_points
                    avg_outdoor_temp = sum(float(p.get("outdoor_temp", 28.0)) for p in raw_points) / num_points
                    avg_humidity = sum(float(p.get("humidity", 45.0)) for p in raw_points) / num_points
                    avg_occupancy = sum(float(p.get("occupancy", 0.0)) for p in raw_points) / num_points
                    avg_hvac_power = sum(float(p.get("hvac_power", 0.0)) for p in raw_points) / num_points
                    avg_lighting_power = sum(float(p.get("lighting_power", 0.0)) for p in raw_points) / num_points
                    avg_energy = sum(float(p.get("energy", 0.0)) for p in raw_points) / num_points
                    
                    # Retrieve timestamp from the hour-boundary step
                    last_point = raw_points[-1]
                    timestamp = last_point.get("timestamp", datetime.utcnow().strftime("%H:%M"))
                    recorded_at_str = last_point.get("recorded_at")
                    
                    # Map the raw step index to a 1-24 simulated hour step
                    hourly_step = (step + 3) // 4
                    
                    # 1. Commit averaged metrics to the PostgreSQL database
                    async with async_session_maker() as session:
                        metrics_repo = MetricsRepository(session)
                        
                        db_metric = SimulationMetric(
                            simulation_id=UUID(run_id),
                            temperature=avg_indoor_temp,
                            humidity=avg_humidity,
                            occupancy=avg_occupancy,
                            energy_usage=avg_energy,
                            hvac_load=avg_hvac_power,
                            lighting_load=avg_lighting_power,
                            recorded_at=datetime.fromisoformat(recorded_at_str)
                        )
                        await metrics_repo.create(db_metric)
                    
                    # 2. Publish processed hourly telemetry event to the building:telemetry channel
                    telemetry_packet = {
                        "event": "ENERGY_UPDATE",
                        "run_id": run_id,
                        "data": {
                            "timestamp": timestamp,
                            "indoor_temp": round(avg_indoor_temp, 2),
                            "outdoor_temp": round(avg_outdoor_temp, 2),
                            "humidity": round(avg_humidity, 2),
                            "occupancy": int(avg_occupancy),
                            "hvac_power": round(avg_hvac_power, 2),
                            "lighting_power": round(avg_lighting_power, 2),
                            "energy": round(avg_energy, 2),
                            "step": hourly_step,
                            "total_steps": 24
                        }
                    }
                    
                    # Publish event to Redis PubSub telemetry topic (triggers AI optimization)
                    await pubsub_broker.publish("building:telemetry", telemetry_packet)
                    
                    # Broadcast simulation progress event to client WebSocket connections (updates graph)
                    ws_progress_event = create_websocket_event("SIMULATION_STEP", telemetry_packet["data"])
                    await ws_manager.broadcast(ws_progress_event)
                    
                    logger.info(f"Data Collector: Processed and published hourly step {hourly_step} (aggregated from {num_points} raw steps).")
                
            except Exception as e:
                logger.error(f"Data Collector: Error processing telemetry: {e}")
                
    except asyncio.CancelledError:
        logger.info("Data Collector Service loop cancelled.")
    except Exception as e:
        logger.error(f"Data Collector Service crashed: {e}")
