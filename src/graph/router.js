/**
 * Declarative Router Module for LangGraph
 * Maps classified intents to target node handlers with live console debugging.
 */

const ROUTE_MAP = {
  GREETING: "GreetingNode",
  PROJECT_DISCOVERY: "DiscoveryNode",
  FEATURE_CONFIRMATION: "FeatureSelectionNode",
  COST_ESTIMATION: "CostEstimatorNode",
  BENCH_MATCHING: "BenchNode",
  ARCHITECTURE: "ArchitectureNode",
  PROPOSAL_GENERATION: "ProposalNode",
  GENERAL: "ChatNode"
};

export function routeIntent(state) {
  const intent = state.intent || "GENERAL";
  const node = ROUTE_MAP[intent] || ROUTE_MAP.GENERAL;

  // Debugging Router Logs
  console.log(`\n================ LangGraph Router Debug ================`);
  console.log(`Incoming: ${state.userInput}`);
  console.log(`Intent:   ${intent}`);
  console.log(`Node:     ${node}`);
  console.log(`========================================================\n`);

  return {
    node,
    intent
  };
}
