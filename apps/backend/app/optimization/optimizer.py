from typing import List
from app.optimization.schemas import BuildingFeatures, Recommendation, OptimizationReport
from app.optimization.rules import ALL_RULES

class Optimizer:
    @staticmethod
    def run(features: BuildingFeatures) -> OptimizationReport:
        """
        Evaluate building features through all rules, compile sorted recommendations,
        and calculate the building's overall optimization score.
        """
        recommendations: List[Recommendation] = []
        
        for rule in ALL_RULES:
            rec = rule.evaluate(features)
            if rec:
                recommendations.append(rec)
                
        # Priority mapping helper for sorting: HIGH (1) -> MEDIUM (2) -> LOW (3)
        priority_map = {"HIGH": 1, "MEDIUM": 2, "LOW": 3}
        recommendations.sort(key=lambda r: priority_map.get(r.priority, 99))
        
        # Calculate overall score (starts at 100, deduct points for efficiency improvements)
        score_deductions = {
            "HIGH": 12.0,
            "MEDIUM": 8.0,
            "LOW": 4.0
        }
        total_deduction = sum(score_deductions.get(r.priority, 5.0) for r in recommendations)
        overall_score = max(30.0, 100.0 - total_deduction)
        
        # Calculate estimated savings as a sum of recommendation savings, capped at a realistic limit (e.g. 40%)
        raw_savings = sum(r.estimated_savings_percent for r in recommendations)
        estimated_savings = min(40.0, raw_savings)
        
        return OptimizationReport(
            overall_score=round(overall_score, 1),
            estimated_savings_percent=round(estimated_savings, 2),
            recommendations=recommendations
        )
