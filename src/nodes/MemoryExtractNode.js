/**
 * LLM-Driven Requirement Extraction Node
 * Extracts structured JSON project understanding: projectType, industry, targetUsers, coreModules, optionalModules, techRequirements, aiRequirements, integrations, constraints.
 */

export async function runMemoryExtractNode(state) {
  const text = state.userInput || "";
  const memory = { ...(state.memory || {}) };
  const lower = text.toLowerCase();

  const isProjectRequirement = text.length > 15 && ['want', 'need', 'build', 'create', 'make', 'app', 'website', 'platform', 'system', 'tool', 'service', 'lead', 'scrape', 'movie', 'video'].some(k => lower.includes(k));

  if (!isProjectRequirement && memory.structuredJson) {
    return state;
  }

  let structuredJson = null;

  if (state.apiKey && state.apiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey.trim()}`;
      const prompt = `Extract software presales requirements from the input and return strictly a valid JSON object matching this schema:
{
  "projectType": "Short Title",
  "industry": "Industry Sector",
  "targetUsers": ["User Type 1", "User Type 2"],
  "coreModules": ["Module 1", "Module 2"],
  "optionalModules": ["Optional 1"],
  "techRequirements": ["Frontend/Backend/Cloud"],
  "aiRequirements": ["AI/ML Models if applicable"],
  "integrations": ["APIs/Services"],
  "constraints": ["Budget/Timeline constraints if any"]
}

Input: "${text}"`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredJson = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.warn("LLM Requirement Extraction failed, using dynamic structured synthesizer:", e);
    }
  }

  if (!structuredJson) {
    let type = "Enterprise Software Platform";
    let ind = "Software & SaaS";
    let aiReqs = [];
    let core = ["User Management & Auth Portal", "Core Analytics & Data Engine", "Admin Control Console"];

    if (['movie', 'face', 'swap', 'video', 'voice', 'comedy', 'animation'].some(k => lower.includes(k))) {
      type = "AI Movie & Face-Swap Video Platform";
      ind = "Media & Generative AI";
      aiReqs = ["Neural Face-Swap Pipeline (PyTorch)", "Voice Cloning & Audio Lip-Sync (ElevenLabs)", "AI Comedy Stage & Script Generator"];
      core = ["HD Video Streaming & Upload Pipeline", "Neural Face-Swap Fusion Engine", "Voice Clone Audio Renderer", "Green Screen Comedy Stage", "Subscription Paywall"];
    } else if (['lead', 'scrape', 'linkedin', 'sheets'].some(k => lower.includes(k))) {
      type = "AI Lead Generation & Scraping Automation App";
      ind = "B2B Growth & Automation";
      aiReqs = ["LLM Lead Scoring & Sentiment Classifier"];
      core = ["LinkedIn Data Scraper", "AI Lead Scoring Engine", "Google Sheets Sync", "Cold Email Pipeline"];
    }

    structuredJson = {
      projectType: type,
      industry: ind,
      targetUsers: ["End Users", "Content Creators", "Administrators"],
      coreModules: core,
      optionalModules: ["Multi-Language Subtitles", "Mobile App Wrapper"],
      techRequirements: ["React 18", "Python FastAPI", "PostgreSQL", "AWS S3 & CloudFront"],
      aiRequirements: aiReqs,
      integrations: ["Stripe Checkout Gateway", "Google Sheets API", "ElevenLabs API"],
      constraints: memory.isLowBudget ? ["Cost-Optimized Execution Required"] : ["High-Performance & Scalable Topology Required"]
    };
  }

  const updatedMemory = {
    ...memory,
    projectTitle: structuredJson.projectType || "Software Platform",
    industry: structuredJson.industry || "Software & SaaS",
    structuredJson,
    techStack: structuredJson.techRequirements || ["React", "Node.js", "PostgreSQL", "AWS"],
    extractedRequirements: structuredJson.coreModules || [],
    workflowStep: memory.workflowStep === "9_PROPOSAL_GENERATED" ? "9_PROPOSAL_GENERATED" : "1_REQUIREMENT_EXTRACTION",
  };

  return {
    ...state,
    memory: updatedMemory,
    project: {
      title: updatedMemory.projectTitle,
      category: updatedMemory.industry,
      industry: updatedMemory.industry,
    },
  };
}
