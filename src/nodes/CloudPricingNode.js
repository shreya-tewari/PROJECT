/**
 * CloudPricingNode
 * Single Responsibility: Compute cloud infrastructure hosting costs based on project tier.
 */

import { calculateCloudPricing } from '../data/cloudPricing';

export function runCloudPricingNode(state) {
  const memory = state.memory || {};
  const promptText = state.userInput || "";
  const pricing = calculateCloudPricing(promptText, memory.projectTitle, memory.industry, memory.complexityScore);

  return {
    ...state,
    costEstimate: {
      ...(state.costEstimate || {}),
      cloudCost: pricing.cloudInfraCost,
      cloudInfraDescription: pricing.cloudInfraDescription,
    },
  };
}
