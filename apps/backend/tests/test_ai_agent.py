import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from app.database.models.metrics import SimulationMetric
from app.database.models.simulation import Simulation
from app.optimization import FeatureExtractor, Optimizer
from app.ai.graph import compiled_graph
from app.ai.service import AIService

def test_ai_agent_nodes_and_fallback():
    # Setup mock building features & report
    features = FeatureExtractor.extract([])
    report = Optimizer.run(features)
    
    initial_state = {
        "simulation_id": uuid4(),
        "features": features,
        "report": report,
        "analysis": "",
        "explanations": [],
        "final_report": ""
    }
    
    # Run compiled StateGraph synchronously/asynchronously using ainvoke
    import asyncio
    final_state = asyncio.run(compiled_graph.ainvoke(initial_state))
    
    # Check that fallback text generated high quality summaries
    assert final_state["analysis"] != ""
    assert final_state["final_report"] != ""
    assert "Building Score" in final_state["final_report"] or "overall_score" in final_state["final_report"]

@pytest.mark.asyncio
async def test_ai_agent_service_integration(db_session):
    ai_service = AIService(db_session)
    
    # Create dummy simulation
    sim = Simulation(simulation_name="AI Test Building", status="finished")
    db_session.add(sim)
    await db_session.commit()
    await db_session.refresh(sim)
    
    # Populate simulation metrics to trigger rules
    base_time = datetime(2026, 7, 25, 0, 0, 0)
    for hour in range(24):
        is_occupied = 8 <= hour <= 18
        metric = SimulationMetric(
            simulation_id=sim.id,
            temperature=27.5 if is_occupied else 22.0,
            humidity=65.0 if is_occupied else 48.0,
            occupancy=50.0 if is_occupied else 0.0,
            energy_usage=250.0 if hour == 15 else (150.0 if is_occupied else 35.0),
            hvac_load=100.0 if is_occupied else 15.0,
            lighting_load=45.0 if is_occupied else 5.0,
            recorded_at=base_time + timedelta(hours=hour)
        )
        db_session.add(metric)
    await db_session.commit()
    
    # Trigger AI service run
    report_dict = await ai_service.run_ai_optimization(sim.id)
    assert "final_report" in report_dict
    assert "recommendations" in report_dict
    assert report_dict["overall_score"] < 100.0
    
    # Query database to confirm AI report logged under AIDecision
    decisions = await ai_service.ai_decision_repo.get_by_simulation_id(sim.id)
    assert len(decisions) >= 1
    assert "LangGraph" in decisions[0].model
