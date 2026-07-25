import httpx
from loguru import logger
from app.core.config import settings
from app.ai.state import AgentState
from app.ai.prompts import (
    SYSTEM_ANALYSIS_PROMPT,
    SYSTEM_EXPLANATION_PROMPT,
    SYSTEM_REPORT_PROMPT
)

async def _query_ollama(system_prompt: str, user_prompt: str) -> str:
    """
    Sends request to Ollama service host. Returns empty string if offline/failed.
    """
    url = f"{settings.OLLAMA_HOST}/api/generate"
    payload = {
        "model": settings.MODEL_NAME,
        "prompt": f"{system_prompt}\n\n{user_prompt}",
        "stream": False
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                res_text = response.json().get("response", "").strip()
                if res_text:
                    return res_text
    except Exception as e:
        logger.warning(f"Ollama connection to {settings.OLLAMA_HOST} failed: {e}. Utilizing fallback report parser.")
    return ""

async def analyze_performance(state: AgentState) -> dict:
    """
    Node: Analyzes building feature profiles using LLM.
    """
    features = state["features"]
    total = features.total_energy_kwh
    hvac_percent = (features.hvac_energy_kwh / total * 100.0) if total > 0 else 0.0
    lighting_percent = (features.lighting_energy_kwh / total * 100.0) if total > 0 else 0.0
    
    user_prompt = f"Analyze load variables: HVAC ({features.hvac_energy_kwh} kWh), Lighting ({features.lighting_energy_kwh} kWh)."
    system_prompt = SYSTEM_ANALYSIS_PROMPT.format(
        avg_temp=features.avg_temperature,
        peak_temp=features.peak_temperature,
        min_temp=features.min_temperature,
        avg_humidity=features.avg_humidity,
        total_energy_kwh=features.total_energy_kwh,
        hvac_energy_kwh=features.hvac_energy_kwh,
        hvac_percent=hvac_percent,
        lighting_energy_kwh=features.lighting_energy_kwh,
        lighting_percent=lighting_percent,
        occupancy_rate=features.occupancy_rate * 100.0,
        peak_load_hour=features.peak_load_hour
    )
    
    analysis = await _query_ollama(system_prompt, user_prompt)
    if not analysis:
        # High quality fallback
        analysis = (
            f"Building performance analysis indicates a base operational score of {state['report'].overall_score}/100. "
            f"HVAC demands represent {hvac_percent:.1f}% of total energy usage ({features.hvac_energy_kwh} kWh), "
            f"while interior lighting accounts for {lighting_percent:.1f}% ({features.lighting_energy_kwh} kWh). "
            f"The peak load hour is registered at {features.peak_load_hour}:00. Based on these configurations, "
            f"improving thermal setpoint boundaries and schedule control offsets is highly recommended."
        )
        
    return {"analysis": analysis}

async def explain_recommendations(state: AgentState) -> dict:
    """
    Node: Generates short explanations for each deterministic recommendation.
    """
    recommendations = state["report"].recommendations
    explanations = []
    
    # Pre-coded fallback explanations categorized by type
    fallbacks = {
        "HVAC": "Adjusting setpoints and schedule offsets minimizes compressor operation during peak cooling hours, securing immediate consumption reductions without compromising interior thermal comfort.",
        "Lighting": "Dimming fixtures during off-office and off-peak hours matches lumen output with real occupancy, saving lighting energy.",
        "Load Shifting": "Pre-cooling shifts HVAC load to morning hours when grid tariffs are lower, reducing overall peak demand charges."
    }
    
    for r in recommendations:
        system_prompt = SYSTEM_EXPLANATION_PROMPT.format(
            category=r.category,
            recommendation=r.recommendation,
            savings=r.estimated_savings_percent,
            confidence=r.confidence
        )
        user_prompt = f"Explain: {r.recommendation}"
        
        explanation = await _query_ollama(system_prompt, user_prompt)
        if not explanation:
            explanation = fallbacks.get(r.category, "Optimizing system parameters yields immediate efficiency benefits and lowers carbon footprint.")
            
        explanations.append({
            "category": r.category,
            "priority": r.priority,
            "recommendation": r.recommendation,
            "savings": r.estimated_savings_percent,
            "confidence": r.confidence,
            "explanation": explanation
        })
        
    return {"explanations": explanations}

async def generate_report(state: AgentState) -> dict:
    """
    Node: Combines analysis and explanations into the final Markdown report.
    """
    report = state["report"]
    analysis = state["analysis"]
    explanations = state["explanations"]
    
    explanations_text = ""
    for idx, e in enumerate(explanations, 1):
        explanations_text += (
            f"{idx}. **[{e['priority']}] {e['recommendation']}** ({e['category']})\n"
            f"   - *Estimated Savings*: {e['savings']}%\n"
            f"   - *Explanation*: {e['explanation']}\n\n"
        )
        
    system_prompt = SYSTEM_REPORT_PROMPT.format(
        score=report.overall_score,
        savings=report.estimated_savings_percent,
        analysis=analysis,
        explanations_text=explanations_text
    )
    user_prompt = "Compile the final markdown report."
    
    final_report = await _query_ollama(system_prompt, user_prompt)
    if not final_report:
        # Fallback markdown generator
        final_report = f"""# Executive Building Performance & Optimization Report

## 1. Executive Summary
- **Overall Building Score**: {report.overall_score}/100
- **Total Estimated Savings**: {report.estimated_savings_percent:.1f}%

The building's thermal and power parameters have been analyzed. Implementing the recommended actions below will reduce waste, optimize setpoints, and lower operational overhead.

## 2. Detailed Building Performance Analysis
{analysis}

## 3. Actionable Recommendations
{explanations_text}
"""

    return {"final_report": final_report}
