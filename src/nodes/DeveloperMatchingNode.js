/**
 * DeveloperMatchingNode
 * Single Responsibility: Search and rank bench developers based on required skills and team composition rules.
 */

import { matchBenchDevelopers } from '../services/ragEngine';

export function runDeveloperMatchingNode(state) {
  const memory = state.memory || {};
  const stack = memory.techStack && memory.techStack.length > 0 ? memory.techStack : ['React', 'Node.js', 'PostgreSQL', 'AWS'];
  const devCount = memory.devCount || 4;

  const matchedDevs = matchBenchDevelopers(stack, devCount, memory.isLowBudget);

  return {
    ...state,
    developers: matchedDevs,
  };
}
