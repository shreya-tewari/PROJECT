/**
 * ArchitectureNode
 * Single Responsibility: Return technical architecture recommendations by industry & complexity tier.
 */

import { getArchitectureRecommendation } from '../templates/architectureTemplates';

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
  text += `Would you like me to calculate the cost estimate or generate a complete Scope of Work (SOW) proposal based on this architecture?`;

  return {
    ...state,
    architecture: arch,
    response: {
      text,
      actionType: "architecture",
      devMatches: null,
      quickReplies: ["Calculate cost estimate", "Generate SOW proposal", "Match available developers"],
    },
  };
}
