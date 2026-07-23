/**
 * RouterAgent with Strict Phase Guards
 * Route transitions: DISCOVERY -> FEATURE_SELECTION -> ARCHITECTURE -> COST -> PROPOSAL
 */

import { runIntentClassificationNode } from '../nodes/IntentClassificationNode';
import { runGuardNode } from '../nodes/GuardNode';

export function runRouterAgent(state) {
  let stateWithIntent = runIntentClassificationNode(state);
  stateWithIntent = runGuardNode(stateWithIntent);

  const intent = stateWithIntent.intent;
  const memory = stateWithIntent.memory || {};
  const phase = memory.conversationPhase || "DISCOVERY";

  let assignedAgent = "DiscoveryAgent";

  if (intent === "GREETING") {
    assignedAgent = "GreetingAgent";
  } else if (intent === "PROPOSAL_REQUEST") {
    assignedAgent = "ProposalAgent";
  } else if (intent === "COST_REQUEST") {
    assignedAgent = "EstimationAgent";
  } else if (intent === "FEATURE_CONFIRMATION" || (phase === "FEATURE_SELECTION" && !stateWithIntent._guard?.explicitCostRequest)) {
    assignedAgent = "ArchitectureAgent";
  } else if (phase === "ARCHITECTURE" && stateWithIntent._guard?.explicitCostRequest) {
    assignedAgent = "EstimationAgent";
  } else if (intent === "ARCHITECTURE_REQUEST") {
    assignedAgent = "ArchitectureAgent";
  } else if (intent === "PROJECT_DISCOVERY") {
    assignedAgent = "DiscoveryAgent";
  } else {
    assignedAgent = "LLMAgent";
  }

  return {
    ...stateWithIntent,
    _activeAgent: assignedAgent,
  };
}
