from fastapi import APIRouter, Depends
from app.api.dependencies import get_dashboard_service
from app.services.dashboard_service import DashboardService
from app.schemas.common import StandardSuccessResponse
from app.schemas.dashboard import DashboardResponse

router = APIRouter()

@router.get("", response_model=StandardSuccessResponse[DashboardResponse])
async def get_dashboard_data(
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_dashboard_data()
    return StandardSuccessResponse(
        success=True,
        data=data,
        message="Dashboard data aggregated successfully"
    )
