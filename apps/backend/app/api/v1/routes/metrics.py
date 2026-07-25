from fastapi import APIRouter, Depends, Query
from app.api.dependencies import get_metrics_service
from app.services.metrics_service import MetricsService
from app.schemas.common import StandardSuccessResponse

router = APIRouter()

@router.get("/metrics", response_model=StandardSuccessResponse)
async def get_latest_metrics(
    service: MetricsService = Depends(get_metrics_service)
):
    data = await service.get_latest_metrics(simulation_id=None)  # Placeholder or get active
    return StandardSuccessResponse(
        success=True,
        data=data,
        message="Metrics retrieved successfully"
    )

@router.get("/history", response_model=StandardSuccessResponse)
async def get_historical_metrics(
    run_id: str = Query(..., description="Simulation Run ID"),
    limit: int = Query(100, description="Records limit"),
    service: MetricsService = Depends(get_metrics_service)
):
    data = await service.get_historical_metrics(run_id=run_id, limit=limit)
    return StandardSuccessResponse(
        success=True,
        data=data,
        message="Historical metrics retrieved successfully"
    )
