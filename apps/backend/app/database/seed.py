import datetime
from uuid import uuid4
from loguru import logger
from sqlalchemy import select

from app.database.session import async_session_maker
from app.database.database import engine
from app.database.base import metadata
from app.database.models.simulation import Simulation
from app.database.models.metrics import SimulationMetric

async def seed_simulation_data() -> Simulation:
    """
    On startup, checks if the default continuous building simulation run is present.
    If not, creates it and seeds the previous 5 hours of realistic telemetry metrics
    from 2026-07-26T18:00:00 to 2026-07-26T22:00:00.
    Returns the Simulation record.
    """
    # If using local SQLite database, bootstrap tables automatically
    if "sqlite" in str(engine.url):
        logger.info("SQLite engine detected. Bootstrapping schemas dynamically...")
        async with engine.begin() as conn:
            await conn.run_sync(metadata.create_all)
            
    logger.info("Checking database for default simulation seed data...")
    
    async with async_session_maker() as session:
        # Check if default simulation already exists
        query = select(Simulation).where(Simulation.simulation_name == "Continuous Building Twin").limit(1)
        result = await session.execute(query)
        sim = result.scalar_one_or_none()
        
        if sim:
            logger.info("Default Simulation 'Continuous Building Twin' already exists.")
            return sim
            
        # Create new Simulation
        sim_id = uuid4()
        new_sim = Simulation(
            id=sim_id,
            simulation_name="Continuous Building Twin",
            status="running",
            created_at=datetime.datetime.utcnow()
        )
        session.add(new_sim)
        await session.commit()
        
        # Seed 5 hours metrics: 18:00 to 22:00
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
        logger.info(f"Database seeded successfully with 5 hours of telemetry data for run: {sim_id}")
        
        # Refresh and return
        query = select(Simulation).where(Simulation.id == sim_id).limit(1)
        result = await session.execute(query)
        return result.scalar_one()
