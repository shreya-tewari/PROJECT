from graph import execute_langgraph_pipeline

print("--- Testing LangGraph & LangChain Pipeline ---")
result = execute_langgraph_pipeline(
    user_input="Hello! My name is Shreya and I want to build a React and Node.js e-commerce app with 6 developers for 12 weeks.",
    history=[],
    memory_context={}
)

print("\n[Intent Detected]:", result.get("intent"))
print("[Extracted Memory]:", result.get("memory"))
print("[Dev Matches Count]:", len(result.get("devMatches") or []))
print("\n[AI Response Sample]:\n", result.get("response")[:250], "...")
print("\nLangGraph & LangChain Pipeline Test Completed Successfully!")
