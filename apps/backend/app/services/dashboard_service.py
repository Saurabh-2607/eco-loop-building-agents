from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.services.simulation_service import SimulationService
from app.services.metrics_service import MetricsService
from app.services.optimization_service import OptimizationService
from app.schemas.dashboard import DashboardResponse, SystemStatusResponse
from app.core.config import settings
from loguru import logger
import redis.asyncio as aioredis
import httpx

class DashboardService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.sim_service = SimulationService(session)
        self.metrics_service = MetricsService(session)
        self.opt_service = OptimizationService(session)

    async def get_dashboard_data(self) -> DashboardResponse:
        """
        Aggregate simulation metrics, recent decisions, optimizations and system parameters.
        """
        logger.debug("Aggregating dashboard parameters...")
        
        latest_sim = None
        metrics = None
        recent_decisions = []
        optimization = None
        db_status = "connected"
        
        # 1. Fetch simulation records from DB (fail-safe wrapper)
        try:
            # Quick database ping check
            await self.session.execute(select(1))
            
            # Fetch latest simulation statistics
            latest_sim = await self.sim_service.get_latest_simulation()
            if latest_sim:
                metrics = await self.metrics_service.get_latest_metrics(latest_sim.id)
                recent_decisions = await self.opt_service.get_recent_decisions(latest_sim.id, limit=5)
                optimization = await self.opt_service.get_latest_optimization(latest_sim.id)
        except Exception as e:
            logger.error(f"Database query or connection failed: {e}")
            db_status = "disconnected"

        # 2. Query system status components pings
        redis_status = "disconnected"
        try:
            r = aioredis.from_url(settings.REDIS_URL, socket_timeout=1.0)
            if await r.ping():
                redis_status = "connected"
            await r.close()
        except Exception as e:
            logger.debug(f"Redis ping check failed: {e}")

        ollama_status = "disconnected"
        try:
            async with httpx.AsyncClient(timeout=1.0) as client:
                res = await client.get(f"{settings.OLLAMA_HOST}/")
                if res.status_code == 200:
                    ollama_status = "connected"
        except Exception as e:
            logger.debug(f"Ollama host check failed: {e}")

        system_status = SystemStatusResponse(
            database=db_status,
            api="running",
            redis=redis_status,
            ollama=ollama_status,
            version="1.0.0"
        )

        return DashboardResponse(
            metrics=metrics,
            simulation=latest_sim,
            recent_decisions=recent_decisions,
            optimization=optimization,
            system_status=system_status
        )
