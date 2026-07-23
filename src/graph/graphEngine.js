/**
 * Multi-Turn Presales Consultant Pipeline
 * Flow: Requirement Extraction -> Project Summary & Features -> WAIT FOR APPROVAL -> Architecture -> WAIT FOR COST REQUEST -> Developer Matching & Cost Estimation -> SOW Proposal
 */

import { runPreprocessNode } from '../nodes/PreprocessNode';
import { runMemoryExtractNode } from '../nodes/MemoryExtractNode';
import { runRouterAgent } from '../agents/RouterAgent';
import { runDiscoveryAgent } from '../agents/DiscoveryAgent';
import { runEstimationAgent } from '../agents/EstimationAgent';
import { runArchitectureAgent } from '../agents/ArchitectureAgent';
import { runProposalAgent } from '../agents/ProposalAgent';
import { runValidationAgent } from '../agents/ValidationAgent';
import { runGreetingNode } from '../nodes/GreetingNode';
import { runMemoryRecallNode } from '../nodes/MemoryRecallNode';
import { runFeatureConfirmationNode } from '../nodes/FeatureConfirmationNode';
import { runGeminiNode } from '../nodes/GeminiNode';
import { runOpenAINode } from '../nodes/OpenAINode';
import { runFallbackNode } from '../nodes/FallbackNode';
import { observability } from '../services/observabilityService';

export async function executeProposalGraph(inputState) {
  const spanId = observability.startSpan("executeProposalGraph", { userInput: inputState.userInput });
  let state = { ...inputState };

  try {
    // Step 1: Preprocess Node
    state = runPreprocessNode(state);

    // Step 2: LLM Requirement Extraction Node (Returns Structured JSON Schema)
    state = await runMemoryExtractNode(state);

    // Step 3: RouterAgent Coordinator
    state = runRouterAgent(state);

    const activeAgent = state._activeAgent;

    // Step 4: Dispatch to Agent
    if (activeAgent === "GreetingAgent") {
      if (state.intent === "GREETING") {
        state = runGreetingNode(state);
      } else {
        state = runMemoryRecallNode(state);
      }
    } else if (activeAgent === "DiscoveryAgent") {
      // Summary & Features (No Pricing!)
      state = await runDiscoveryAgent(state);
      state.memory = { ...state.memory, workflowStep: "4_WAITING_FOR_FEATURE_APPROVAL" };
    } else if (activeAgent === "ArchitectureAgent") {
      // Feature Approval -> Technical Architecture Recommendation
      state = runFeatureConfirmationNode(state);
      state = runArchitectureAgent(state);
      state.memory = { ...state.memory, workflowStep: "6_WAITING_FOR_COST_REQUEST" };
    } else if (activeAgent === "EstimationAgent") {
      // Explicit Cost Request -> Developer Matching & Cost Estimation
      state = runEstimationAgent(state);
      state.memory = { ...state.memory, workflowStep: "8_COST_ESTIMATED" };
    } else if (activeAgent === "ProposalAgent") {
      // Explicit Proposal Request -> SOW Proposal Generation
      state = runProposalAgent(state);
      state.memory = { ...state.memory, workflowStep: "9_PROPOSAL_GENERATED" };
    } else {
      // LLM Fallback Cascade
      state = await runGeminiNode(state);
      if (state._llmFailed) {
        state = await runOpenAINode(state);
        if (state._openaiFailed) {
          state = runFallbackNode(state);
        }
      }
    }

    // Step 5: Quality Gate & Validation Agent
    state = runValidationAgent(state);

    observability.endSpan(spanId, { activeAgent, step: state.memory?.workflowStep, status: "SUCCESS" });
    return state;
  } catch (err) {
    observability.endSpan(spanId, {}, err);
    state = runFallbackNode(state);
    return state;
  }
}
