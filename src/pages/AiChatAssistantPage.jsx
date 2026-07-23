import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { processLangGraphTurn } from '../services/langGraphEngine';
import { FormattedMarkdown } from '../components/ui/FormattedMarkdown';
import { VoiceInputModal } from '../components/modals/VoiceInputModal';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Copy,
  Check,
  Video,
  ExternalLink,
  Trash2,
  FileText,
  ArrowRight,
  RotateCcw,
  ArrowUp,
  Plus,
  History,
  MessageSquare,
  Clock,
  ChevronDown
} from 'lucide-react';

export function AiChatAssistantPage() {
  const {
    setActiveTab,
    setSelectedDevForProfile,
    setSelectedDevForVideoCall,
    chatMessages,
    setChatMessages,
    chatSessions = [],
    currentSessionId,
    startNewChat,
    switchChatSession,
    deleteChatSession,
    clearChatHistory,
    setActiveProposal,
    graphMemory,
    setGraphMemory,
    llmApiKey,
    addGeneratedProposal,
    setProposalPrefill,
    currentClient,
    showNotification
  } = useApp();

  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleGenerateProposalFromChat = (queryText) => {
    const isGenericCommand = (str) => {
      if (!str) return true;
      const lower = str.toLowerCase().trim();
      return lower === "generate sow" || 
             lower === "generate proposal" || 
             lower === "make proposal" || 
             lower === "create proposal" || 
             lower === "sow" || 
             lower.includes("generate proposal for this") ||
             lower === "cost estimate" ||
             lower === "how much" ||
             lower === "all" ||
             lower === "yes" ||
             lower === "ok" ||
             lower === "sure" ||
             /^(remove|skip|[0-9, ]+)$/i.test(lower) ||
             lower.length < 8;
    };

    // Build the brief from memory context — NOT from the last chat message
    let bestBrief = "";

    // Priority 1: Use project title + selected features from memory
    if (graphMemory.projectTitle) {
      bestBrief = graphMemory.projectTitle;
      if (graphMemory.extractedRequirements && graphMemory.extractedRequirements.length > 0) {
        bestBrief += " with features: " + graphMemory.extractedRequirements.join(", ");
      }
      if (graphMemory.techStack && graphMemory.techStack.length > 0) {
        bestBrief += " using " + graphMemory.techStack.join(", ");
      }
    }

    // Priority 2: Find the first project description from chat history
    if (!bestBrief && Array.isArray(chatMessages)) {
      const projectDescriptions = chatMessages
        .filter(m => m.sender === 'user' && !isGenericCommand(m.text) && m.text.length > 15)
        .map(m => m.text);
      if (projectDescriptions.length > 0) {
        // Pick the FIRST substantive project description, not the last
        bestBrief = projectDescriptions[0];
      }
    }

    // Priority 3: Use passed queryText only if it's substantive
    if (!bestBrief && queryText && !isGenericCommand(queryText)) {
      bestBrief = queryText;
    }

    // Priority 4: Fallback
    if (!bestBrief) {
      bestBrief = "Custom Enterprise Software Application";
    }

    const inferredIndustry = (graphMemory.industry && graphMemory.industry !== "Software & SaaS" && graphMemory.industry !== "FinTech & Payments") 
      ? graphMemory.industry 
      : (bestBrief.toLowerCase().includes("movie") || bestBrief.toLowerCase().includes("face") || bestBrief.toLowerCase().includes("video") || bestBrief.toLowerCase().includes("comedy") || bestBrief.toLowerCase().includes("laugh"))
      ? "Media & Generative AI"
      : (bestBrief.toLowerCase().includes("wordpress") || bestBrief.toLowerCase().includes("elementor") || bestBrief.toLowerCase().includes("cms"))
      ? "CMS & Digital Web"
      : (bestBrief.toLowerCase().includes("dental") || bestBrief.toLowerCase().includes("clinic") || bestBrief.toLowerCase().includes("doctor") || bestBrief.toLowerCase().includes("health") || bestBrief.toLowerCase().includes("patient"))
      ? "Healthcare & Medical"
      : (bestBrief.toLowerCase().includes("e-commerce") || bestBrief.toLowerCase().includes("store") || bestBrief.toLowerCase().includes("shop"))
      ? "Retail & E-Commerce"
      : "Software & SaaS";

    const inferredClient = currentClient?.name || (graphMemory.userName 
      ? `${graphMemory.userName} (Enterprise)` 
      : "Enterprise Global Client");

    const isMediaAI = inferredIndustry === "Media & Generative AI";

    const prefill = {
      companyName: "ProposalAI Solutions",
      clientName: inferredClient,
      projectName: graphMemory.projectTitle || "",
      industry: inferredIndustry,
      promptText: bestBrief,
      selectedTech: graphMemory.techStack || [],
      devCount: graphMemory.devCount || (isMediaAI ? 6 : 4),
      durationWeeks: graphMemory.durationWeeks || (isMediaAI ? 22 : 12),
      autoRun: true
    };
    setProposalPrefill(prefill);
    setActiveTab('generator');
  };

  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseInputRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // Web Speech API Voice Recognition
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      showNotification?.("Voice listening stopped", "info");
      return;
    }

    if (!SpeechRecognition) {
      showNotification?.("Direct browser speech recognition is not supported in this environment. Type or paste your prompt below.", "warning");
      const textInput = prompt("Browser Mic API unavailable. Type or paste your spoken prompt below:", input || "");
      if (textInput && textInput.trim()) {
        setInput(textInput.trim());
      }
      return;
    }

    try {
      // Store current input text to append spoken words smoothly
      baseInputRef.current = input || '';

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showNotification?.("🎙️ Listening... Speak your project requirement now!", "info");
      };

      recognition.onresult = (event) => {
        let transcriptStr = '';
        for (let i = 0; i < event.results.length; i++) {
          transcriptStr += event.results[i][0].transcript;
        }

        if (transcriptStr.trim()) {
          const base = baseInputRef.current ? baseInputRef.current.trim() + ' ' : '';
          const fullText = base + transcriptStr.trim();
          setInput(fullText);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error event:", event.error);
        if (event.error === 'no-speech') {
          // Continuous listening keeps active during brief silence
          return;
        }
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showNotification?.("Microphone permission denied. Please allow mic access in your browser settings.", "error");
        } else if (event.error === 'audio-capture') {
          showNotification?.("No microphone detected. Please connect a mic hardware.", "error");
        } else if (event.error !== 'aborted') {
          showNotification?.(`Voice input notice: ${event.error}`, "warning");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Voice recognition start error:", err);
      setIsListening(false);
      showNotification?.("Could not initialize microphone. Please check mic permissions.", "error");
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const graphResult = await processLangGraphTurn({
        userInput: text,
        history: newHistory,
        currentMemory: graphMemory,
        apiKey: llmApiKey,
        provider: 'openai'
      });

      if (graphResult.memory) {
        setGraphMemory(graphResult.memory);
      }

      if (graphResult.proposalData && addGeneratedProposal) {
        addGeneratedProposal(graphResult.proposalData, true);
      }

      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: graphResult.response,
        devMatches: graphResult.devMatches,
        actionType: graphResult.actionType,
        proposalData: graphResult.proposalData,
        promptQuery: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("LangGraph turn processing error:", err);
      setIsTyping(false);
    }
  };

  const handleCopyText = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isEmpty = chatMessages.length === 0 || (chatMessages.length === 1 && chatMessages[0].sender === 'ai');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] bg-white">

      {/* Top Header Control Bar with + New Chat & History Drawer */}
      <div className="border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50/90 backdrop-blur-md flex items-center justify-between gap-2 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              ProposalAI Assistant
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 truncate max-w-[200px]">
                {chatSessions.find(s => s.id === currentSessionId)?.title || "Active Chat"}
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            title="Start a fresh conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* Chat History Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showHistoryDropdown
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>History ({chatSessions.length})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu for Chat History */}
            {showHistoryDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Previous Conversations
                  </span>
                  <button
                    onClick={() => {
                      startNewChat();
                      setShowHistoryDropdown(false);
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    + New
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {chatSessions.map((sess) => {
                    const isActive = sess.id === currentSessionId;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => {
                          switchChatSession(sess.id);
                          setShowHistoryDropdown(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-emerald-50 border border-emerald-200 font-bold text-emerald-950 shadow-xs'
                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-[12px]">{sess.title || "Conversation"}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{sess.createdAt}</span>
                            <span>•</span>
                            <span>{sess.messages?.length || 0} msgs</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          )}
                          {chatSessions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChatSession(sess.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear All Button */}
          <button
            onClick={clearChatHistory}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Clear all chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Empty State */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center pt-20 pb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">ProposalAI Assistant</h1>
              <p className="text-sm text-slate-500 text-center max-w-md mb-8">
                Your intelligent tech consultant. Describe your project requirements and I'll help you with cost estimates, team allocation, and SOW proposals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { label: "Build a dental clinic website", text: "I want to build a dental clinic website with appointment booking and patient management" },
                  { label: "Create an e-commerce store", text: "I need an e-commerce platform with product catalog, payments, and order tracking" },
                  { label: "Build a fintech payment app", text: "I want to build a fintech payment gateway with wallet and fraud detection" },
                  { label: "Create an AI-powered tool", text: "I need an AI-powered resume screening tool with document parsing and analytics" }
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion.text)}
                    className="text-left px-4 py-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-sm text-slate-700 transition-all duration-200 group"
                  >
                    <span className="group-hover:text-emerald-700 font-medium">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatMessages.map((msg, idx) => (
            <div key={msg.id || idx} className={`py-5 ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="flex gap-4 items-start">

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.sender === 'user'
                    ? 'bg-slate-700 text-white'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}>
                  {msg.sender === 'user'
                    ? <span className="text-xs font-bold">U</span>
                    : <Sparkles className="w-4 h-4" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-900">
                      {msg.sender === 'user' ? 'You' : 'ProposalAI'}
                    </span>
                    <span className="text-[11px] text-slate-400">{msg.time}</span>
                  </div>

                  {/* Message Text */}
                  <div className={`text-[13.5px] leading-relaxed ${msg.sender === 'user' ? 'text-slate-800' : 'text-slate-700'
                    }`}>
                    <FormattedMarkdown content={msg.text} />
                  </div>

                  {/* Dev Matches */}
                  {msg.devMatches && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available Developers</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.devMatches.map(dev => (
                          <div key={dev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <img src={dev.avatar} alt={dev.name} className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1">
                                  {dev.name}
                                  <span className="font-mono text-[9px] text-emerald-600">({dev.empCode})</span>
                                </div>
                                <div className="text-[11px] text-slate-500">{dev.role} • ${dev.hourlyRate}/hr</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedDevForVideoCall(dev)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                title="Talk to Developer"
                              >
                                <Video className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setSelectedDevForProfile(dev)}
                                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                                title="View Profile"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proposal Link */}
                  {msg.proposalData && (
                    <div className="mt-3">
                      <button
                        onClick={() => setActiveProposal(msg.proposalData)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Proposal SOW ({msg.proposalData.proposalId})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Redirect to generator button for proposal intent */}
                  {msg.sender === 'ai' && (msg.actionType === 'redirect_to_generator' || msg.actionType === 'proposal' || msg.actionType === 'cost') && !msg.proposalData && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleGenerateProposalFromChat(msg.promptQuery)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Generate SOW Proposal Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action bar for AI messages */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyText(idx, msg.text)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy response"
                      >
                        {copiedIndex === idx
                          ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                          : <Copy className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="py-5 border-t border-slate-100">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-900">ProposalAI</span>
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Listening Banner */}
      {isListening && (
        <div className="mx-auto max-w-3xl w-full px-4 pb-2">
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Listening... Speak now</span>
            </div>
            <button onClick={handleToggleVoice} className="text-xs text-rose-700 font-semibold hover:underline">Stop</button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative flex items-end bg-slate-50 border border-slate-300 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-sm">

            {/* Mic Button */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-2.5 ml-1 mb-1 rounded-xl transition-colors text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-xs"
              title="Open Voice Input Assistant"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your project requirements or click mic for Voice Assistant..."
              rows={1}
              className="flex-1 px-2 py-3 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none max-h-40"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className={`p-2.5 mr-1.5 mb-1.5 rounded-xl transition-all ${input.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between mt-2.5 px-1">
            <p className="text-[11px] text-slate-400">
              ProposalAI can help with cost estimates, developer matching & SOW generation
            </p>
            <button
              onClick={clearChatHistory}
              className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Input Assistant Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptComplete={(spokenText) => {
          setInput(spokenText);
          showNotification?.("🎙️ Spoken requirement inserted into chat!", "success");
        }}
        initialText={input}
      />
    </div>
  );
}
