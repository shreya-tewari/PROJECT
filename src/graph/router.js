/**
 * Router Module for LangGraph State Flow
 * Replaces monolithic switch statements with declarative Conditional Edges.
 */

export function routeIntentToNode(state) {
  const intent = state.intent || "GENERAL_CONVERSATION";

  switch (intent) {
    case "GREETING":
      return "GreetingNode";

    case "MEMORY_RECALL":
      return "MemoryRecallNode";

    case "PROJECT_DISCOVERY":
      return "DiscoveryNode";

    case "FEATURE_CONFIRMATION":
      return "FeatureConfirmationNode";

    case "COST_ESTIMATION":
      return "CostEstimationFlow";

    case "ARCHITECTURE":
      return "ArchitectureNode";

    case "BENCH_MATCHING":
      return "DeveloperMatchingNode";

    case "PROPOSAL_GENERATION":
      return "SOWNode";

    default:
      return "LLMFlow";
  }
}
