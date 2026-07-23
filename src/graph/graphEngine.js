/**
 * Multi-Agent LangGraph Coordinated Pipeline
 * Coordinates specialized agents (RouterAgent, DiscoveryAgent, EstimationAgent, ArchitectureAgent, ProposalAgent, ValidationAgent)
 * with Observability (LangSmith/OpenTelemetry telemetry spans), Checkpointing, and Retry Policies.
 */

import { createInitialProposalState } from '../types/proposalState';
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
import { executeWithRetry } from '../services/retryService';

export async function executeProposalGraph(inputState) {
  const spanId = observability.startSpan("executeProposalGraph", { userInput: inputState.userInput });
  let state = { ...inputState };

  try {
    // 1. Preprocess Node
    state = runPreprocessNode(state);

    // 2. Memory Extract Node
    state = runMemoryExtractNode(state);

    // 3. RouterAgent (Multi-Agent Dispatcher)
    state = runRouterAgent(state);

    const activeAgent = state._activeAgent;

    // 4. Delegate execution to assigned Specialized Agent
    if (activeAgent === "GreetingAgent") {
      if (state.intent === "GREETING") {
        state = runGreetingNode(state);
      } else {
        state = runMemoryRecallNode(state);
      }
    } else if (activeAgent === "DiscoveryAgent") {
      if (state.intent === "FEATURE_CONFIRMATION") {
        state = runFeatureConfirmationNode(state);
        state = runEstimationAgent(state);
      } else {
        state = runDiscoveryAgent(state);
      }
    } else if (activeAgent === "EstimationAgent") {
      state = runEstimationAgent(state);
    } else if (activeAgent === "ArchitectureAgent") {
      state = runArchitectureAgent(state);
    } else if (activeAgent === "ProposalAgent") {
      state = runProposalAgent(state);
    } else {
      // LLMAgent with Retry Policy & Fallback Cascade
      state = await executeWithRetry(() => runGeminiNode(state), { maxRetries: 1 });
      if (state._llmFailed) {
        state = await executeWithRetry(() => runOpenAINode(state), { maxRetries: 1 });
        if (state._openaiFailed) {
          state = runFallbackNode(state);
        }
      }
    }

    // 5. ValidationAgent (Quality Gate & Reasoner)
    state = runValidationAgent(state);

    observability.endSpan(spanId, { activeAgent, status: "SUCCESS" });
    return state;
  } catch (err) {
    observability.endSpan(spanId, {}, err);
    state = runFallbackNode(state);
    return state;
  }
}
