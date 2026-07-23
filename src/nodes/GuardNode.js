/**
 * GuardNode
 * Prevents unauthorized jumps directly to pricing/cost estimation unless conversation phase allows it
 * or user explicitly requested pricing in the current turn.
 */

export function runGuardNode(state) {
  const memory = state.memory || {};
  const phase = memory.conversationPhase || "DISCOVERY";
  const intent = state.intent || "PROJECT_DISCOVERY";
  const lowerInput = (state.userInput || "").toLowerCase();

  const explicitCostRequest = ['cost', 'price', 'budget', 'estimate', 'how much', 'quote', 'quotation', 'rate', 'pricing', 'investment', 'dolar', 'dollar'].some(k => lowerInput.includes(k));

  let blocked = false;
  let fallbackTarget = null;

  // If node requested is COST estimation but phase is not ARCHITECTURE or FEATURE_SELECTION, and user didn't ask for cost
  if (!explicitCostRequest && intent !== "COST_REQUEST") {
    if (phase === "DISCOVERY" || phase === "FEATURE_SELECTION") {
      blocked = true;
      fallbackTarget = "FeatureRecommendationNode";
    }
  }

  return {
    ...state,
    _guard: {
      blocked,
      fallbackTarget,
      phase,
      explicitCostRequest,
    },
  };
}
