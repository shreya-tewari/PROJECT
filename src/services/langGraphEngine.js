/**
 * LangGraph Enterprise Multi-Agent Facade
 * Provides public API methods delegating to multi-agent orchestrator, checkpoint service, and observability.
 */

import { createInitialProposalState } from '../types/proposalState.js';
import { executeProposalGraph } from '../graph/graphEngine.js';
import { runMemoryExtractNode } from '../nodes/MemoryExtractNode.js';
import { runIntentClassificationNode } from '../nodes/IntentClassificationNode.js';
import { runCloudPricingNode } from '../nodes/CloudPricingNode.js';
import { runApiPricingNode } from '../nodes/ApiPricingNode.js';
import { runDeveloperMatchingNode } from '../nodes/DeveloperMatchingNode.js';
import { runHourEstimationNode } from '../nodes/HourEstimationNode.js';
import { runTimelineNode } from '../nodes/TimelineNode.js';
import { runCostEstimationNode } from '../nodes/CostEstimationNode.js';
import { runProposalNode } from '../nodes/ProposalNode.js';
import { runSOWNode } from '../nodes/SOWNode.js';

// Advanced Enterprise Services
import { saveCheckpoint, loadAllCheckpoints, getProposalVersions, restoreCheckpoint } from './checkpointService.js';
import { observability } from './observabilityService.js';
import { industryRegistry } from './industryRegistry.js';

/**
 * Creates initial conversation memory state
 */
export function createInitialGraphState() {
  return createInitialProposalState().memory;
}

/**
 * Executes a stateful LangGraph turn for AI Chat
 */
export async function processLangGraphTurn(params = {}) {
  const message = params.message || params.userInput || "";
  const history = params.history || [];
  const memory = params.memory || params.currentMemory || null;
  const apiKey = params.apiKey || null;

  const initialState = createInitialProposalState();

  const stateInput = {
    ...initialState,
    userInput: message,
    history,
    memory: memory || initialState.memory,
    apiKey,
  };

  const finalState = await executeProposalGraph(stateInput);

  return {
    response: finalState.response.text,
    memory: finalState.memory,
    intent: finalState.intent,
    actionType: finalState.response.actionType,
    devMatches: finalState.response.devMatches,
    proposalData: finalState.proposal,
    validation: finalState._validation,
  };
}

/**
 * Helper to extract memory entities from raw text input
 */
export function extractMemoryEntities(text = "", memoryContext = null) {
  const initialState = createInitialProposalState();
  const inputState = {
    ...initialState,
    userInput: text,
    memory: memoryContext || initialState.memory,
  };

  const updatedState = runMemoryExtractNode(inputState);
  return updatedState.memory;
}

/**
 * Helper to classify user query intent
 */
export function classifyIntent(text = "", memoryContext = null) {
  const initialState = createInitialProposalState();
  const inputState = {
    ...initialState,
    userInput: text,
    memory: memoryContext || initialState.memory,
  };

  const updatedState = runIntentClassificationNode(inputState);
  return updatedState.intent;
}

/**
 * Helper to calculate realistic cloud infrastructure & 3rd party API costs
 */
export function calculateRealisticInfrastructureCosts(promptText = "", projectTitle = "", industry = "", complexityScore = 5) {
  const initialState = createInitialProposalState();
  const inputState = {
    ...initialState,
    userInput: promptText,
    memory: {
      ...initialState.memory,
      projectTitle,
      industry,
      complexityScore,
    },
  };

  const updatedState = runCloudPricingNode(inputState);
  const apiState = runApiPricingNode(updatedState);

  return {
    cloudInfraCost: apiState.costEstimate.cloudCost,
    thirdPartyApiCost: apiState.costEstimate.apiCost,
    cloudInfraDescription: apiState.costEstimate.cloudInfraDescription,
    thirdPartyApiDescription: apiState.costEstimate.thirdPartyApiDescription,
  };
}

/**
 * Generates full SOW proposal document
 */
export async function generateFullSowProposal(memoryContext, userInput = "", apiKey = null) {
  const initialState = createInitialProposalState();
  let state = {
    ...initialState,
    userInput,
    memory: memoryContext || initialState.memory,
    apiKey,
  };

  state = runDeveloperMatchingNode(state);
  state = runHourEstimationNode(state);
  state = runTimelineNode(state);
  state = runCostEstimationNode(state);
  state = runCloudPricingNode(state);
  state = runApiPricingNode(state);
  state = runProposalNode(state);
  state = runSOWNode(state);

  // Save proposal checkpoint snapshot
  saveCheckpoint(state.proposal?.proposalId, state, "Manual SOW Generation");

  return {
    markdown: state.response.text,
    proposalData: state.proposal,
  };
}

// Export Advanced Enterprise Capabilities
export {
  saveCheckpoint,
  loadAllCheckpoints,
  getProposalVersions,
  restoreCheckpoint,
  observability,
  industryRegistry,
};
