/**
 * LangGraph Graph Engine
 * State Machine Execution Pipeline for Presales & Proposal Generation
 */

import { createInitialProposalState, updateProposalState } from '../types/proposalState';
import { runPreprocessNode } from '../nodes/PreprocessNode';
import { runMemoryExtractNode } from '../nodes/MemoryExtractNode';
import { runIntentClassificationNode } from '../nodes/IntentClassificationNode';
import { runGreetingNode } from '../nodes/GreetingNode';
import { runMemoryRecallNode } from '../nodes/MemoryRecallNode';
import { runDiscoveryNode } from '../nodes/DiscoveryNode';
import { runFeatureSuggestionNode } from '../nodes/FeatureSuggestionNode';
import { runFeatureConfirmationNode } from '../nodes/FeatureConfirmationNode';
import { runDeveloperMatchingNode } from '../nodes/DeveloperMatchingNode';
import { runHourEstimationNode } from '../nodes/HourEstimationNode';
import { runTimelineNode } from '../nodes/TimelineNode';
import { runCostEstimationNode } from '../nodes/CostEstimationNode';
import { runCloudPricingNode } from '../nodes/CloudPricingNode';
import { runApiPricingNode } from '../nodes/ApiPricingNode';
import { runArchitectureNode } from '../nodes/ArchitectureNode';
import { runProposalNode } from '../nodes/ProposalNode';
import { runSOWNode } from '../nodes/SOWNode';
import { runGeminiNode } from '../nodes/GeminiNode';
import { runOpenAINode } from '../nodes/OpenAINode';
import { runFallbackNode } from '../nodes/FallbackNode';
import { runMarkdownResponseNode } from '../nodes/MarkdownResponseNode';
import { routeIntentToNode } from './router';

export async function executeProposalGraph(inputState) {
  let state = { ...inputState };

  // Step 1: Preprocess
  state = runPreprocessNode(state);

  // Step 2: Extract Memory
  state = runMemoryExtractNode(state);

  // Step 3: Intent Classification
  state = runIntentClassificationNode(state);

  // Step 4: Conditional Edge Router
  const nextTarget = routeIntentToNode(state);

  // Step 5: Execute Target Node Flow
  if (nextTarget === "GreetingNode") {
    state = runGreetingNode(state);
  } else if (nextTarget === "MemoryRecallNode") {
    state = runMemoryRecallNode(state);
  } else if (nextTarget === "DiscoveryNode") {
    state = runDiscoveryNode(state);
    state = runFeatureSuggestionNode(state);
  } else if (nextTarget === "FeatureConfirmationNode") {
    state = runFeatureConfirmationNode(state);
    state = runDeveloperMatchingNode(state);
    state = runHourEstimationNode(state);
    state = runTimelineNode(state);
    state = runCostEstimationNode(state);
    state = runCloudPricingNode(state);
    state = runApiPricingNode(state);
    state = runMarkdownResponseNode(state);
  } else if (nextTarget === "CostEstimationFlow") {
    state = runDeveloperMatchingNode(state);
    state = runHourEstimationNode(state);
    state = runTimelineNode(state);
    state = runCostEstimationNode(state);
    state = runCloudPricingNode(state);
    state = runApiPricingNode(state);
    state = runMarkdownResponseNode(state);
  } else if (nextTarget === "ArchitectureNode") {
    state = runArchitectureNode(state);
  } else if (nextTarget === "DeveloperMatchingNode") {
    state = runDeveloperMatchingNode(state);
    const devs = state.developers || [];
    let devText = `👨‍💻 **Matching Bench Developers for ${state.memory?.projectTitle || 'Software Application'}:**\n\n`;
    devs.forEach(d => {
      devText += `- **${d.name}** (${d.role}) — $${d.hourlyRate}/hr | ${d.experienceYears} yrs exp | Skills: ${d.skills.slice(0, 3).join(', ')}\n`;
    });
    devText += `\nWould you like me to assign these developers and compute the complete cost estimate?`;
    state.response = {
      text: devText,
      actionType: "bench_matching",
      devMatches: devs,
      quickReplies: ["Calculate cost estimate", "Show technical architecture", "Generate SOW proposal"],
    };
  } else if (nextTarget === "SOWNode") {
    state = runDeveloperMatchingNode(state);
    state = runHourEstimationNode(state);
    state = runTimelineNode(state);
    state = runCostEstimationNode(state);
    state = runCloudPricingNode(state);
    state = runApiPricingNode(state);
    state = runProposalNode(state);
    state = runSOWNode(state);
  } else {
    // LLMFlow: Gemini -> OpenAI -> Fallback
    state = await runGeminiNode(state);
    if (state._llmFailed) {
      state = await runOpenAINode(state);
      if (state._openaiFailed) {
        state = runFallbackNode(state);
      }
    }
  }

  return state;
}
