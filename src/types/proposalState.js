/**
 * ProposalState Definition
 * Typed State interface for LangGraph Pipeline
 */

export function createInitialProposalState() {
  return {
    userInput: "",
    history: [],
    memory: {
      userName: null,
      projectTitle: null,
      industry: null,
      techStack: [],
      devCount: null,
      devCountExplicit: false,
      durationWeeks: null,
      durationExplicit: false,
      totalProjectHours: null,
      complexityScore: 5,
      isLowBudget: false,
      explicitHourlyBudget: null,
      explicitTotalBudget: null,
      avgHourlyRate: 55,
      cloudCost: 1200,
      conversationPhase: null, // 'discovery' | 'features_suggested' | 'features_confirmed' | 'estimated'
      suggestedFeatures: null,
      extractedRequirements: null,
    },
    intent: "GENERAL_CONVERSATION", // GREETING | MEMORY_RECALL | PROJECT_DISCOVERY | FEATURE_CONFIRMATION | COST_ESTIMATION | ARCHITECTURE | BENCH_MATCHING | PROPOSAL_GENERATION | GENERAL_CONVERSATION
    project: {
      title: null,
      category: null,
      industry: null,
    },
    selectedFeatures: [],
    suggestedFeatures: [],
    developers: [],
    architecture: null,
    costEstimate: {
      totalHours: 0,
      devCost: 0,
      cloudCost: 0,
      apiCost: 0,
      contingency: 0,
      grandTotal: 0,
      currency: "USD",
    },
    proposal: null,
    response: {
      text: "",
      actionType: "chat", // 'chat' | 'welcome' | 'cost_estimate' | 'bench_matching' | 'architecture' | 'proposal' | 'llm'
      devMatches: null,
      quickReplies: [],
    },
    apiKey: null,
    stepLog: [],
  };
}

export function updateProposalState(currentState, updates) {
  return {
    ...currentState,
    ...updates,
    memory: {
      ...currentState.memory,
      ...(updates.memory || {}),
    },
    response: {
      ...currentState.response,
      ...(updates.response || {}),
    },
    costEstimate: {
      ...currentState.costEstimate,
      ...(updates.costEstimate || {}),
    },
  };
}
