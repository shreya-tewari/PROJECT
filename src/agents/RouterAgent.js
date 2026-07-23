/**
 * RouterAgent with Multi-Turn Requirement Discovery & Approval Checkpoints
 * Ensures pricing is NEVER returned during initial project description.
 */

import { runIntentClassificationNode } from '../nodes/IntentClassificationNode';

export function runRouterAgent(state) {
  const stateWithIntent = runIntentClassificationNode(state);
  const intent = stateWithIntent.intent;
  const memory = stateWithIntent.memory || {};
  const currentStep = memory.workflowStep || "1_REQUIREMENT_EXTRACTION";
  const lowerInput = (state.userInput || "").toLowerCase();

  const isCostRequest = ['cost', 'price', 'budget', 'estimate', 'how much', 'quote', 'rate', 'pricing', 'dollar', 'dolar'].some(k => lowerInput.includes(k));
  const isProposalRequest = (lowerInput.includes("sow") || lowerInput.includes("proposal") || lowerInput.includes("draft")) && (lowerInput.includes("generate") || lowerInput.includes("create") || lowerInput.includes("make"));

  let assignedAgent = "DiscoveryAgent";

  if (intent === "GREETING" || intent === "MEMORY_RECALL") {
    assignedAgent = "GreetingAgent";
  } else if (isProposalRequest) {
    assignedAgent = "ProposalAgent";
  } else if (isCostRequest) {
    assignedAgent = "EstimationAgent";
  } else if (currentStep === "4_WAITING_FOR_FEATURE_APPROVAL" || lowerInput.includes("approve") || lowerInput.includes("architecture") || lowerInput.includes("next")) {
    assignedAgent = "ArchitectureAgent";
  } else if (currentStep === "6_WAITING_FOR_COST_REQUEST") {
    assignedAgent = "EstimationAgent";
  } else {
    assignedAgent = "DiscoveryAgent";
  }

  return {
    ...stateWithIntent,
    _activeAgent: assignedAgent,
  };
}
