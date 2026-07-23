/**
 * LLM-Driven Feature Synthesis Node
 * Dynamically synthesizes 5-6 features tailored specifically to the project description.
 */

import { FEATURE_TEMPLATES, synthesizeZeroShotFeatures } from '../data/featureTemplates';

export async function runFeatureSuggestionNode(state) {
  const text = state.userInput || "";
  const memory = { ...(state.memory || {}) };
  const lower = (text + " " + (memory.projectTitle || "")).toLowerCase();

  let features = [];

  if (state.apiKey && state.apiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey.trim()}`;
      const prompt = `Synthesize 6 specific, non-generic feature modules for the software project "${memory.projectTitle || text}".
Return strictly a valid JSON array of objects matching this schema:
[
  { "id": "feat-1", "name": "Feature Name", "description": "1 sentence description", "estimatedWeeks": 2 }
]`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          features = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.warn("LLM Feature Synthesis failed, using dynamic synthesizer:", e);
    }
  }

  if (!features || features.length === 0) {
    if (['lead', 'scrape', 'scraping', 'linkedin', 'prospect', 'google sheet', 'outreach'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.lead_generation;
    } else if (['movie', 'face', 'swap', 'deepfake', 'video', 'voice', 'character'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.movie_faceswap;
    } else if (['dental', 'clinic', 'doctor', 'hospital'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.dental_clinic;
    } else if (['pet', 'pets', 'animal', 'dog'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.pet_ecommerce;
    } else if (['e-commerce', 'ecommerce', 'store', 'shop'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.ecommerce;
    } else {
      features = synthesizeZeroShotFeatures(text);
    }
  }

  memory.suggestedFeatures = features;
  memory.workflowStep = "3_FEATURE_RECOMMENDATION";

  const totalWeeks = features.reduce((sum, f) => sum + (f.estimatedWeeks || f.durationWeeks || 2), 0);

  let responseText = `📋 **Structured Project Summary & Features for ${memory.projectTitle || 'Software App'}**\n\n`;
  responseText += `- **Industry**: ${memory.industry || 'Software & SaaS'}\n`;
  responseText += `- **Complexity Tier**: ${memory.complexityScore >= 8 ? 'Enterprise' : memory.complexityScore >= 5 ? 'Large' : 'Medium'} Tier\n`;
  responseText += `- **Recommended Stack**: ${memory.techStack?.join(', ') || 'React, Node.js, AWS'}\n\n`;
  responseText += `💡 **Recommended 6 Key Feature Modules:**\n\n`;

  features.forEach((feat, index) => {
    const w = feat.estimatedWeeks || feat.durationWeeks || 2;
    responseText += `**${index + 1}. ${feat.name}** (~${w} week${w > 1 ? 's' : ''})\n${feat.description || feat.name}\n\n`;
  });

  responseText += `⏱️ **Estimated Total Scope**: ~${totalWeeks} weeks of modular engineering work.\n\n`;
  responseText += `Do you approve this feature scope? You can:\n`;
  responseText += `- Reply **"Approved"** or **"Include All"** to proceed to the Technical Cloud Architecture\n`;
  responseText += `- Specify numbers to customize (e.g. *"Include 1, 2, 4, 5"* or *"Skip 3"*)\n`;

  return {
    ...state,
    memory,
    suggestedFeatures: features,
    response: {
      text: responseText,
      actionType: "chat",
      devMatches: null,
      quickReplies: ["Approve Feature Scope", "Customize Features", "Show Technical Architecture"],
    },
  };
}
