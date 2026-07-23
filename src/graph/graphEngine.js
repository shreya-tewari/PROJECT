/**
 * Multi-Step LangGraph Workflow Pipeline with Approval Checkpoints
 * Requirement Extraction -> Summary & Features -> Feature Approval -> Architecture -> Cost Request -> Dev Matching & Cost Estimation -> SOW Proposal
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

    // Step 2: LLM-Driven Requirement Extraction Node
    state = await runMemoryExtractNode(state);

    // Step 3: RouterAgent (Multi-Agent Dispatcher)
    state = runRouterAgent(state);

    const activeAgent = state._activeAgent;

    // Step 4: Execute Agent Flow matching strict workflow order
    if (activeAgent === "GreetingAgent") {
      if (state.intent === "GREETING") {
        state = runGreetingNode(state);
      } else {
        state = runMemoryRecallNode(state);
      }
    } else if (activeAgent === "DiscoveryAgent") {
      // Step 1 -> Step 2 -> Step 3
      state = await runDiscoveryAgent(state);
      state.memory.workflowStep = "4_WAITING_FOR_FEATURE_APPROVAL";
    } else if (activeAgent === "ArchitectureAgent") {
      // Step 4 Approval -> Step 5 Architecture Recommendation
      state = runFeatureConfirmationNode(state);
      state = runArchitectureAgent(state);
      state.memory.workflowStep = "6_WAITING_FOR_COST_REQUEST";
    } else if (activeAgent === "EstimationAgent") {
      // Step 6 Cost Request -> Step 7 Dev Matching -> Step 8 Cost Estimation
      state = runEstimationAgent(state);
      state.memory.workflowStep = "8_COST_ESTIMATED";
    } else if (activeAgent === "ProposalAgent") {
      // Step 9 Proposal Generation
      state = runProposalAgent(state);
      state.memory.workflowStep = "9_PROPOSAL_GENERATED";
    } else {
      // LLMAgent with Fallback Cascade
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
