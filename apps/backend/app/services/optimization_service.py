import json
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from loguru import logger

from app.database.repositories.optimization_repository import OptimizationRepository
from app.database.repositories.ai_decision_repository import AIDecisionRepository
from app.database.repositories.metrics_repository import MetricsRepository
from app.database.repositories.simulation_repository import SimulationRepository
from app.database.models.optimization import Optimization
from app.database.models.ai_decision import AIDecision
from app.schemas.optimization import AIDecisionCreate, OptimizationCreate
from app.optimization import FeatureExtractor, Optimizer
from app.core.custom_exceptions import DatabaseException, SimulationException

class OptimizationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.optimization_repo = OptimizationRepository(session)
        self.ai_decision_repo = AIDecisionRepository(session)
        self.metrics_repo = MetricsRepository(session)
        self.simulation_repo = SimulationRepository(session)

    async def trigger_optimization(self, simulation_id: Optional[UUID] = None) -> dict:
        """
        Runs deterministic building optimization on simulation metrics, registers results,
        and saves AI decisions.
        """
        if not simulation_id:
            from app.database.models.simulation import Simulation
            query = select(Simulation).order_by(Simulation.created_at.desc()).limit(1)
            result = await self.session.execute(query)
            latest_sim = result.scalars().first()
            if not latest_sim:
                raise SimulationException("No simulations found to optimize.")
            simulation_id = latest_sim.id

        logger.info(f"Triggering building optimization pass for simulation {simulation_id}")
        
        # 1. Fetch simulation metrics
        metrics = await self.metrics_repo.get_by_simulation_id(simulation_id)
        if not metrics:
            logger.warning(f"No metrics found for simulation {simulation_id}. FeatureExtractor will fall back to baseline.")
            
        # 2. Extract features & optimize
        features = FeatureExtractor.extract(metrics)
        report = Optimizer.run(features)
        
        # 3. Save optimization summary record
        energy_before = features.total_energy_kwh
        savings_frac = report.estimated_savings_percent / 100.0
        energy_after = energy_before * (1.0 - savings_frac)
        
        opt_record = Optimization(
            simulation_id=simulation_id,
            energy_before=round(energy_before, 2),
            energy_after=round(energy_after, 2),
            saving_percent=report.estimated_savings_percent,
            comfort_score=report.overall_score
        )
        try:
            await self.optimization_repo.create(opt_record)
        except Exception as e:
            logger.error(f"Failed to save optimization summary: {e}")
            raise DatabaseException(f"Failed to save optimization: {e}")
            
        # 4. Save combined AI decision record mapping recommendations
        recommendations_summary = "\n".join(
            f"- [{r.priority}] ({r.category}): {r.recommendation} (Est. Savings: {r.estimated_savings_percent}%)"
            for r in report.recommendations
        )
        
        ai_decision = AIDecision(
            simulation_id=simulation_id,
            prompt="Triggered Deterministic Building Optimization Engine",
            reasoning=f"Building score is {report.overall_score}. Recommendations generated:\n{recommendations_summary}",
            action=json.dumps([r.model_dump() for r in report.recommendations]),
            confidence=1.0,
            model="Deterministic Rule Engine",
            latency=0.01
        )
        try:
            await self.ai_decision_repo.create(ai_decision)
        except Exception as e:
            logger.error(f"Failed to save AI decision action: {e}")
            raise DatabaseException(f"Failed to log AI decision: {e}")
        
        return {
            "overall_score": report.overall_score,
            "estimated_savings_percent": report.estimated_savings_percent,
            "recommendations": [r.model_dump() for r in report.recommendations]
        }

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
