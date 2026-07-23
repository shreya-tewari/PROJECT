/**
 * DiscoveryAgent
 * Specialized agent for domain classification, requirements extraction & feature recommendations.
 */

import { runDiscoveryNode } from '../nodes/DiscoveryNode';
import { runFeatureSuggestionNode } from '../nodes/FeatureSuggestionNode';

export function runDiscoveryAgent(state) {
  let currentState = runDiscoveryNode(state);
  currentState = runFeatureSuggestionNode(currentState);
  return currentState;
}
