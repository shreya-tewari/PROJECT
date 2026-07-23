/**
 * OpenAINode
 * Single Responsibility: Execute OpenAI API fallback inference call if Gemini fails.
 */

export async function runOpenAINode(state) {
  const memory = state.memory || {};
  const userInput = state.userInput || "";
  const openaiKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_OPENAI_API_KEY : '') || '';

  if (!openaiKey || openaiKey.length < 10) {
    return {
      ...state,
      _openaiFailed: true,
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are ProposalAI Assistant. User Project: ${memory.projectTitle || 'Software Application'}` },
          { role: 'user', content: userInput }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 5) {
        return {
          ...state,
          _llmSuccess: true,
          response: {
            text: text.trim(),
            actionType: "llm",
            devMatches: null,
            quickReplies: ["Calculate cost estimate", "Show architecture"],
          },
        };
      }
    }
  } catch (e) {
    console.warn("OpenAI API call failed:", e);
  }

  return {
    ...state,
    _openaiFailed: true,
  };
}
