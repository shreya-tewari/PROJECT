import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Key, X, Sparkles, Check, ExternalLink } from 'lucide-react';

export function LlmApiKeyModal({ isOpen, onClose }) {
  const { llmApiKey, setLlmApiKey, showNotification } = useApp();
  const [keyInput, setKeyInput] = useState(llmApiKey || '');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setLlmApiKey(keyInput.trim());
    if (keyInput.trim()) {
      showNotification('Live OpenAI / LLM API Key saved!', 'success');
    } else {
      showNotification('Using built-in LangGraph memory engine', 'info');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">LLM API Key Settings</h3>
            <p className="text-[11px] text-slate-500 font-medium">Optional: Add your OpenAI GPT-4o / Gemini API key for live LLM responses</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">OpenAI or Gemini API Key:</label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
              If left empty, the chatbot runs using our offline <strong>LangGraph Stateful Memory Engine</strong> with entity extraction and vector RAG matching.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Key</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
