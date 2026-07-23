/**
 * IntentClassificationNode
 * Classifies user intent into discrete intents:
 * PROJECT_DISCOVERY, FEATURE_CONFIRMATION, ARCHITECTURE_REQUEST, COST_REQUEST, PROPOSAL_REQUEST, GREETING, GENERAL_CHAT.
 */

export function runIntentClassificationNode(state) {
  const text = state.userInput || "";
  const lower = text.trim().toLowerCase();
  const memory = state.memory || {};
  const phase = memory.conversationPhase || "DISCOVERY";

  let intent = "GENERAL_CHAT";

  // Explicit Proposal Request
  const isProposalReq = (lower.includes("sow") || lower.includes("proposal") || lower.includes("export")) && 
                        (lower.includes("generate") || lower.includes("create") || lower.includes("export") || lower.includes("make"));

  // Explicit Cost Request (Only when user explicitly asks for cost/pricing)
  const isExplicitCost = ['cost', 'price', 'budget', 'estimate', 'how much', 'quote', 'quotation', 'rate', 'pricing', 'investment', 'how much will it cost'].some(k => lower.includes(k));

  if (/^(hi+|hy+|hello+|hey+|good\s*(morning|afternoon|evening)|greetings|yo|sup)(\s|!|\.|$)/i.test(lower)) {
    intent = "GREETING";
  } else if (isProposalReq) {
    intent = "PROPOSAL_REQUEST";
  } else if (isExplicitCost) {
    intent = "COST_REQUEST";
  } else if (['architecture', 'tech stack', 'cloud topology', 'database', 'infrastructure'].some(k => lower.includes(k))) {
    intent = "ARCHITECTURE_REQUEST";
  } else {
    const isConfirmation = /^(all|yes|sure|ok|approved|include|include all|sounds good|go ahead|skip|remove|[0-9, ]+)$/i.test(lower.trim());
    const isProjectDescription = ['want to build', 'need an app', 'need a website', 'thinking of creating', 'build me', 'create a platform', 'have an idea', 'i want', 'i need'].some(phrase => lower.includes(phrase));

    if (isConfirmation && (phase === "FEATURE_SELECTION" || phase === "DISCOVERY")) {
      intent = "FEATURE_CONFIRMATION";
    } else if (isProjectDescription || lower.length > 20) {
      intent = "PROJECT_DISCOVERY";
    }
  }

  return {
    ...state,
    intent,
  };
}
