/**
 * GeminiNode
 * Single Responsibility: Execute Google Gemini API inference calls safely.
 */

import { buildGeneralChatSystemPrompt } from '../prompts/promptTemplates.js';

export async function runGeminiNode(state) {
  const memory = state.memory || {};
  const userInput = state.userInput || "";
  const apiKey = state.apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';

  if (!apiKey || apiKey.length < 10) {
    return {
      ...state,
      _llmFailed: true,
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
    const promptText = buildGeneralChatSystemPrompt(memory, userInput);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 5) {
        return {
          ...state,
          _llmSuccess: true,
          response: {
            text: text.trim(),
            actionType: "llm",
            devMatches: null,
            quickReplies: ["Tell me more", "Show cost estimate", "Generate SOW proposal"],
          },
        };
      }
    }
  } catch (e) {
    console.warn("Gemini API call failed:", e);
  }

  return {
    ...state,
    _llmFailed: true,
  };
}
