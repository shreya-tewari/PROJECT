/**
 * MarkdownResponseNode
 * Single Responsibility: Format cost estimations, bench allocation summaries, and markdown responses.
 */

export function runMarkdownResponseNode(state) {
  const memory = state.memory || {};
  const cost = state.costEstimate || {};
  const devs = state.developers || [];
  const projTitle = memory.projectTitle || "Software Application";

  const totalHrs = cost.totalHours || 520;
  const duration = memory.durationWeeks || 12;
  const devCount = memory.devCount || devs.length || 4;

  const devBreakdown = cost.devBreakdown || devs.map(d => ({ ...d, hours: Math.round(totalHrs / devCount), cost: Math.round(d.hourlyRate * (totalHrs / devCount)) }));
  const devCost = cost.devCost || devBreakdown.reduce((sum, d) => sum + d.cost, 0);
  const cloudCost = cost.cloudCost || 1200;
  const apiCost = cost.apiCost || 400;
  const contingency = cost.contingency || Math.round(devCost * 0.10);
  const grandTotal = cost.grandTotal || (devCost + cloudCost + apiCost + contingency);

  let text = `Here is the realistic cost & developer allocation breakdown for **${projTitle}**:\n\n`;
  text += `> 💡 *Total project effort: ~${totalHrs} person-hours of work. Team size affects delivery speed, not total effort — so cost stays consistent regardless of how many developers you use.*\n\n`;
  text += `👥 **Allocated Bench Engineering Team (${duration} Weeks delivery / Each dev works their module):**\n`;

  devBreakdown.forEach(d => {
    text += `- **${d.name}** (${d.role}) — $${d.hourlyRate}/hr × ${d.hours} hrs = **$${d.cost.toLocaleString()}**\n`;
  });

  text += `\n💰 **Itemized Financial & Delivery Investment Summary:**\n`;
  text += `- **Direct Engineering Allocation**: **$${devCost.toLocaleString()}** (${totalHrs} total person-hours across ${devCount} developers)\n`;
  text += `- **Cloud Infrastructure Setup (${cost.cloudInfraDescription || 'AWS Cloud Managed Services'})**: **$${cloudCost.toLocaleString()}**\n`;
  text += `- **Third-Party APIs & AI Services (${cost.thirdPartyApiDescription || 'Stripe, Twilio & Managed APIs'})**: **$${apiCost.toLocaleString()}**\n`;
  text += `- **10% Risk & Contingency Buffer**: **$${contingency.toLocaleString()}**\n`;
  text += `- **Estimated Total Investment**: **$${grandTotal.toLocaleString()} USD**\n`;

  return {
    ...state,
    response: {
      text,
      actionType: "cost_estimate",
      devMatches: devs,
      quickReplies: ["Generate SOW Proposal Now", "Show Technical Architecture", "Modify Team Size"],
    },
  };
}
