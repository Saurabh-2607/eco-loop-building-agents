import asyncio
import sys
import os
import datetime
from uuid import UUID

# Insert backend root directory into sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_root)

from app.database.database import engine
from app.database.base import metadata
from app.database.session import async_session_maker
from app.database.models.simulation import Simulation
from app.database.models.metrics import SimulationMetric

async def seed_data():
    print(f"Connecting to database engine: {engine.url}")
    
    # 1. Bootstrap schema tables dynamically
    async with engine.begin() as conn:
        print("Bootstrapping database schema tables...")
        await conn.run_sync(metadata.create_all)
        
    async with async_session_maker() as session:
        # Create simulation run
        sim_id = UUID("00000000-0000-0000-0000-000000000001")
        
        # Check if already seeded
        from sqlalchemy import select
        query = select(Simulation).where(Simulation.id == sim_id).limit(1)
        result = await session.execute(query)
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Database has already been seeded with the Continuous Building Twin.")
            return

        demo_sim = Simulation(
            id=sim_id,
            simulation_name="Continuous Building Twin",
            status="running",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        session.add(demo_sim)
        print(f"Adding simulation: {demo_sim.simulation_name} ({sim_id})")

        # Seeding 5 hours metrics: 18:00 to 22:00 on 26 July 2026
        seed_points = [
            {
                "time": "2026-07-26T18:00:00",
                "temp": 22.0,
                "hvac": 117.43,
                "light": 40.0,
                "energy": 157.43,
                "occupancy": 85.0,
                "humidity": 48.0
            },
            {
                "time": "2026-07-26T19:00:00",
                "temp": 23.5,
                "hvac": 95.20,
                "light": 30.0,
                "energy": 125.20,
                "occupancy": 70.0,
                "humidity": 47.0
            },
            {
                "time": "2026-07-26T20:00:00",
                "temp": 24.0,
                "hvac": 65.50,
                "light": 20.0,
                "energy": 85.50,
                "occupancy": 45.0,
                "humidity": 45.0
            },
            {
                "time": "2026-07-26T21:00:00",
                "temp": 24.5,
                "hvac": 45.30,
                "light": 10.0,
                "energy": 55.30,
                "occupancy": 20.0,
                "humidity": 44.0
            },
            {
                "time": "2026-07-26T22:00:00",
                "temp": 24.8,
                "hvac": 30.0,
                "light": 5.0,
                "energy": 35.0,
                "occupancy": 5.0,
                "humidity": 45.0
            }
        ]

        for p in seed_points:
            metric = SimulationMetric(
                simulation_id=sim_id,
                temperature=p["temp"],
                humidity=p["humidity"],
                occupancy=p["occupancy"],
                energy_usage=p["energy"],
                hvac_load=p["hvac"],
                lighting_load=p["light"],
                recorded_at=datetime.datetime.fromisoformat(p["time"])
            )
            session.add(metric)
            
        await session.commit()
        print("Database seeded with 5 hours of historical telemetry metrics successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
