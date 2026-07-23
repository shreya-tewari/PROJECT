/**
 * ArchitectureNode
 * Single Responsibility: Return technical architecture recommendations by industry & complexity tier.
 * Prompt user if they'd like to calculate pricing/cost estimate.
 */

import { getArchitectureRecommendation } from '../templates/architectureTemplates.js';

export function runArchitectureNode(state) {
  const memory = state.memory || {};
  const arch = getArchitectureRecommendation(memory.industry, memory.complexityScore);

  let text = `🏗️ **Recommended Enterprise Technical Architecture for ${memory.projectTitle || 'Software Application'}:**\n\n`;
  text += `- **Frontend Layer**: ${arch.frontend}\n`;
  text += `- **Backend Microservices**: ${arch.backend}\n`;
  text += `- **Database & Caching**: ${arch.database}\n`;
  text += `- **Cloud Infrastructure**: ${arch.cloud}\n`;
  text += `- **AI / Analytics Layer**: ${arch.aiLayer}\n`;
  text += `- **DevOps & CI/CD**: ${arch.deployment}\n`;
  text += `- **Security & Compliance**: ${arch.security}\n\n`;
  text += `The scope and technical architecture have been configured!\n\nWould you like me to calculate the **itemized cost estimate** and team allocation now?`;

  const updatedMemory = {
    ...memory,
    workflowStep: "6_WAITING_FOR_COST_REQUEST",
  };

  return {
    ...state,
    memory: updatedMemory,
    architecture: arch,
    response: {
      text,
      actionType: "architecture",
      devMatches: null,
      quickReplies: ["Calculate cost estimate", "Show developer team", "Generate SOW proposal"],
    },
  };
}
