/**
 * PreprocessNode
 * Single Responsibility: Clean user input, trim whitespace, normalize text.
 */

export function runPreprocessNode(state) {
  const rawInput = state.userInput || "";
  const cleanedInput = rawInput.trim();
  const lowerInput = cleanedInput.toLowerCase();

  return {
    ...state,
    userInput: cleanedInput,
    _internal: {
      lowerInput,
      length: cleanedInput.length,
    },
  };
}
