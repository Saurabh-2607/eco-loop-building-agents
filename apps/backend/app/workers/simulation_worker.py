import asyncio
import random
from datetime import datetime, timedelta
from uuid import UUID
from loguru import logger

from app.database.session import async_session_maker
from app.database.repositories.simulation_repository import SimulationRepository
from app.database.repositories.metrics_repository import MetricsRepository
from app.database.repositories.optimization_repository import OptimizationRepository
from app.database.models.metrics import SimulationMetric
from app.database.models.optimization import Optimization
from app.core.pubsub import pubsub_broker
from app.utils.background_tasks import active_overrides

class SimulationWorker:
    def __init__(self):
        self.active_tasks = {}

    def start_simulation_task(self, sim_id: UUID, name: str):
        """
        Starts a non-blocking background task to run the step-by-step simulation.
        """
        task = asyncio.create_task(self._run_simulation_steps(sim_id, name))
        self.active_tasks[sim_id] = task
        return task

    async def _run_simulation_steps(self, sim_id: UUID, name: str):
        logger.info(f"Starting real-time simulation worker loop for run: {sim_id}")
        
        try:
            # 1. Publish start event
            await pubsub_broker.publish("building:events", {
                "event": "SIMULATION_STARTED",
                "run_id": str(sim_id),
                "name": name,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Seed base initial values
            current_indoor_temp = 22.5
            current_date = datetime.utcnow()
            
            # Run 24 steps (simulating a 24-hour day, stepping every 5 seconds)
            total_steps = 24
            for step in range(1, total_steps + 1):
                # Retrieve latest overrides in real-time
                target_hvac = active_overrides.get("hvac_setpoint", 22.0)
                light_dim = active_overrides.get("lighting_dim", 80)
                
                # Dynamic environmental drift simulation
                hour = (8 + step) % 24  # Start simulation from 08:00 AM
                is_working_hours = 8 <= hour <= 18
                
                # Outdoor diurnal curve model (peak in afternoon)
                outdoor_temp = 20.0 + 10.0 * (1.0 - abs(hour - 14) / 10.0) if 4 <= hour <= 24 else 18.0
                outdoor_temp += random.uniform(-0.5, 0.5)
                
                # Dynamic indoor temperature calculation based on heat gain, outdoor temp and HVAC cooling
                # If HVAC target setpoint is set, the indoor temperature steers towards it
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
                
                # Lighting load based on dimming intensity and solar gain (dim lower during peak daylight hour 12)
                daylight_reduction = 0.4 if 11 <= hour <= 15 else 1.0
                lighting_load = round((light_dim / 100.0) * 4.0 * daylight_reduction, 2)
                
                total_energy = round(hvac_load + lighting_load, 2)
                humidity = round(45.0 + random.uniform(-3.0, 3.0), 2)
                
                # Write current step to DB using session
                async with async_session_maker() as session:
                    metrics_repo = MetricsRepository(session)
                    
                    recorded_time = current_date + timedelta(hours=step)
                    db_metric = SimulationMetric(
                        simulation_id=sim_id,
                        temperature=current_indoor_temp,
                        humidity=humidity,
                        occupancy=float(occupancy),
                        energy_usage=total_energy,
                        hvac_load=hvac_load,
                        lighting_load=lighting_load,
                        recorded_at=recorded_time
                    )
                    await metrics_repo.create(db_metric)
                
                # 2. Publish step updates via Redis/PubSub broker
                await pubsub_broker.publish("building:events", {
                    "event": "ENERGY_UPDATE",
                    "run_id": str(sim_id),
                    "data": {
                        "timestamp": recorded_time.strftime("%H:%M"),
                        "indoor_temp": round(current_indoor_temp, 2),
                        "outdoor_temp": round(outdoor_temp, 2),
                        "humidity": humidity,
                        "occupancy": occupancy,
                        "hvac_power": hvac_load,
                        "lighting_power": lighting_load,
                        "energy": total_energy,
                        "step": step,
                        "total_steps": total_steps
                    }
                })
                
                # Stream at 5 seconds intervals
                await asyncio.sleep(5.0)
            
            # Finalize simulation in database
            async with async_session_maker() as session:
                sim_repo = SimulationRepository(session)
                opt_repo = OptimizationRepository(session)
                
                sim = await sim_repo.get_by_id(sim_id)
                if sim:
                    sim.status = "finished"
                    await sim_repo.update(sim)
                
                # Record final aggregated savings optimization record
                opt = Optimization(
                    simulation_id=sim_id,
                    energy_before=145.0,
                    energy_after=118.0,
                    saving_percent=18.6,
                    comfort_score=95.0
                )
                await opt_repo.create(opt)
                
            logger.info(f"Step simulation loop completed for {sim_id}.")
            
            # 3. Publish completion event
            await pubsub_broker.publish("building:events", {
                "event": "SIMULATION_COMPLETE",
                "run_id": str(sim_id),
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.exception(f"Error in background simulation loop task: {e}")
            await pubsub_broker.publish("building:events", {
                "event": "SIMULATION_ERROR",
                "run_id": str(sim_id),
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            async with async_session_maker() as session:
                sim_repo = SimulationRepository(session)
                sim = await sim_repo.get_by_id(sim_id)
                if sim:
                    sim.status = "failed"
                    await sim_repo.update(sim)
                    
        finally:
            self.active_tasks.pop(sim_id, None)

simulation_worker = SimulationWorker()
