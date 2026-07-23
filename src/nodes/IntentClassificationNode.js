/**
 * IntentClassificationNode
 * Re-classifies user intent dynamically on EVERY message.
 * Memory is used only for context, never for intent persistence.
 */

export function runIntentClassificationNode(state) {
  const rawInput = state.userInput || "";
  const lower = rawInput.trim().toLowerCase();

  let intent = "GENERAL";

  // 1. Greeting Check
  if (/^(hi+|hy+|hello+|hey+|good\s*(morning|afternoon|evening)|greetings|yo|sup)(\s|!|\.|$)/i.test(lower)) {
    intent = "GREETING";
  }
  // 2. Proposal / SOW Generation Request
  else if ((lower.includes("sow") || lower.includes("proposal") || lower.includes("export")) && 
           (lower.includes("generate") || lower.includes("create") || lower.includes("make") || lower.includes("export") || lower.includes("draft"))) {
    intent = "PROPOSAL_GENERATION";
  }
  // 3. Cost / Price / Budget / Timeline Request
  else if (['cost', 'price', 'budget', 'estimate', 'how much', 'quote', 'quotation', 'rate', 'pricing', 'investment', 'approximate cost', 'time only', 'timeline'].some(k => lower.includes(k))) {
    intent = "COST_ESTIMATION";
  }
  // 4. Bench Developer Allocation Request
  else if (['bench', 'developer', 'engineer', 'who is available', 'team allocation', 'devs'].some(k => lower.includes(k))) {
    intent = "BENCH_MATCHING";
  }
  // 5. Technical Architecture Request
  else if (['architecture', 'tech stack', 'cloud topology', 'database', 'infrastructure', 'stack'].some(k => lower.includes(k))) {
    intent = "ARCHITECTURE";
  }
  // 6. Feature Scope Confirmation / Selection
  else if (/^(all|yes|sure|ok|approved|include|include all|sounds good|go ahead|skip|remove|[0-9, ]+)$/i.test(lower) && lower.length < 35) {
    intent = "FEATURE_CONFIRMATION";
  }
  // 7. Project Discovery (Initial Description)
  else if (['want to build', 'need an app', 'need a website', 'thinking of creating', 'build me', 'create a platform', 'have an idea', 'i want', 'i need', 'platform', 'app', 'website', 'system'].some(k => lower.includes(k)) || lower.length > 25) {
    intent = "PROJECT_DISCOVERY";
  }

  return {
    ...state,
    intent,
  };
}
