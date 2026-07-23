/**
 * LLM-Driven Feature Suggestion Node
 * Renders structured project summary, recommends 5-6 features, and prompts for user approval.
 * NEVER outputs pricing tables or developer costs at this stage.
 */

import { FEATURE_TEMPLATES, synthesizeZeroShotFeatures } from '../data/featureTemplates.js';

export async function runFeatureSuggestionNode(state) {
  const text = state.userInput || "";
  const memory = state.memory || {};
  const sj = memory.structuredJson || {};
  const lower = (text + " " + (memory.projectTitle || "")).toLowerCase();

  let features = [];

  if (state.apiKey && state.apiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey.trim()}`;
      const prompt = `Synthesize 6 core feature modules for project "${memory.projectTitle}".
Return strictly a valid JSON array of objects:
[
  { "id": "feat-1", "name": "Feature Name", "description": "Short description", "estimatedWeeks": 2 }
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
        if (jsonMatch) features = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("LLM Feature Synthesis failed:", e);
    }
  }

  if (!features || features.length === 0) {
    if (['movie', 'face', 'swap', 'video', 'voice', 'comedy'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.movie_faceswap;
    } else if (['lead', 'scrape', 'linkedin', 'sheets'].some(k => lower.includes(k))) {
      features = FEATURE_TEMPLATES.lead_generation;
    } else {
      features = synthesizeZeroShotFeatures(text);
    }
  }

  const updatedMemory = {
    ...memory,
    suggestedFeatures: features,
    workflowStep: "4_WAITING_FOR_FEATURE_APPROVAL",
  };

  const totalWeeks = features.reduce((sum, f) => sum + (f.estimatedWeeks || f.durationWeeks || 2), 0);

  let responseText = `👋 Hello! I've analyzed your requirements for **${memory.projectTitle || 'Software Application'}**.\n\n`;

  responseText += `📌 **Business Requirements Summary:**\n`;
  responseText += `- **Project Type**: ${sj.projectType || memory.projectTitle}\n`;
  responseText += `- **Industry Sector**: ${sj.industry || memory.industry}\n`;
  if (sj.targetUsers?.length > 0) responseText += `- **Target Users**: ${sj.targetUsers.join(', ')}\n`;
  if (sj.aiRequirements?.length > 0) responseText += `- **AI/ML Requirements**: ${sj.aiRequirements.join(', ')}\n`;
  if (sj.integrations?.length > 0) responseText += `- **Key Integrations**: ${sj.integrations.join(', ')}\n`;
  responseText += `\n💡 **Recommended Core Feature Scope:**\n\n`;

  features.forEach((feat, index) => {
    const w = feat.estimatedWeeks || feat.durationWeeks || 2;
    responseText += `**${index + 1}. ${feat.name}** (~${w} week${w > 1 ? 's' : ''})\n${feat.description || feat.name}\n\n`;
  });

  responseText += `⏱️ **Estimated Engineering Effort**: ~${totalWeeks} weeks of modular development.\n\n`;
  responseText += `Would you like to approve this scope, or modify any specific features before we review the **Technical Architecture**?`;

  return {
    ...state,
    memory: updatedMemory,
    suggestedFeatures: features,
    response: {
      text: responseText,
      actionType: "chat",
      devMatches: null,
      quickReplies: ["Approve Feature Scope", "Customize Features", "Show Technical Architecture"],
    },
  };
}
