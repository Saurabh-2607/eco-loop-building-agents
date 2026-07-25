from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.repositories.simulation_repository import SimulationRepository
from app.database.models.simulation import Simulation
from app.core.custom_exceptions import DatabaseException, SimulationException
from loguru import logger

class SimulationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = SimulationRepository(session)

    async def create_simulation(self, name: str) -> Simulation:
        """
        Creates and starts a new simulation run.
        """
        logger.info(f"Creating new simulation run profile: {name}")
        try:
            # Transition any existing running simulations to idle/finished
            active_sims = await self.get_active_simulations()
            for active_sim in active_sims:
                active_sim.status = "finished"
                await self.repository.update(active_sim)
            
            sim = Simulation(simulation_name=name, status="running")
            created_sim = await self.repository.create(sim)
            logger.info(f"Simulation run successfully created: {created_sim.id}")
            return created_sim
        except Exception as e:
            logger.error(f"Failed to create simulation: {e}")
            raise DatabaseException(f"Failed to create simulation run: {e}")

    async def get_simulation_status(self, simulation_id: UUID) -> Simulation:
        """
        Retrieves status of simulation run.
        """
        sim = await self.repository.get_by_id(simulation_id)
        if not sim:
            raise SimulationException(f"Simulation with ID {simulation_id} not found.")
        return sim

    async def update_simulation_status(self, simulation_id: UUID, status: str) -> Simulation:
        """
        Updates the execution status of a simulation.
        """
        logger.info(f"Updating simulation status: {simulation_id} -> {status}")
        sim = await self.repository.get_by_id(simulation_id)
        if not sim:
            raise SimulationException(f"Simulation with ID {simulation_id} not found.")
        sim.status = status
        try:
            updated_sim = await self.repository.update(sim)
            return updated_sim
        except Exception as e:
            raise DatabaseException(f"Failed to update simulation status: {e}")

    async def get_active_simulations(self) -> List[Simulation]:
        """
        Helper returning all simulations marked running.
        """
        query = select(Simulation).where(Simulation.status == "running")
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_latest_simulation(self) -> Optional[Simulation]:
        """
        Helper returning the most recently executed simulation run.
        """
        query = select(Simulation).order_by(Simulation.created_at.desc()).limit(1)
        result = await self.session.execute(query)
        return result.scalars().first()
