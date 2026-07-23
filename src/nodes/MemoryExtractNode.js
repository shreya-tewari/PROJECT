/**
 * LLM-Driven Requirement Extraction Node
 * Extracts structured JSON project understanding: Title, Industry, Complexity, Features, and Tech Stack.
 */

export async function runMemoryExtractNode(state) {
  const text = state.userInput || "";
  const memory = { ...(state.memory || {}) };
  const lower = text.toLowerCase();

  // If text describes a new project requirement
  const isProjectRequirement = text.length > 15 && ['want', 'need', 'build', 'create', 'make', 'app', 'website', 'platform', 'system', 'tool', 'service', 'lead', 'scrape', 'movie', 'video'].some(k => lower.includes(k));

  if (isProjectRequirement) {
    // Structured JSON extraction payload
    let structuredJson = null;

    if (state.apiKey && state.apiKey.length > 10) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey.trim()}`;
        const prompt = `Extract software requirements from the text and return strictly a valid JSON object matching this schema:
{
  "projectTitle": "Descriptive Project Title",
  "industry": "Industry Category",
  "complexityScore": 1 to 10 integer,
  "coreFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "recommendedTechStack": ["Tech1", "Tech2"]
}

Text: "${text}"`;

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
        console.warn("LLM JSON extraction failed, using dynamic structured parser:", e);
      }
    }

    if (!structuredJson) {
      // Fallback Dynamic JSON Synthesizer
      const rawWords = text.split(/\s+/).filter(w => w.length > 3 && !['want', 'need', 'build', 'create', 'make', 'app', 'with', 'for', 'this', 'that', 'some'].includes(w.toLowerCase()));
      const titleWords = rawWords.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      let ind = 'Software & SaaS';
      let score = 5;
      let stack = ['React', 'Node.js', 'PostgreSQL', 'AWS'];

      if (['lead', 'scrape', 'scraping', 'linkedin', 'prospect', 'sheets'].some(k => lower.includes(k))) {
        ind = 'B2B Growth & Automation';
        score = 6;
        stack = ['Python', 'FastAPI', 'Playwright', 'OpenAI API', 'Google Sheets API'];
      } else if (['movie', 'face', 'swap', 'video', 'deepfake'].some(k => lower.includes(k))) {
        ind = 'Media & Generative AI';
        score = 9;
        stack = ['Python', 'FastAPI', 'PyTorch', 'FFmpeg', 'ElevenLabs API'];
      }

      structuredJson = {
        projectTitle: titleWords ? `${titleWords} Platform` : "Custom Software Platform",
        industry: ind,
        complexityScore: score,
        coreFeatures: ["User Authentication & Access Portal", "Core Data Processing Engine", "Interactive Analytics Dashboard"],
        recommendedTechStack: stack
      };
    }

    memory.projectTitle = structuredJson.projectTitle;
    memory.industry = structuredJson.industry;
    memory.complexityScore = structuredJson.complexityScore;
    memory.techStack = structuredJson.recommendedTechStack || ['React', 'Node.js', 'PostgreSQL', 'AWS'];
    memory.structuredJson = structuredJson;
    memory.extractedRequirements = structuredJson.coreFeatures;
    memory.workflowStep = "1_REQUIREMENT_EXTRACTION";
  }

  return {
    ...state,
    memory,
    project: {
      title: memory.projectTitle,
      category: memory.industry,
      industry: memory.industry,
    },
  };
}
