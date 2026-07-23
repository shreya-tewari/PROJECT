/**
 * FallbackNode
 * Single Responsibility: Format clean structured offline response if LLM APIs are unavailable.
 */

export function runFallbackNode(state) {
  const memory = state.memory || {};
  const projTitle = memory.projectTitle || "Software Application";
  const stackStr = memory.techStack?.length > 0 ? memory.techStack.join(', ') : "React, Node.js, AWS";

  const text = `I can help you build **${projTitle}** using **${stackStr}**.\n\nHere is how we can proceed:\n- 💡 **Scope & Requirements**: Define core modules and feature set\n- 💰 **Cost & Timeline**: Estimate person-hours and team size\n- 👨‍💻 **Engineering Bench**: Match available developers for immediate deployment\n- 📄 **SOW Document**: Generate complete consulting proposal\n\nWould you like me to calculate the cost estimate or match bench developers for this project?`;

  return {
    ...state,
    response: {
      text,
      actionType: "chat",
      devMatches: null,
      quickReplies: ["Calculate cost estimate", "Match bench developers", "Generate SOW proposal"],
    },
  };
}
