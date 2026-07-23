/**
 * TimelineNode
 * Single Responsibility: Calculate calendar delivery weeks based on total person-hours and allocated dev count.
 */

export function runTimelineNode(state) {
  const memory = state.memory || {};
  const totalHrs = state.costEstimate?.totalHours || 520;
  const devCount = memory.devCount || Math.max(1, Math.min(8, Math.round((memory.complexityScore || 5) * 0.75)));

  const hrsPerDevPerMonth = 160;
  const rawMonths = totalHrs / (devCount * hrsPerDevPerMonth);
  const rawWeeks = Math.ceil(rawMonths * 4.33);

  const durationWeeks = memory.durationExplicit
    ? memory.durationWeeks
    : Math.max(3, Math.min(26, rawWeeks));

  return {
    ...state,
    memory: {
      ...memory,
      devCount,
      durationWeeks,
    },
  };
}
