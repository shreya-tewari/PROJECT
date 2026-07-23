/**
 * Multi-Turn Presales Consultant Pipeline with Conversation Phase Guard Machine
 * Flow: DISCOVERY (Summary & Features) -> FEATURE_SELECTION (Approval) -> ARCHITECTURE (Tech Stack) -> COST (Dev Allocation & Pricing) -> PROPOSAL (SOW Document)
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
    // 1. Preprocess Input
    state = runPreprocessNode(state);

    // 2. Requirement Extraction (LLM Structured JSON)
    state = await runMemoryExtractNode(state);

    // 3. RouterAgent Coordinator (Intent & Phase Routing)
    state = runRouterAgent(state);

    const activeAgent = state._activeAgent;

    // 4. Execute Agent Flow with Immutable State Updates
    if (activeAgent === "GreetingAgent") {
      state = runGreetingNode(state);
    } else if (activeAgent === "DiscoveryAgent") {
      // Step 1: Summary & Features (No Pricing!)
      state = await runDiscoveryAgent(state);
      state = {
        ...state,
        memory: {
          ...state.memory,
          conversationPhase: "FEATURE_SELECTION"
        }
      };
    } else if (activeAgent === "ArchitectureAgent") {
      // Step 2: Feature Approval -> Technical Architecture Recommendation
      state = runFeatureConfirmationNode(state);
      state = runArchitectureAgent(state);
      state = {
        ...state,
        memory: {
          ...state.memory,
          conversationPhase: "ARCHITECTURE"
        }
      };
    } else if (activeAgent === "EstimationAgent") {
      // Step 3: Explicit Cost Request -> Developer Matching & Cost Estimation
      state = runEstimationAgent(state);
      state = {
        ...state,
        memory: {
          ...state.memory,
          conversationPhase: "COST"
        }
      };
    } else if (activeAgent === "ProposalAgent") {
      // Step 4: Explicit Proposal Request -> SOW Proposal Generation
      state = runProposalAgent(state);
      state = {
        ...state,
        memory: {
          ...state.memory,
          conversationPhase: "PROPOSAL"
        }
      };
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

    // 5. Quality Gate & Validation Agent
    state = runValidationAgent(state);

    observability.endSpan(spanId, { activeAgent, phase: state.memory?.conversationPhase, status: "SUCCESS" });
    return state;
  } catch (err) {
    observability.endSpan(spanId, {}, err);
    state = runFallbackNode(state);
    return state;
  }
}
