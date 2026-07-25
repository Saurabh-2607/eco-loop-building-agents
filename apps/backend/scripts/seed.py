import asyncio
import sys
import os
from datetime import datetime, timedelta
from uuid import uuid4

# Insert backend root directory into sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_root)

from app.database.session import async_session_maker
from app.database.models.simulation import Simulation
from app.database.models.metrics import SimulationMetric
from app.database.models.ai_decision import AIDecision
from app.database.models.optimization import Optimization
from app.database.models.logs import DBLog

async def seed_data():
    print("Connecting to database for seeding...")
    async with async_session_maker() as session:
        # 1. Create a Demo Simulation
        sim_id = uuid4()
        demo_sim = Simulation(
            id=sim_id,
            simulation_name="Small Office Chicago TMY3",
            status="finished",
            created_at=datetime.utcnow() - timedelta(days=1),
            updated_at=datetime.utcnow()
        )
        session.add(demo_sim)
        print(f"Adding simulation: {demo_sim.simulation_name} ({sim_id})")

        # 2. Add time-series Metrics (24 hours, one every hour)
        base_time = datetime.utcnow() - timedelta(hours=24)
        for i in range(24):
            recorded_at = base_time + timedelta(hours=i)
            # Create variations in temperature/power
            hour = recorded_at.hour
            is_occupied = 8 <= hour <= 18
            occupants = 85 if is_occupied else 0
            temp = 22.0 + (1.5 if is_occupied else 0.5)
            hvac = 110.0 if is_occupied else 40.0
            lights = 90.0 if is_occupied else 10.0

            metric = SimulationMetric(
                simulation_id=sim_id,
                temperature=temp,
                humidity=50.0 + (5.0 if hour > 12 else 2.0),
                occupancy=occupants,
                energy_usage=hvac + lights,
                hvac_load=hvac,
                lighting_load=lights,
                recorded_at=recorded_at
            )
            session.add(metric)
        print("Generated 24-hour time-series simulation metrics.")

        # 3. Add AI Decisions (e.g. 3 decisions)
        decision_1 = AIDecision(
            simulation_id=sim_id,
            prompt="Optimize thermostat and illumination schedules for 10:00 AM occupants load.",
            reasoning="Zone A occupancy is high. Adjusted cooling setpoint to 22.5°C to handle internal heat load.",
            action="COOLING_SETPOINT=22.5; LIGHTS_DIM=90",
            confidence=0.95,
            model="qwen3:8b",
            latency=1.8,
            created_at=base_time + timedelta(hours=10)
        )
        decision_2 = AIDecision(
            simulation_id=sim_id,
            prompt="Optimize thermostat schedules for 2:00 PM peak price utility window.",
            reasoning="Peak tariff period detected. Raised cooling setpoint by 1.0°C to shed utility grid loads.",
            action="COOLING_SETPOINT=23.5; LIGHTS_DIM=75",
            confidence=0.92,
            model="qwen3:8b",
            latency=2.1,
            created_at=base_time + timedelta(hours=14)
        )
        session.add(decision_1)
        session.add(decision_2)
        print("Generated AI optimization decisions logs.")

        # 4. Add Optimization histories
        opt_1 = Optimization(
            simulation_id=sim_id,
            energy_before=150.0,
            energy_after=125.0,
            saving_percent=16.6,
            comfort_score=94.5,
            created_at=base_time + timedelta(hours=10)
        )
        opt_2 = Optimization(
            simulation_id=sim_id,
            energy_before=160.0,
            energy_after=130.0,
            saving_percent=18.7,
            comfort_score=91.2,
            created_at=base_time + timedelta(hours=14)
        )
        session.add(opt_1)
        session.add(opt_2)
        print("Generated performance optimization histories.")

        # 5. Add Database logs
        log_1 = DBLog(level="INFO", source="backend", message="API Startup completed successfully.")
        log_2 = DBLog(level="INFO", source="simulator", message="EnergyPlus engine step loop running Chicago TMY3 EPW weather.")
        log_3 = DBLog(level="WARNING", source="agent", message="Local Ollama response latency exceeded 2.0 seconds.")
        session.add(log_1)
        session.add(log_2)
        session.add(log_3)
        print("Generated core system logs.")

        # Commit all entities
        await session.commit()
        print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
