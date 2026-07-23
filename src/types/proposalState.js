/**
 * ProposalState Definition with Strict Multi-Step Workflow Pipeline
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
      workflowStep: "1_REQUIREMENT_EXTRACTION", // 1_EXTRACTION -> 2_SUMMARY -> 3_FEATURES -> 4_WAIT_FEATURE_APP -> 5_ARCH -> 6_WAIT_COST_REQ -> 7_DEV_MATCH -> 8_COST -> 9_PROPOSAL
      suggestedFeatures: null,
      extractedRequirements: null,
      structuredJson: null,
    },
    intent: "GENERAL_CONVERSATION",
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
