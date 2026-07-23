/**
 * RouterAgent with Strict Multi-Step Workflow Approval Checkpoints
 * Flow: Requirement Extraction -> Project Summary & Features -> User Feature Approval -> Architecture -> User Cost Request -> Dev Matching -> Cost Estimation -> Proposal
 */

import { runIntentClassificationNode } from '../nodes/IntentClassificationNode';

export function runRouterAgent(state) {
  const stateWithIntent = runIntentClassificationNode(state);
  const intent = stateWithIntent.intent;
  const memory = stateWithIntent.memory || {};
  const currentStep = memory.workflowStep || "1_REQUIREMENT_EXTRACTION";
  const lowerInput = (state.userInput || "").toLowerCase();

  let assignedAgent = "DiscoveryAgent";

  if (intent === "GREETING" || intent === "MEMORY_RECALL") {
    assignedAgent = "GreetingAgent";
  } else if (intent === "PROPOSAL_GENERATION") {
    assignedAgent = "ProposalAgent";
  } else if (currentStep === "4_WAITING_FOR_FEATURE_APPROVAL" || lowerInput.includes("approve") || lowerInput.includes("yes") || lowerInput.includes("include") || lowerInput.includes("ok") || lowerInput.includes("skip")) {
    if (!['cost', 'price', 'budget', 'how much', 'quote'].some(k => lowerInput.includes(k))) {
      assignedAgent = "ArchitectureAgent";
    } else {
      assignedAgent = "EstimationAgent";
    }
  } else if (intent === "COST_ESTIMATION" || intent === "BENCH_MATCHING" || lowerInput.includes("cost") || lowerInput.includes("price") || lowerInput.includes("estimate") || lowerInput.includes("budget")) {
    assignedAgent = "EstimationAgent";
  } else if (intent === "ARCHITECTURE") {
    assignedAgent = "ArchitectureAgent";
  } else if (intent === "GENERAL_CONVERSATION") {
    assignedAgent = "LLMAgent";
  } else {
    assignedAgent = "DiscoveryAgent";
  }

  return {
    ...stateWithIntent,
    _activeAgent: assignedAgent,
  };
}
