from fastapi import APIRouter, Depends
from app.api.dependencies import get_health_service
from app.services.health_service import HealthService
from app.schemas.common import StandardSuccessResponse

router = APIRouter()

@router.get("", response_model=StandardSuccessResponse)
async def get_health(
    service: HealthService = Depends(get_health_service)
):
    health_data = await service.get_system_health()
    return StandardSuccessResponse(
        success=True,
        data=health_data,
        message="System health status checked successfully"
    )
