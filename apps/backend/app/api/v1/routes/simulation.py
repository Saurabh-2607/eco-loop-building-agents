from fastapi import APIRouter, Depends, status
from uuid import UUID
from typing import List
from sqlalchemy import select

from app.api.dependencies import get_simulation_service
from app.energyplus.simulation_service import SimulationService
from app.schemas.simulation import SimulationResponse
from app.schemas.metrics import MetricResponse
from app.schemas.control import ControlOverrideRequest
from app.schemas.common import StandardSuccessResponse
from app.database.models.simulation import Simulation
from app.database.models.metrics import SimulationMetric
from app.database.models.ai_decision import AIDecision

router = APIRouter()

@router.get("/realtime/state")
async def get_realtime_state(
    service: SimulationService = Depends(get_simulation_service)
):
    """
    Exposes the current state of the building twin, reading the latest parsed metric
    and active AI control policies from the database.
    """
    # 1. Fetch latest simulation run
    query = select(Simulation).order_by(Simulation.created_at.desc()).limit(1)
    res = await service.session.execute(query)
    sim = res.scalar_one_or_none()
    
    if not sim:
        return {
            "energy": 0.0,
            "temperature": 0.0,
            "occupancy": 0,
            "hvac": 0.0,
            "lighting": 0.0,
            "optimization": "Digital twin environment offline."
        }

    # 2. Fetch latest telemetry metric point
    m_query = select(SimulationMetric).where(SimulationMetric.simulation_id == sim.id).order_by(SimulationMetric.recorded_at.desc()).limit(1)
    m_res = await service.session.execute(m_query)
    latest_metric = m_res.scalar_one_or_none()

    # 3. Fetch latest AI decision target Reasoning
    d_query = select(AIDecision).where(AIDecision.simulation_id == sim.id).order_by(AIDecision.created_at.desc()).limit(1)
    d_res = await service.session.execute(d_query)
    latest_decision = d_res.scalar_one_or_none()

    optimization_text = "Idle. Monitoring thermal load..."
    if latest_decision:
        optimization_text = latest_decision.reasoning
        if len(optimization_text) > 120:
            optimization_text = optimization_text[:117] + "..."

    if not latest_metric:
        return {
            "energy": 0.0,
            "temperature": 0.0,
            "occupancy": 0,
            "hvac": 0.0,
            "lighting": 0.0,
            "optimization": optimization_text
        }

    return {
        "energy": round(latest_metric.energy_usage, 2),
        "temperature": round(latest_metric.temperature, 1),
        "occupancy": int(latest_metric.occupancy),
        "hvac": round(latest_metric.hvac_load, 2),
        "lighting": round(latest_metric.lighting_load, 2),
        "optimization": optimization_text
    }

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
