from fastapi import APIRouter, Depends, status
from uuid import UUID
from typing import List

from app.api.dependencies import get_simulation_service
from app.energyplus.simulation_service import SimulationService
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.schemas.metrics import MetricResponse
from app.schemas.control import ControlOverrideRequest
from app.schemas.common import StandardSuccessResponse

router = APIRouter()

@router.post("/simulation/start", response_model=StandardSuccessResponse[SimulationResponse], status_code=status.HTTP_202_ACCEPTED)
async def start_simulation(
    payload: SimulationCreate,
    service: SimulationService = Depends(get_simulation_service)
):
    sim = await service.start_simulation(name=payload.simulation_name)
    return StandardSuccessResponse(
        success=True,
        data=sim,
        message="Simulation run initialized successfully and executing in the background."
    )

@router.get("/simulation/status/{id}", response_model=StandardSuccessResponse[SimulationResponse])
async def get_simulation_status(
    id: UUID,
    service: SimulationService = Depends(get_simulation_service)
):
    sim = await service.get_simulation_status(id)
    return StandardSuccessResponse(
        success=True,
        data=sim,
        message="Simulation status checked successfully."
    )

@router.get("/simulation/results/{id}", response_model=StandardSuccessResponse[List[MetricResponse]])
async def get_simulation_results(
    id: UUID,
    service: SimulationService = Depends(get_simulation_service)
):
    results = await service.get_simulation_results(id)
    return StandardSuccessResponse(
        success=True,
        data=results,
        message="Simulation parsed metrics results retrieved successfully."
    )

@router.get("/simulation/latest", response_model=StandardSuccessResponse[SimulationResponse])
async def get_latest_simulation(
    service: SimulationService = Depends(get_simulation_service)
):
    sim = await service.get_latest_simulation()
    return StandardSuccessResponse(
        success=True,
        data=sim,
        message="Latest simulation data retrieved."
    )

@router.post("/control", response_model=StandardSuccessResponse)
@router.post("/simulation/control", response_model=StandardSuccessResponse)
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
        message="Control settings overrides applied successfully."
    )
