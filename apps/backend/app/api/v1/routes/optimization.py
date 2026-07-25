from fastapi import APIRouter, Depends
from app.api.dependencies import get_optimization_service
from app.services.optimization_service import OptimizationService
from app.schemas.responses import StandardSuccessResponse

router = APIRouter()

@router.post("/optimize", response_model=StandardSuccessResponse)
async def trigger_optimization(
    service: OptimizationService = Depends(get_optimization_service)
):
    data = await service.trigger_optimization()
    return StandardSuccessResponse(
        success=True,
        data=data,
        message="Agent optimization pass triggered successfully"
    )
