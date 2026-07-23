/**
 * LangGraph Service Facade
 * Provides public API methods for UI components delegating to graph/graphEngine and nodes.
 */

import { createInitialProposalState } from '../types/proposalState';
import { executeProposalGraph } from '../graph/graphEngine';
import { runMemoryExtractNode } from '../nodes/MemoryExtractNode';
import { runIntentClassificationNode } from '../nodes/IntentClassificationNode';
import { runCloudPricingNode } from '../nodes/CloudPricingNode';
import { runDeveloperMatchingNode } from '../nodes/DeveloperMatchingNode';
import { runHourEstimationNode } from '../nodes/HourEstimationNode';
import { runTimelineNode } from '../nodes/TimelineNode';
import { runCostEstimationNode } from '../nodes/CostEstimationNode';
import { runApiPricingNode } from '../nodes/ApiPricingNode';
import { runProposalNode } from '../nodes/ProposalNode';
import { runSOWNode } from '../nodes/SOWNode';

/**
 * Creates initial conversation memory state
 */
export function createInitialGraphState() {
  return createInitialProposalState().memory;
}

/**
 * Executes a stateful LangGraph turn for AI Chat
 */
export async function processLangGraphTurn({ message = "", history = [], memory = null, apiKey = null }) {
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

  return {
    markdown: state.response.text,
    proposalData: state.proposal,
  };
}
