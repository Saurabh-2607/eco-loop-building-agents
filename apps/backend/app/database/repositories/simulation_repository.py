from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.base_repository import BaseRepository
from app.database.models.simulation import Simulation

class SimulationRepository(BaseRepository[Simulation]):
    def __init__(self, session: AsyncSession):
        super().__init__(Simulation, session)
