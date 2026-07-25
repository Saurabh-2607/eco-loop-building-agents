from fastapi import APIRouter, Depends
from app.api.dependencies import get_simulation_service
from app.services.simulation_service import SimulationService
from app.schemas.control import ControlOverrideRequest
from app.schemas.common import StandardSuccessResponse

router = APIRouter()

@router.get("/simulation", response_model=StandardSuccessResponse)
async def get_simulation_status(
    service: SimulationService = Depends(get_simulation_service)
):
    data = await service.get_simulation_status(simulation_id=None)  # Placeholder or get active
    return StandardSuccessResponse(
        success=True,
        data=data,
        message="Simulation status retrieved successfully"
    )

@router.post("/control", response_model=StandardSuccessResponse)
async def apply_simulation_control(
    payload: ControlOverrideRequest,
    service: SimulationService = Depends(get_simulation_service)
):
    data = await service.update_simulation_control(
        hvac_setpoint=payload.hvac_setpoint,
        lighting_dim=payload.lighting_dim
    )
    return StandardSuccessResponse(
        success=True,
        data=data,
        message="Manual control overrides applied successfully"
    )
