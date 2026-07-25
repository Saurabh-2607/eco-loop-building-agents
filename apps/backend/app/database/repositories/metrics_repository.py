from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.base_repository import BaseRepository
from app.database.models.metrics import SimulationMetric

class MetricsRepository(BaseRepository[SimulationMetric]):
    def __init__(self, session: AsyncSession):
        super().__init__(SimulationMetric, session)

    async def get_by_simulation_id(self, simulation_id: str, limit: int = 100) -> List[SimulationMetric]:
        """
        Get all metrics logged under a single simulation run.
        """
        query = (
            select(SimulationMetric)
            .where(SimulationMetric.simulation_id == simulation_id)
            .order_by(SimulationMetric.recorded_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
