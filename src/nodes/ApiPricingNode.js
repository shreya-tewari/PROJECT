/**
 * ApiPricingNode
 * Single Responsibility: Compute 3rd party API costs, 10% risk contingency buffer, and grand total.
 */

import { calculateCloudPricing } from '../data/cloudPricing.js';

export function runApiPricingNode(state) {
  const memory = state.memory || {};
  const promptText = state.userInput || "";
  const pricing = calculateCloudPricing(promptText, memory.projectTitle, memory.industry, memory.complexityScore);

  const devCost = state.costEstimate?.devCost || 0;
  const cloudCost = state.costEstimate?.cloudCost || pricing.cloudInfraCost;
  const apiCost = pricing.thirdPartyApiCost;
  const contingency = Math.round(devCost * 0.10);
  const grandTotal = devCost + cloudCost + apiCost + contingency;

  return {
    ...state,
    costEstimate: {
      ...(state.costEstimate || {}),
      apiCost,
      thirdPartyApiDescription: pricing.thirdPartyApiDescription,
      contingency,
      grandTotal,
      currency: "USD",
    },
  };
}
