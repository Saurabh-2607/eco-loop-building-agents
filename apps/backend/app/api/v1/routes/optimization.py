import json
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api.dependencies import get_optimization_service
from app.services.optimization_service import OptimizationService
from app.schemas.common import StandardSuccessResponse
from app.schemas.optimization import OptimizationResponse
from app.core.custom_exceptions import SimulationException

router = APIRouter()

class OptimizeRequest(BaseModel):
    simulation_id: Optional[UUID] = None

@router.post("/optimize", response_model=StandardSuccessResponse)
async def trigger_optimization(
    payload: Optional[OptimizeRequest] = None,
    service: OptimizationService = Depends(get_optimization_service)
):
    sim_id = payload.simulation_id if payload else None
    try:
        data = await service.trigger_optimization(sim_id)
        return StandardSuccessResponse(
            success=True,
            data=data,
            message="Optimization pass completed successfully"
        )
    except SimulationException as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/optimization/{simulation_id}", response_model=StandardSuccessResponse)
async def get_optimization_summary(
    simulation_id: UUID,
    service: OptimizationService = Depends(get_optimization_service)
):
    opt = await service.get_latest_optimization(simulation_id)
    if not opt:
        raise HTTPException(
            status_code=404, 
            detail=f"No optimization history found for simulation {simulation_id}"
        )
    
    response_data = {
        "id": opt.id,
        "simulation_id": opt.simulation_id,
        "energy_before": opt.energy_before,
        "energy_after": opt.energy_after,
        "saving_percent": opt.saving_percent,
        "comfort_score": opt.comfort_score,
        "created_at": opt.created_at
    }
    return StandardSuccessResponse(
        success=True,
        data=response_data,
        message="Optimization history retrieved successfully"
    )

@router.get("/recommendations/{simulation_id}", response_model=StandardSuccessResponse)
async def get_recommendations(
    simulation_id: UUID,
    service: OptimizationService = Depends(get_optimization_service)
):
    decisions = await service.get_recent_decisions(simulation_id, limit=1)
    if not decisions:
        return StandardSuccessResponse(
            success=True,
            data={"recommendations": []},
            message="No recommendations logged for this simulation"
        )
        
    try:
        recs = json.loads(decisions[0].action)
    except Exception:
        recs = []
        
    return StandardSuccessResponse(
        success=True,
        data={"recommendations": recs},
        message="Recommendations retrieved successfully"
    )
