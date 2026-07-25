from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.base_repository import BaseRepository
from app.database.models.optimization import Optimization

class OptimizationRepository(BaseRepository[Optimization]):
    def __init__(self, session: AsyncSession):
        super().__init__(Optimization, session)

    async def get_by_simulation_id(self, simulation_id: str, limit: int = 100) -> List[Optimization]:
        """
        Get all optimization histories associated with a simulation.
        """
        query = (
            select(Optimization)
            .where(Optimization.simulation_id == simulation_id)
            .order_by(Optimization.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
