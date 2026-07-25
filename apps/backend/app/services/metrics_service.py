from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.repositories.metrics_repository import MetricsRepository
from app.database.models.metrics import SimulationMetric
from app.schemas.metrics import MetricCreate
from app.core.custom_exceptions import DatabaseException
from loguru import logger

class MetricsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = MetricsRepository(session)

    async def add_metric(self, payload: MetricCreate) -> SimulationMetric:
        """
        Persists a new sensor metric into the database.
        """
        logger.debug(f"Logging new metrics entry for simulation: {payload.simulation_id}")
        metric = SimulationMetric(
            simulation_id=payload.simulation_id,
            temperature=payload.temperature,
            humidity=payload.humidity,
            occupancy=payload.occupancy,
            energy_usage=payload.energy_usage,
            hvac_load=payload.hvac_load,
            lighting_load=payload.lighting_load
        )
        try:
            created_metric = await self.repository.create(metric)
            return created_metric
        except Exception as e:
            logger.error(f"Failed to save simulation metrics: {e}")
            raise DatabaseException(f"Failed to persist metrics: {e}")

    async def get_latest_metrics(self, simulation_id: UUID) -> Optional[SimulationMetric]:
        """
        Get the most recent metric recorded for a simulation.
        """
        query = (
            select(SimulationMetric)
            .where(SimulationMetric.simulation_id == simulation_id)
            .order_by(SimulationMetric.recorded_at.desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_historical_metrics(self, simulation_id: UUID, limit: int = 100) -> List[SimulationMetric]:
        """
        Get historical database metrics list logs.
        """
        return await self.repository.get_by_simulation_id(simulation_id, limit=limit)
