from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.base_repository import BaseRepository
from app.database.models.ai_decision import AIDecision

class AIDecisionRepository(BaseRepository[AIDecision]):
    def __init__(self, session: AsyncSession):
        super().__init__(AIDecision, session)

    async def get_by_simulation_id(self, simulation_id: str, limit: int = 100) -> List[AIDecision]:
        """
        Get all AI decisions associated with a simulation.
        """
        query = (
            select(AIDecision)
            .where(AIDecision.simulation_id == simulation_id)
            .order_by(AIDecision.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
