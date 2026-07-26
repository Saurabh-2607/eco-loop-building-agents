from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.api.dependencies import get_ai_service
from app.ai.service import AIService
from app.ai.agent import ai_agent
from app.database.models.simulation import Simulation
from app.schemas.common import StandardSuccessResponse

router = APIRouter()

@router.post("/optimize_now", response_model=StandardSuccessResponse)
async def manual_ai_optimization(
    service: AIService = Depends(get_ai_service)
):
    """
    Manually triggers the LangGraph optimization reasoning loop immediately
    using the latest telemetry metrics, without interrupting the simulator task.
    """
    try:
        # 1. Query the database for the most recent simulation run
        query = select(Simulation).order_by(Simulation.created_at.desc()).limit(1)
        result = await service.session.execute(query)
        latest_sim = result.scalar_one_or_none()
        
        if not latest_sim:
            raise HTTPException(
                status_code=404, 
                detail="No simulation runs found in database. Start a simulation first."
            )
            
        # 2. Run reasoning cycle immediately via AI Agent
        rec = await ai_agent.run_reasoning_cycle(latest_sim.id)
        
        return StandardSuccessResponse(
            success=True,
            data=rec,
            message="Manual AI Optimization cycle executed successfully."
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/{simulation_id}", response_model=StandardSuccessResponse)
async def run_ai_analysis(
    simulation_id: UUID,
    service: AIService = Depends(get_ai_service)
):
    try:
        report = await service.run_ai_optimization(simulation_id)
        return StandardSuccessResponse(
            success=True,
            data=report,
            message="LangGraph AI analysis completed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report/{simulation_id}", response_model=StandardSuccessResponse)
async def get_ai_report(
    simulation_id: UUID,
    service: AIService = Depends(get_ai_service)
):
    decisions = await service.ai_decision_repo.get_by_simulation_id(simulation_id)
    ai_decisions = [d for d in decisions if "LangGraph" in d.model]
    if not ai_decisions:
        raise HTTPException(
            status_code=404, 
            detail=f"No AI reports found for simulation {simulation_id}"
        )
    
    latest_report = ai_decisions[0]
    return StandardSuccessResponse(
        success=True,
        data={
            "simulation_id": simulation_id,
            "final_report": latest_report.reasoning,
            "model": latest_report.model,
            "created_at": latest_report.created_at
        },
        message="AI report retrieved successfully"
    )
