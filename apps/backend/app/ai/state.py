from typing import TypedDict, List, Dict, Any
from uuid import UUID
from app.optimization.schemas import BuildingFeatures, OptimizationReport

class AgentState(TypedDict):
    """
    State representing the context carried through the LangGraph AI pipeline.
    """
    simulation_id: UUID
    features: BuildingFeatures
    report: OptimizationReport
    analysis: str
    explanations: List[Dict[str, Any]]
    final_report: str
