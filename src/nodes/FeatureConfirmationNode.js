/**
 * FeatureConfirmationNode
 * Single Responsibility: Parses user feature confirmation input (e.g. "all", "1, 2, 4", "skip 3") and selects target features.
 */

export function runFeatureConfirmationNode(state) {
  const text = (state.userInput || "").toLowerCase();
  const memory = { ...(state.memory || {}) };
  const allFeatures = memory.suggestedFeatures || state.suggestedFeatures || [];

  let selectedFeatures = [];

  if (text.includes("all") || text.includes("everything") || text.includes("yes") || text.includes("sounds good") || text.includes("sure")) {
    selectedFeatures = [...allFeatures];
  } else if (text.includes("skip") || text.includes("remove") || text.includes("without")) {
    const skippedNumbers = (text.match(/\d+/g) || []).map(Number);
    selectedFeatures = allFeatures.filter((_, idx) => !skippedNumbers.includes(idx + 1));
  } else {
    const selectedNumbers = (text.match(/\d+/g) || []).map(Number);
    if (selectedNumbers.length > 0) {
      selectedFeatures = allFeatures.filter((_, idx) => selectedNumbers.includes(idx + 1));
    } else {
      selectedFeatures = [...allFeatures];
    }
  }

  if (selectedFeatures.length === 0) selectedFeatures = [...allFeatures];

  const extractedRequirements = selectedFeatures.map(f => f.name);
  memory.extractedRequirements = extractedRequirements;
  memory.conversationPhase = 'features_confirmed';

  return {
    ...state,
    memory,
    selectedFeatures,
  };
}
