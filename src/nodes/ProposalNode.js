/**
 * ProposalNode
 * Single Responsibility: Build normalized proposal object metadata for state persistence.
 */

export function runProposalNode(state) {
  const memory = state.memory || {};
  const cost = state.costEstimate || {};
  const devs = state.developers || [];
  const duration = memory.durationWeeks || 12;
  const propId = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;

  const proposalObj = {
    proposalId: propId,
    projectName: memory.projectTitle || "Enterprise Software Platform",
    clientName: memory.userName ? `${memory.userName} (Enterprise)` : "Enterprise Client",
    industry: memory.industry || "Software & SaaS",
    techStack: memory.techStack?.length > 0 ? memory.techStack : ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    assignedDevsCount: memory.devCount || 4,
    durationWeeks: duration,
    estimatedCost: cost.grandTotal || 54970,
    status: "Won",
    winProbability: 96,
    executiveSummary: `SOW proposal for ${memory.projectTitle || "Enterprise Platform"} — ${memory.devCount || 4} engineers, ${duration} weeks delivery.`,
    teamStructure: devs,
    financials: {
      devCost: cost.devCost || 0,
      cloudInfraCost: cost.cloudCost || 3500,
      thirdPartyApiCost: cost.apiCost || 2000,
      contingencyBuffer: cost.contingency || 0,
      grandTotal: cost.grandTotal || 0,
      currency: "USD",
    },
  };

  return {
    ...state,
    proposal: proposalObj,
  };
}
