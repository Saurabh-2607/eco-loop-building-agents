import json
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.core.config import settings

from app.database.repositories.metrics_repository import MetricsRepository
from app.database.repositories.ai_decision_repository import AIDecisionRepository
from app.database.models.ai_decision import AIDecision
from app.optimization import FeatureExtractor, Optimizer
from app.ai.graph import compiled_graph

class AIService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.metrics_repo = MetricsRepository(session)
        self.ai_decision_repo = AIDecisionRepository(session)

    async def run_ai_optimization(self, simulation_id: UUID) -> dict:
        """
        Retrieves simulation metrics, runs the deterministic optimization engine,
        spawns the LangGraph AI workflow, and registers the resulting report.
        """
        logger.info(f"Triggering LangGraph AI optimization run for simulation: {simulation_id}")
        
        # 1. Fetch simulation metrics
        metrics = await self.metrics_repo.get_by_simulation_id(simulation_id)
        
        # 2. Extract features & get optimization report
        features = FeatureExtractor.extract(metrics)
        report = Optimizer.run(features)
        
        # 3. Build initial LangGraph state context
        initial_state = {
            "simulation_id": simulation_id,
            "features": features,
            "report": report,
            "analysis": "",
            "explanations": [],
            "final_report": ""
        }
        
        # 4. Invoke LangGraph asynchronously
        try:
            logger.info("Executing LangGraph agent nodes...")
            final_state = await compiled_graph.ainvoke(initial_state)
            final_report = final_state.get("final_report", "")
            explanations = final_state.get("explanations", [])
        except Exception as e:
            logger.error(f"Error running LangGraph pipeline: {e}")
            raise RuntimeError(f"LangGraph execution failed: {e}")
            
        # 5. Commit natural-language report to the AIDecisions database
        ai_decision = AIDecision(
            simulation_id=simulation_id,
            prompt="Structured Building Optimization Report Generation",
            reasoning=final_report,
            action=json.dumps(explanations),
            confidence=0.95,
            model=f"LangGraph + {settings.MODEL_NAME if hasattr(settings, 'MODEL_NAME') else 'qwen3:8b'}",
            latency=0.5
        )
        
        try:
            await self.ai_decision_repo.create(ai_decision)
        except Exception as e:
            logger.error(f"Failed logging LangGraph report to DB: {e}")
            # Do not raise exception, we still return the report
            
        return {
            "overall_score": report.overall_score,
            "estimated_savings_percent": report.estimated_savings_percent,
            "final_report": final_report,
            "recommendations": explanations
        }
