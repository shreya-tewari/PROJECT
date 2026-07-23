/**
 * RouterAgent
 * Multi-Agent Coordinator that dispatches presales tasks to specialized sub-agents.
 */

import { runIntentClassificationNode } from '../nodes/IntentClassificationNode';

export function runRouterAgent(state) {
  const stateWithIntent = runIntentClassificationNode(state);
  const intent = stateWithIntent.intent;

  let assignedAgent = "DiscoveryAgent";

  if (intent === "GREETING" || intent === "MEMORY_RECALL") {
    assignedAgent = "GreetingAgent";
  } else if (intent === "COST_ESTIMATION" || intent === "BENCH_MATCHING") {
    assignedAgent = "EstimationAgent";
  } else if (intent === "ARCHITECTURE") {
    assignedAgent = "ArchitectureAgent";
  } else if (intent === "PROPOSAL_GENERATION") {
    assignedAgent = "ProposalAgent";
  } else if (intent === "GENERAL_CONVERSATION") {
    assignedAgent = "LLMAgent";
  }

  return {
    ...stateWithIntent,
    _activeAgent: assignedAgent,
  };
}
