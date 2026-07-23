/**
 * ValidationAgent
 * Quality Gate & Constraint Reasoner agent. Validates financial sanity, team bounds, and memory state before output rendering.
 */

export function runValidationAgent(state) {
  const memory = state.memory || {};
  const cost = state.costEstimate || {};
  const warnings = [];

  if (memory.explicitTotalBudget && cost.grandTotal > memory.explicitTotalBudget) {
    warnings.push(`Grand total ($${cost.grandTotal.toLocaleString()}) exceeds user explicit budget ($${memory.explicitTotalBudget.toLocaleString()}).`);
  }

  if (state.developers && state.developers.length === 0) {
    warnings.push("No bench developers assigned to project.");
  }

  const isValid = warnings.length === 0;

  return {
    ...state,
    _validation: {
      isValid,
      warnings,
      timestamp: new Date().toISOString(),
    },
  };
}
