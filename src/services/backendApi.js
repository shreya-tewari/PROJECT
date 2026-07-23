/**
 * Backend API Client Service
 * Communicates with the Python FastAPI Backend (http://localhost:8000)
 * powered by Google Gemini API & LangGraph Stateful Memory Engine.
 */

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) 
  ? import.meta.env.VITE_BACKEND_URL 
  : 'http://localhost:8000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, ...data };
    }
  } catch (e) {
    // Backend server not running locally yet
  }
  return { online: false };
}

export async function sendBackendChatTurn({ message, history = [], memory = null, apiKey = null }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, memory, apiKey }),
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Python Backend unreachable, using fallback frontend engine:', e.message);
  }
  return null;
}

export async function generateProposalFromBackend(payload) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/generate-proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Python Backend proposal generation unreachable:', e.message);
  }
  return null;
}
