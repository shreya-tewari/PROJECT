/**
 * ArchitectureAgent
 * Specialized agent for technical cloud architecture & infrastructure stack recommendation.
 */

import { runArchitectureNode } from '../nodes/ArchitectureNode';

export function runArchitectureAgent(state) {
  return runArchitectureNode(state);
}
