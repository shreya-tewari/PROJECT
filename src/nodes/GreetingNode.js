/**
 * GreetingNode
 * Single Responsibility: Format friendly welcome & greeting response.
 */

export function runGreetingNode(state) {
  const userName = state.memory?.userName ? `, ${state.memory.userName}` : "";
  const text = `Hello${userName}! 👋 I am **ProposalAI Assistant**.\n\nI can help you with:\n- 💡 **Project Scope & Feature Discovery**\n- 💰 **Realistic Cost & Timeline Estimates**\n- 👨‍💻 **Bench Developer Team Allocation**\n- 🏗️ **Technical Cloud Architecture Recommendations**\n- 📄 **Complete SOW Proposal Generation**\n\nWhat software project would you like to build today?`;

  return {
    ...state,
    response: {
      text,
      actionType: "chat",
      devMatches: null,
      quickReplies: ["I want to build a web app", "Show available bench developers", "Generate cost estimate"],
    },
  };
}
