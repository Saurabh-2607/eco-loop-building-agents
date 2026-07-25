from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings, Settings
from app.database.database import get_db_session
from app.services.metrics_service import MetricsService
from app.services.simulation_service import SimulationService
from app.services.optimization_service import OptimizationService
from app.services.websocket_service import WebSocketService

# WebSocketService singleton instance to be shared across threads/requests
_ws_service_instance = WebSocketService()

def get_settings() -> Settings:
    """
    Returns settings configurations singleton.
    """
    return settings

def get_db() -> AsyncSession:
    """
    Returns database session context generator.
    """
    return get_db_session()

def get_websocket_service() -> WebSocketService:
    """
    Returns WebSocket service manager singleton.
    """
    return _ws_service_instance

def get_metrics_service(db: AsyncSession = Depends(get_db_session)) -> MetricsService:
    """
    Returns metrics service instances.
    """
    return MetricsService(repository=None)

def get_simulation_service(db: AsyncSession = Depends(get_db_session)) -> SimulationService:
    """
    Returns simulation service instances.
    """
    return SimulationService(repository=None)

def get_optimization_service(db: AsyncSession = Depends(get_db_session)) -> OptimizationService:
    """
    Returns optimization service instances.
    """
    return OptimizationService(repository=None)
