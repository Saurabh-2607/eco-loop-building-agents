from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.repositories.optimization_repository import OptimizationRepository
from app.database.repositories.ai_decision_repository import AIDecisionRepository
from app.database.models.optimization import Optimization
from app.database.models.ai_decision import AIDecision
from app.schemas.optimization import AIDecisionCreate, OptimizationCreate
from app.core.custom_exceptions import DatabaseException
from loguru import logger

class OptimizationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.optimization_repo = OptimizationRepository(session)
        self.ai_decision_repo = AIDecisionRepository(session)

    async def create_ai_decision(self, payload: AIDecisionCreate) -> AIDecision:
        """
        Logs an AI agent's analysis parameters and actions.
        """
        logger.info(f"Logging AI reasoning cycle decision for simulation: {payload.simulation_id}")
        decision = AIDecision(
            simulation_id=payload.simulation_id,
            prompt=payload.prompt,
            reasoning=payload.reasoning,
            action=payload.action,
            confidence=payload.confidence,
            model=payload.model,
            latency=payload.latency
        )
        try:
            return await self.ai_decision_repo.create(decision)
        except Exception as e:
            logger.error(f"Failed to save AI decision: {e}")
            raise DatabaseException(f"Failed to log AI decision: {e}")

    async def create_optimization(self, payload: OptimizationCreate) -> Optimization:
        """
        Logs optimization saving percentages baseline comparison values.
        """
        logger.info(f"Logging optimization results saving percentage: {payload.saving_percent}%")
        opt = Optimization(
            simulation_id=payload.simulation_id,
            energy_before=payload.energy_before,
            energy_after=payload.energy_after,
            saving_percent=payload.saving_percent,
            comfort_score=payload.comfort_score
        )
        try:
            return await self.optimization_repo.create(opt)
        except Exception as e:
            logger.error(f"Failed to save optimization metrics: {e}")
            raise DatabaseException(f"Failed to log optimization history: {e}")

    async def get_recent_decisions(self, simulation_id: UUID, limit: int = 10) -> List[AIDecision]:
        """
        Retrieve recent decisions logged for a simulation.
        """
        return await self.ai_decision_repo.get_by_simulation_id(simulation_id, limit=limit)

    async def get_latest_optimization(self, simulation_id: UUID) -> Optional[Optimization]:
        """
        Get the most recent optimization performance metrics.
        """
        query = (
            select(Optimization)
            .where(Optimization.simulation_id == simulation_id)
            .order_by(Optimization.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        return result.scalars().first()
