/**
 * MemoryRecallNode
 * Single Responsibility: Format a summary of everything currently remembered in state.memory.
 */

export function runMemoryRecallNode(state) {
  const memory = state.memory || {};
  let text = `🧠 **Here is what I remember about our conversation context:**\n\n`;

  text += `- **User Name**: ${memory.userName || 'Not specified'}\n`;
  text += `- **Project Title**: ${memory.projectTitle || 'Not established yet'}\n`;
  text += `- **Industry**: ${memory.industry || 'Software & SaaS'}\n`;
  text += `- **Preferred Tech Stack**: ${memory.techStack?.length > 0 ? memory.techStack.join(', ') : 'React, Node.js, AWS'}\n`;

  if (memory.devCount) text += `- **Requested Team Size**: ${memory.devCount} developers\n`;
  if (memory.durationWeeks) text += `- **Target Timeline**: ${memory.durationWeeks} weeks\n`;
  if (memory.isLowBudget) text += `- **Budget Note**: Low budget / cost-optimized execution requested\n`;
  if (memory.explicitHourlyBudget) text += `- **Target Hourly Rate**: $${memory.explicitHourlyBudget}/hr\n`;
  if (memory.explicitTotalBudget) text += `- **Max Total Budget**: $${memory.explicitTotalBudget.toLocaleString()}\n`;

  text += `\nHow would you like to proceed with your project estimate or SOW proposal?`;

  return {
    ...state,
    response: {
      text,
      actionType: "chat",
      devMatches: null,
      quickReplies: ["Calculate cost estimate", "Generate SOW proposal", "Show cloud architecture"],
    },
  };
}
