/**
 * CostEstimationNode
 * Single Responsibility: Allocate total hours across developer roles and compute total labor engineering cost.
 */

export function allocateHoursByRole(totalHrs, roleNames) {
  const count = roleNames.length;
  if (count === 0) return [];
  if (count === 1) return [totalHrs];

  const roleWeights = roleNames.map(r => {
    const rLow = r.toLowerCase();
    if (rLow.includes('full stack') || rLow.includes('lead') || rLow.includes('architect')) return 1.3;
    if (rLow.includes('backend') || rLow.includes('ai') || rLow.includes('ml')) return 1.1;
    if (rLow.includes('frontend') || rLow.includes('mobile')) return 1.0;
    if (rLow.includes('devops')) return 0.6;
    if (rLow.includes('qa') || rLow.includes('tester') || rLow.includes('ui/ux')) return 0.5;
    return 1.0;
  });

  const totalWeight = roleWeights.reduce((s, w) => s + w, 0);
  let allocated = roleWeights.map(w => Math.round((w / totalWeight) * totalHrs));
  const sumAlloc = allocated.reduce((s, h) => s + h, 0);
  const diff = totalHrs - sumAlloc;
  allocated[0] += diff;

  return allocated;
}

export function runCostEstimationNode(state) {
  const totalHrs = state.costEstimate?.totalHours || 520;
  const devs = state.developers || [];
  const roleNames = devs.map(d => d.role);
  const hoursPerRole = allocateHoursByRole(totalHrs, roleNames);

  const devBreakdown = devs.map((d, i) => ({
    ...d,
    hours: hoursPerRole[i] || 0,
    cost: Math.round(d.hourlyRate * (hoursPerRole[i] || 0)),
  }));

  const devCost = devBreakdown.reduce((sum, d) => sum + d.cost, 0);

  return {
    ...state,
    costEstimate: {
      ...(state.costEstimate || {}),
      devCost,
      devBreakdown,
    },
  };
}
