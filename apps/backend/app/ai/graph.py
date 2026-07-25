from langgraph.graph import StateGraph, START, END
from app.ai.state import AgentState
from app.ai.nodes import analyze_performance, explain_recommendations, generate_report

# Initialize StateGraph with context State schema
workflow = StateGraph(AgentState)

# Add processing nodes
workflow.add_node("analyze_performance", analyze_performance)
workflow.add_node("explain_recommendations", explain_recommendations)
workflow.add_node("generate_report", generate_report)

# Set transitions
workflow.add_edge(START, "analyze_performance")
workflow.add_edge("analyze_performance", "explain_recommendations")
workflow.add_edge("explain_recommendations", "generate_report")
workflow.add_edge("generate_report", END)

# Compile graph
compiled_graph = workflow.compile()
