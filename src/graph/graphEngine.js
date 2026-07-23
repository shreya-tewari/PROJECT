/**
 * Multi-Turn Presales Consultant Pipeline with Conversation Phase Guard Machine
 */

import { runPreprocessNode } from '../nodes/PreprocessNode.js';
import { runMemoryExtractNode } from '../nodes/MemoryExtractNode.js';
import { runIntentClassificationNode } from '../nodes/IntentClassificationNode.js';
import { routeIntent } from './router.js';

import { runGreetingNode } from '../nodes/GreetingNode.js';
import { runDiscoveryNode } from '../nodes/DiscoveryNode.js';
import { runFeatureSuggestionNode } from '../nodes/FeatureSuggestionNode.js';
import { runFeatureConfirmationNode } from '../nodes/FeatureConfirmationNode.js';
import { runArchitectureNode } from '../nodes/ArchitectureNode.js';
import { runDeveloperMatchingNode } from '../nodes/DeveloperMatchingNode.js';
import { runHourEstimationNode } from '../nodes/HourEstimationNode.js';
import { runTimelineNode } from '../nodes/TimelineNode.js';
import { runCostEstimationNode } from '../nodes/CostEstimationNode.js';
import { runCloudPricingNode } from '../nodes/CloudPricingNode.js';
import { runApiPricingNode } from '../nodes/ApiPricingNode.js';
import { runMarkdownResponseNode } from '../nodes/MarkdownResponseNode.js';
import { runProposalNode } from '../nodes/ProposalNode.js';
import { runSOWNode } from '../nodes/SOWNode.js';
import { runGeminiNode } from '../nodes/GeminiNode.js';
import { runOpenAINode } from '../nodes/OpenAINode.js';
import { runFallbackNode } from '../nodes/FallbackNode.js';
import { observability } from '../services/observabilityService.js';

export async function executeProposalGraph(inputState) {
  const spanId = observability.startSpan("executeProposalGraph", { userInput: inputState.userInput });
  let state = { ...inputState };

  try {
    // Step 1: Preprocess Node
    state = runPreprocessNode(state);

    // Step 2: Memory Extract Node (Domain state only)
    state = await runMemoryExtractNode(state);

    // Step 3: Intent Classifier Node (Fresh calculation on every turn)
    state = runIntentClassificationNode(state);

    // Step 4: Router (Declarative conditional routing)
    const { node } = routeIntent(state);

    // Step 5: Execute Target Node
    if (node === "GreetingNode") {
      state = runGreetingNode(state);
    } else if (node === "DiscoveryNode") {
      state = runDiscoveryNode(state);
      state = await runFeatureSuggestionNode(state);
    } else if (node === "FeatureSelectionNode") {
      state = runFeatureConfirmationNode(state);
      state = runArchitectureNode(state);
    } else if (node === "ArchitectureNode") {
      state = runArchitectureNode(state);
    } else if (node === "CostEstimatorNode") {
      state = runDeveloperMatchingNode(state);
      state = runHourEstimationNode(state);
      state = runTimelineNode(state);
      state = runCostEstimationNode(state);
      state = runCloudPricingNode(state);
      state = runApiPricingNode(state);
      state = runMarkdownResponseNode(state);
    } else if (node === "BenchNode") {
      state = runDeveloperMatchingNode(state);
      const devs = state.developers || [];
      let devText = `👨‍💻 **Matching Bench Developers for ${state.memory?.projectTitle || 'Software Application'}:**\n\n`;
      devs.forEach(d => {
        devText += `- **${d.name}** (${d.role}) — $${d.hourlyRate}/hr | ${d.experienceYears} yrs exp\n`;
      });
      devText += `\nWould you like me to calculate the complete cost estimate for this team?`;
      state = {
        ...state,
        response: {
          text: devText,
          actionType: "bench_matching",
          devMatches: devs,
          quickReplies: ["Calculate cost estimate", "Show architecture", "Generate SOW proposal"],
        }
      };
    } else if (node === "ProposalNode") {
      state = runDeveloperMatchingNode(state);
      state = runHourEstimationNode(state);
      state = runTimelineNode(state);
      state = runCostEstimationNode(state);
      state = runCloudPricingNode(state);
      state = runApiPricingNode(state);
      state = runProposalNode(state);
      state = runSOWNode(state);
    } else {
      // ChatNode (LLM Fallback Cascade)
      state = await runGeminiNode(state);
      if (state._llmFailed) {
        state = await runOpenAINode(state);
        if (state._openaiFailed) {
          state = runFallbackNode(state);
        }
      }
    }

    observability.endSpan(spanId, { targetNode: node, intent: state.intent, status: "SUCCESS" });
    return state;
  } catch (err) {
    observability.endSpan(spanId, {}, err);
    state = runFallbackNode(state);
    return state;
  }
}
