from fastapi import APIRouter
from app.api.v1.routes import health, metrics, simulation, optimization, websocket

api_router = APIRouter()

# Mount routes with tag groups
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(metrics.router, tags=["metrics"])
api_router.include_router(simulation.router, tags=["simulation"])
api_router.include_router(optimization.router, tags=["optimization"])
api_router.include_router(websocket.router, tags=["websocket"])
