from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings, Settings
from app.database.session import get_db
from app.energyplus.simulation_service import SimulationService
from app.services.metrics_service import MetricsService
from app.services.optimization_service import OptimizationService
from app.services.dashboard_service import DashboardService
from app.services.health_service import HealthService
from app.websocket.manager import WebSocketManager, ws_manager

def get_settings() -> Settings:
    """
    Returns settings configurations.
    """
    return settings

def get_websocket_manager() -> WebSocketManager:
    """
    Returns the WebSocket manager singleton.
    """
    return ws_manager

def get_simulation_service(db: AsyncSession = Depends(get_db)) -> SimulationService:
    return SimulationService(db)

def get_metrics_service(db: AsyncSession = Depends(get_db)) -> MetricsService:
    return MetricsService(db)

def get_optimization_service(db: AsyncSession = Depends(get_db)) -> OptimizationService:
    return OptimizationService(db)

def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(db)

def get_health_service(db: AsyncSession = Depends(get_db)) -> HealthService:
    return HealthService(db)
