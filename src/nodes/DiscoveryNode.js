/**
 * DiscoveryNode
 * Single Responsibility: Processes project discovery intent and establishes project scope.
 */

export function runDiscoveryNode(state) {
  const memory = { ...(state.memory || {}) };
  memory.conversationPhase = 'features_suggested';

  return {
    ...state,
    memory,
  };
}
