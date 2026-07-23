import { processLangGraphTurn } from '../src/services/langGraphEngine.js';

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE AI ASSISTANT CONVERSATION TESTS ===\n");

  let memory = null;

  const testPrompts = [
    { label: "1. Greeting", text: "hyy" },
    { label: "2. Project Discovery (Initial prompt)", text: "I need an AI movie platform where users can insert themselves into movies using face swap, voice cloning, AI animation, comedy stage generation, and YouTube publishing." },
    { label: "3. Feature Confirmation", text: "Include all features" },
    { label: "4. Explicit Cost Request", text: "tell me approximate cost and time only" },
    { label: "5. Bench Matching Request", text: "who is available from bench developers" },
    { label: "6. Architecture Request", text: "show technical architecture" },
    { label: "7. SOW Proposal Request", text: "generate SOW proposal" }
  ];

  for (const step of testPrompts) {
    console.log(`\n---------------------------------------------------------`);
    console.log(`[TEST STEP]: ${step.label}`);
    console.log(`[USER INPUT]: "${step.text}"`);

    const result = await processLangGraphTurn({
      userInput: step.text,
      history: [],
      currentMemory: memory,
      apiKey: process.env.VITE_GEMINI_API_KEY || null
    });

    memory = result.memory;

    console.log(`[CLASSIFIED INTENT]: ${result.intent}`);
    console.log(`[ACTION TYPE]: ${result.actionType}`);
    console.log(`[RESPONSE PREVIEW]:\n${result.response.slice(0, 250)}...\n`);
  }

  console.log("=== ALL CONVERSATION TEST STEPS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
