import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from app.database.models.metrics import SimulationMetric
from app.database.models.simulation import Simulation
from app.optimization import FeatureExtractor, Optimizer, BuildingFeatures, OptimizationReport
from app.services.optimization_service import OptimizationService

def test_feature_extractor():
    # Setup mock simulation metrics
    metrics = []
    base_time = datetime(2026, 7, 25, 0, 0, 0)
    
    # 24 hours of simulated metrics
    for hour in range(24):
        # Occupied from 8 to 18
        is_occupied = 8 <= hour <= 18
        metrics.append(
            SimulationMetric(
                simulation_id=uuid4(),
                temperature=25.0 if is_occupied else 21.0,
                humidity=55.0 if is_occupied else 45.0,
                occupancy=50.0 if is_occupied else 0.0,
                energy_usage=200.0 if is_occupied else 50.0,
                hvac_load=150.0 if is_occupied else 30.0,
                lighting_load=30.0 if is_occupied else 5.0,
                recorded_at=base_time + timedelta(hours=hour)
            )
        )
        
    features = FeatureExtractor.extract(metrics)
    assert isinstance(features, BuildingFeatures)
    assert features.peak_temperature == 25.0
    assert features.min_temperature == 21.0
    assert features.avg_temperature == 22.83  # (25 * 11 + 21 * 13) / 24
    assert features.total_energy_kwh == 2850.0  # (200 * 11 + 50 * 13)
    assert features.occupancy_rate == 0.46     # 11 / 24
    assert features.peak_load_hour == 8        # First hour of peak load

def test_optimizer():
    # Setup BuildingFeatures that trigger high temperature and lighting rules
    features = BuildingFeatures(
        avg_temperature=26.0,
        peak_temperature=28.0,
        min_temperature=21.0,
        avg_humidity=65.0,
        total_energy_kwh=100.0,
        hvac_energy_kwh=40.0,
        lighting_energy_kwh=30.0,  # 30% (> 25% threshold)
        occupancy_rate=0.20,       # < 30% threshold
        peak_load_hour=14,         # peak prices period
        cooling_hours=8,
        heating_hours=0
    )
    
    report = Optimizer.run(features)
    assert isinstance(report, OptimizationReport)
    assert report.overall_score < 100.0
    assert report.estimated_savings_percent > 0.0
    
    # Confirm cooling setpoint, setback, lighting dimming, humidity and demand rules are triggered
    categories = [r.category for r in report.recommendations]
    assert "HVAC" in categories
    assert "Lighting" in categories
    assert "Load Shifting" in categories

@pytest.mark.asyncio
async def test_optimization_service(db_session):
    opt_service = OptimizationService(db_session)
    
    # 1. Create a dummy simulation
    sim = Simulation(simulation_name="Test Optimization Service Building", status="finished")
    db_session.add(sim)
    await db_session.commit()
    await db_session.refresh(sim)
    
    # 2. Add some metrics
    base_time = datetime(2026, 7, 25, 0, 0, 0)
    for hour in range(24):
        is_occupied = 8 <= hour <= 18
        metric = SimulationMetric(
            simulation_id=sim.id,
            temperature=25.5 if is_occupied else 22.0,
            humidity=62.0 if is_occupied else 48.0,
            occupancy=40.0 if is_occupied else 0.0,
            energy_usage=180.0 if is_occupied else 40.0,
            hvac_load=120.0 if is_occupied else 20.0,
            lighting_load=40.0 if is_occupied else 10.0,
            recorded_at=base_time + timedelta(hours=hour)
        )
        db_session.add(metric)
    await db_session.commit()
    
    # 3. Trigger optimization
    summary = await opt_service.trigger_optimization(sim.id)
    assert "overall_score" in summary
    assert "estimated_savings_percent" in summary
    assert len(summary["recommendations"]) > 0
    
    # 4. Get latest logged optimization summary from database
    latest_opt = await opt_service.get_latest_optimization(sim.id)
    assert latest_opt is not None
    assert latest_opt.saving_percent == summary["estimated_savings_percent"]
    
    # 5. Get recent decisions (which contains the recommendations list serialized)
    decisions = await opt_service.get_recent_decisions(sim.id)
    assert len(decisions) == 1
    assert "Deterministic Rule Engine" in decisions[0].model
