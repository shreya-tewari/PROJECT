/**
 * EstimationAgent
 * Specialized agent for developer matching, hour calculation, timeline & financial estimation.
 */

import { runDeveloperMatchingNode } from '../nodes/DeveloperMatchingNode';
import { runHourEstimationNode } from '../nodes/HourEstimationNode';
import { runTimelineNode } from '../nodes/TimelineNode';
import { runCostEstimationNode } from '../nodes/CostEstimationNode';
import { runCloudPricingNode } from '../nodes/CloudPricingNode';
import { runApiPricingNode } from '../nodes/ApiPricingNode';
import { runMarkdownResponseNode } from '../nodes/MarkdownResponseNode';

export function runEstimationAgent(state) {
  let currentState = state;
  currentState = runDeveloperMatchingNode(currentState);
  currentState = runHourEstimationNode(currentState);
  currentState = runTimelineNode(currentState);
  currentState = runCostEstimationNode(currentState);
  currentState = runCloudPricingNode(currentState);
  currentState = runApiPricingNode(currentState);
  currentState = runMarkdownResponseNode(currentState);
  return currentState;
}
