import asyncio
import random
from datetime import datetime, timedelta
from uuid import UUID
from loguru import logger

from app.core.pubsub import pubsub_broker

class SimulationWorker:
    def __init__(self):
        self.active_tasks = {}

    def start_simulation_task(self, sim_id: UUID, name: str, start_step: int = 1):
        """
        Starts a non-blocking background task to run the step-by-step simulation.
        """
        task = asyncio.create_task(self._run_simulation_steps(sim_id, name, start_step))
        self.active_tasks[sim_id] = task
        return task

    async def _run_simulation_steps(self, sim_id: UUID, name: str, start_step: int = 1):
        logger.info(f"Starting real-time simulation worker loop for run: {sim_id} at start_step: {start_step}")
        
        try:
            # 1. Publish start event
            await pubsub_broker.publish("building:events", {
                "event": "SIMULATION_STARTED",
                "run_id": str(sim_id),
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Initial conditions
            current_indoor_temp = 24.8  # Match the 22:00 seed temperature
            current_date = datetime.fromisoformat("2026-07-26T17:00:00")
            
            step = start_step
            while True:
                # Retrieve latest overrides in real-time via Controller
                from app.energyplus.controller import energyplus_controller
                overrides = energyplus_controller.get_current_overrides()
                target_hvac = overrides["hvac_setpoint"]
                light_dim = overrides["lighting_dim"]
                
                # Dynamic environmental drift simulation
                hour = (8 + step) % 24  # Start simulation relative to timeline hours
                is_working_hours = 8 <= hour <= 18
                
                # Outdoor diurnal curve model (peak in afternoon)
                outdoor_temp = 20.0 + 10.0 * (1.0 - abs(hour - 14) / 10.0) if 4 <= hour <= 24 else 18.0
                outdoor_temp += random.uniform(-0.5, 0.5)
                
                # Dynamic indoor temperature calculation based on heat gain, outdoor temp and HVAC cooling
                drift_step = (target_hvac - current_indoor_temp) * 0.2 + random.uniform(-0.15, 0.15)
                current_indoor_temp += drift_step
                current_indoor_temp = max(16.0, min(32.0, current_indoor_temp))
                
                # Calculate active occupant count
                base_occupancy = 30 if is_working_hours else 0
                occupancy = max(0, int(base_occupancy + random.randint(-8, 8)))
                
                # HVAC thermal load calculation (energy consumption matches delta between outdoor and target)
                hvac_load = max(1.2, (outdoor_temp - target_hvac) * 2.8) if outdoor_temp > target_hvac else 1.0
                hvac_load += occupancy * 0.05  # body heat load multiplier
                hvac_load = round(max(0.5, hvac_load + random.uniform(-0.2, 0.2)), 2)
                
                # Lighting load based on dimming intensity and solar gain
                daylight_reduction = 0.4 if 11 <= hour <= 15 else 1.0
                lighting_load = round((light_dim / 100.0) * 4.0 * daylight_reduction, 2)
                
                total_energy = round(hvac_load + lighting_load, 2)
                humidity = round(45.0 + random.uniform(-3.0, 3.0), 2)
                
                # Publish raw data stream to the data collector worker
                await pubsub_broker.publish("building:raw_simulator_stream", {
                    "run_id": str(sim_id),
                    "data": {
                        "step": step,
                        "timestamp": (current_date + timedelta(hours=step)).strftime("%H:%M"),
                        "indoor_temp": current_indoor_temp,
                        "outdoor_temp": outdoor_temp,
                        "humidity": humidity,
                        "occupancy": occupancy,
                        "hvac_power": hvac_load,
                        "lighting_power": lighting_load,
                        "energy": total_energy
                    }
                })
                
                step += 1
                # Stream at 5 seconds intervals (hourly scaling)
                await asyncio.sleep(5.0)
            
        except Exception as e:
            logger.exception(f"Error in background simulation loop task: {e}")
            await pubsub_broker.publish("building:events", {
                "event": "SIMULATION_ERROR",
                "run_id": str(sim_id),
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
        finally:
            self.active_tasks.pop(sim_id, None)

simulation_worker = SimulationWorker()
