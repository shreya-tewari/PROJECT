/**
 * ProposalState Definition with Strict Conversation Phase Guard Engine
 * Phases: DISCOVERY -> FEATURE_SELECTION -> ARCHITECTURE -> COST -> PROPOSAL -> COMPLETE
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
      conversationPhase: "DISCOVERY", // DISCOVERY -> FEATURE_SELECTION -> ARCHITECTURE -> COST -> PROPOSAL -> COMPLETE
      suggestedFeatures: null,
      extractedRequirements: null,
      structuredJson: null,
    },
    intent: "GENERAL_CHAT",
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
      actionType: "chat",
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
