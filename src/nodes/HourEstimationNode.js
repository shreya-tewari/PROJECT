/**
 * HourEstimationNode
 * Single Responsibility: Compute total project person-hours based on complexity score.
 */

export function estimateTotalProjectHours(complexityScore) {
  if (complexityScore >= 9) return 2000;
  if (complexityScore >= 8) return 1400;
  if (complexityScore >= 7) return 960;
  if (complexityScore >= 6) return 720;
  if (complexityScore >= 5) return 520;
  if (complexityScore >= 4) return 380;
  return 240;
}

export function runHourEstimationNode(state) {
  const memory = state.memory || {};
  const totalHours = memory.totalProjectHours || estimateTotalProjectHours(memory.complexityScore || 5);

  return {
    ...state,
    costEstimate: {
      ...(state.costEstimate || {}),
      totalHours,
    },
  };
}
