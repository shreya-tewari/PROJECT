/**
 * IntentClassificationNode
 * Single Responsibility: Classify user query into discrete intents.
 */

export function runIntentClassificationNode(state) {
  const text = state.userInput || "";
  const lower = text.trim().toLowerCase();
  const memory = state.memory || {};

  let intent = "GENERAL_CONVERSATION";

  if (/^(hi+|hy+|hello+|hey+|good\s*(morning|afternoon|evening)|greetings|yo|sup)(\s|!|\.|$)/i.test(lower)) {
    intent = "GREETING";
  } else if (lower.includes('remember') || lower.includes('what did i') || lower.includes('what is my name') || lower.includes('my stack') || lower.includes('my project')) {
    intent = "MEMORY_RECALL";
  } else if ((lower.includes('generate') && (lower.includes('sow') || lower.includes('proposal'))) || 
             (lower.includes('create') && lower.includes('proposal')) ||
             (lower.includes('draft') && lower.includes('sow')) ||
             ['sow', 'generate sow', 'generate proposal'].includes(lower)) {
    intent = "PROPOSAL_GENERATION";
  } else if (['cost', 'price', 'budget', 'budegt', 'rate', 'how much', 'quote', 'estimate', 'dolar', 'dollar', 'cheap', 'less', 'affordable', 'low'].some(k => lower.includes(k)) || memory.isLowBudget || memory.explicitTotalBudget) {
    intent = "COST_ESTIMATION";
  } else if (['timeline', 'duration', 'how long', 'time for this', 'deadline', 'delivery'].some(k => lower.includes(k))) {
    intent = "COST_ESTIMATION";
  } else if (['bench', 'developer', 'engineer', 'who is available', 'match developer'].some(k => lower.includes(k))) {
    intent = "BENCH_MATCHING";
  } else if (['architecture', 'cloud', 'database', 'stack', 'infrastructure'].some(k => lower.includes(k))) {
    intent = "ARCHITECTURE";
  } else {
    const isShortConfirmation = /^(all|yes|sure|ok|fine|everything|sounds good|go ahead|perfect|skip|remove|[0-9, ]+)$/i.test(lower.trim());
    const projectKeywords = ['want', 'need', 'build', 'create', 'make', 'looking for', 'website', 'app', 'application', 'platform', 'portal', 'system', 'software', 'clinic', 'store', 'shop', 'marketplace', 'saas', 'tool', 'dashboard', 'management', 'booking', 'appointment', 'e-commerce', 'ecommerce', 'crm', 'erp', 'social', 'streaming', 'game', 'mobile', 'startup', 'project', 'movie', 'video', 'face', 'swap', 'lead', 'scrape'];
    const hasProjectIntent = projectKeywords.some(kw => lower.includes(kw));

    if (hasProjectIntent && (lower.length > 15 || !isShortConfirmation)) {
      intent = "PROJECT_DISCOVERY";
    } else if (memory.conversationPhase === 'features_suggested' && isShortConfirmation) {
      intent = "FEATURE_CONFIRMATION";
    }
  }

  return {
    ...state,
    intent,
  };
}
