import pytest
from uuid import UUID
from app.services.simulation_service import SimulationService
from app.services.metrics_service import MetricsService
from app.services.optimization_service import OptimizationService
from app.services.dashboard_service import DashboardService
from app.schemas.metrics import MetricCreate
from app.schemas.optimization import AIDecisionCreate, OptimizationCreate

@pytest.mark.asyncio
async def test_simulation_lifecycle(db_session):
    sim_service = SimulationService(db_session)
    
    # 1. Create simulation
    sim = await sim_service.create_simulation("Test Building Chicago")
    assert sim.simulation_name == "Test Building Chicago"
    assert sim.status == "running"
    assert isinstance(sim.id, UUID)
    
    # 2. Get status
    fetched = await sim_service.get_simulation_status(sim.id)
    assert fetched.simulation_name == "Test Building Chicago"
    
    # 3. Update status
    updated = await sim_service.update_simulation_status(sim.id, "finished")
    assert updated.status == "finished"

@pytest.mark.asyncio
async def test_metrics_logging(db_session):
    sim_service = SimulationService(db_session)
    metrics_service = MetricsService(db_session)
    
    sim = await sim_service.create_simulation("Test Metrics Profile")
    
    payload = MetricCreate(
        simulation_id=sim.id,
        temperature=22.5,
        humidity=45.0,
        occupancy=10.0,
        energy_usage=150.0,
        hvac_load=120.0,
        lighting_load=30.0
    )
    
    # 1. Save metric
    metric = await metrics_service.add_metric(payload)
    assert metric.temperature == 22.5
    assert metric.simulation_id == sim.id
    
    # 2. Get latest
    latest = await metrics_service.get_latest_metrics(sim.id)
    assert latest is not None
    assert latest.energy_usage == 150.0
    
    # 3. Get history
    history = await metrics_service.get_historical_metrics(sim.id)
    assert len(history) == 1

@pytest.mark.asyncio
async def test_optimization_and_ai_logging(db_session):
    sim_service = SimulationService(db_session)
    opt_service = OptimizationService(db_session)
    
    sim = await sim_service.create_simulation("Test Optimization")
    
    ai_payload = AIDecisionCreate(
        simulation_id=sim.id,
        prompt="Thermostat setpoint optimization",
        reasoning="Occupancy low",
        action="COOLING_SETPOINT=24.0",
        confidence=0.98,
        model="qwen3:8b",
        latency=1.2
    )
    
    decision = await opt_service.create_ai_decision(ai_payload)
    assert decision.confidence == 0.98
    assert decision.action == "COOLING_SETPOINT=24.0"
    
    opt_payload = OptimizationCreate(
        simulation_id=sim.id,
        energy_before=120.0,
        energy_after=100.0,
        saving_percent=16.6,
        comfort_score=92.0
    )
    
    opt = await opt_service.create_optimization(opt_payload)
    assert opt.saving_percent == 16.6
    
    # Get latest opt
    latest_opt = await opt_service.get_latest_optimization(sim.id)
    assert latest_opt is not None
    assert latest_opt.comfort_score == 92.0
    
    # Get recent decisions
    decisions = await opt_service.get_recent_decisions(sim.id)
    assert len(decisions) == 1

@pytest.mark.asyncio
async def test_dashboard_aggregation(db_session):
    dashboard_service = DashboardService(db_session)
    
    # Aggregation with empty DB
    response = await dashboard_service.get_dashboard_data()
    assert response.simulation is None
    assert response.system_status.database == "connected"
    assert response.system_status.api == "running"
