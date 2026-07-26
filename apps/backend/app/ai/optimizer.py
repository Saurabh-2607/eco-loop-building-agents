from app.optimization.optimizer import Optimizer
from app.optimization.schemas import BuildingFeatures, OptimizationReport

class AIOptimizer:
    @staticmethod
    def evaluate(features: BuildingFeatures) -> OptimizationReport:
        """
        Evaluate building features through optimization rules.
        """
        return Optimizer.run(features)

ai_optimizer = AIOptimizer()
