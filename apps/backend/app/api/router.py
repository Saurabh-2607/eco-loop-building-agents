from fastapi import APIRouter
from app.api.endpoints import health, metrics, simulation, optimize, history

api_router = APIRouter()

# Register sub-routers with prefixes matching target specifications
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(optimize.router, prefix="/optimize", tags=["optimize"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
