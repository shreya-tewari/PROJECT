/**
 * SOWNode
 * Single Responsibility: Format complete Markdown Scope of Work (SOW) proposal document.
 */

import { buildSowPromptTemplate } from '../prompts/promptTemplates.js';

export function runSOWNode(state) {
  const memory = state.memory || {};
  const cost = state.costEstimate || {};
  const devs = state.developers || [];
  const devBreakdown = cost.devBreakdown || [];

  const markdown = buildSowPromptTemplate({
    projTitle: memory.projectTitle || 'Enterprise Software Platform',
    clientName: memory.userName ? `${memory.userName} (Enterprise)` : "Enterprise Client",
    industry: memory.industry || "Software & SaaS",
    cleanTitle: state.userInput || '',
    userInput: state.userInput || '',
    stack: memory.techStack?.length > 0 ? memory.techStack : ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    devCount: memory.devCount || 4,
    totalHrs: cost.totalHours || 520,
    duration: memory.durationWeeks || 12,
    benchDevs: devs,
    devBreakdownForSow: devBreakdown,
    devCost: cost.devCost || 0,
    cloudCost: cost.cloudCost || 3500,
    contingency: cost.contingency || 0,
    grandTotal: cost.grandTotal || 0,
    extractedRequirements: memory.extractedRequirements,
  });

  return {
    ...state,
    response: {
      text: markdown,
      actionType: "proposal",
      devMatches: devs,
      quickReplies: ["Open Document Preview", "Download SOW PDF", "Talk to Bench Engineer"],
    },
  };
}
