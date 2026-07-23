import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockProposals } from '../data/mockProposals';
import { mockBenchDevelopers } from '../data/mockBenchDevelopers';
import { mockClients } from '../data/mockClients';
import { matchBenchDevelopers } from '../services/ragEngine';
import { createInitialGraphState } from '../services/langGraphEngine';
import {
  loginUser as authLogin,
  registerUser as authRegister,
  markUserVerified,
  emailExists,
  verifyOtp,
  generateOtp,
  storeOtp,
  sendOtpEmail,
  clearOtp
} from '../services/authService';

const AppContext = createContext();

// Ensures every proposal (historical or newly generated) has complete properties
export function normalizeProposal(prop) {
  if (!prop) return null;

  const stack = prop.techStack || ["React", "Node.js", "PostgreSQL", "AWS"];
  const devCount = prop.assignedDevsCount || prop.teamStructure?.length || 5;
  const duration = prop.durationWeeks || prop.timeline?.realisticWeeks || 12;
  const totalCost = prop.financials?.grandTotal || prop.estimatedCost || 125000;

  const team = prop.teamStructure || matchBenchDevelopers(stack, devCount);

  const estimateBreakup = prop.estimateBreakup || team.map((dev) => {
    const hrs = Math.round(duration * 40);
    return {
      item: `${dev.role} Engineering (${dev.name})`,
      empCode: dev.empCode || "EMP-101",
      hours: hrs,
      rate: dev.hourlyRate || 60,
      total: hrs * (dev.hourlyRate || 60)
    };
  });

  const devCostTotal = estimateBreakup.reduce((s, i) => s + (i.total || 0), 0);

  return {
    proposalId: prop.proposalId || prop.id || `PROP-${Math.floor(1000 + Math.random() * 9000)}`,
    companyName: prop.companyName || "ProposalAI Solutions",
    clientName: prop.clientName || "Enterprise Account",
    clientEmail: prop.clientEmail || `contact@${(prop.clientName || "client").toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    clientPhone: prop.clientPhone || "+1 (555) 234-8901",
    projectName: prop.projectName || "Enterprise Application Platform",
    industry: prop.industry || "Software & SaaS",
    createdAt: prop.createdAt || new Date().toISOString().split('T')[0],
    complexity: prop.complexity || "Enterprise / High",
    status: prop.status || "Won",
    winProbability: prop.winProbability || 95,
    executiveSummary: prop.executiveSummary || prop.summary || `We are pleased to submit this proposal for ${prop.projectName || "Enterprise Platform"} on behalf of ProposalAI Solutions. Designed specifically for ${prop.clientName || "Client"}, this initiative leverages modern cloud architecture, pre-vetted bench engineers, and scalable microservices.`,
    scopeOfWork: prop.scopeOfWork || [
      `End-to-end architecture & implementation of ${prop.projectName || "Enterprise System"}`,
      "Microservices backend & REST/GraphQL API gateway",
      "Cloud infrastructure setup with automated CI/CD deployment",
      "Security hardening, OAuth2 authentication & audit logging",
      "Post-launch technical maintenance and SLA support"
    ],
    deliverables: prop.deliverables || [
      `Production-ready ${prop.projectName || "Platform"} Codebase`,
      "OpenAPI / Swagger API Documentation",
      "Terraform / AWS Infrastructure as Code Scripts",
      "Automated Testing Suites & End-User Training Guides"
    ],
    techStack: stack,
    architecture: prop.architecture || {
      frontend: "React 18 + Next.js (TypeScript)",
      backend: "Node.js Express Enterprise Gateway",
      database: "PostgreSQL Primary + Redis Distributed Cache",
      cloudInfra: "AWS (ECS Fargate, S3 & RDS Multi-AZ)",
      aiVectorDB: "Pinecone Vector DB + OpenAI GPT-4o API",
      security: "OAuth2.0 / JWT Auth & SOC2 Type II Audit Logging"
    },
    teamStructure: team,
    timeline: prop.timeline || {
      optimisticWeeks: Math.max(4, duration - 2),
      realisticWeeks: duration,
      worstCaseWeeks: duration + 4,
      confidenceScore: 94,
      sprints: [
        { sprint: "Sprint 1-2", focus: "Architecture Discovery & Schema Setup", deliverables: "Technical Spec, Data Models, CI/CD" },
        { sprint: "Sprint 3-5", focus: "Core Backend APIs & Auth", deliverables: "REST APIs, Security Auth" },
        { sprint: "Sprint 6-8", focus: "Frontend UI & Integration", deliverables: "Web Dashboard & User Flow" },
        { sprint: "Sprint 9-10", focus: "AI Pipeline & Caching", deliverables: "Vector DB & Performance Tuning" },
        { sprint: "Sprint 11-12", focus: "UAT Testing & Production Deploy", deliverables: "Production Cutover & Signoff" }
      ]
    },
    estimateBreakup,
    financials: prop.financials || {
      devCost: Math.round(totalCost * 0.70),
      cloudInfraCost: 3500,
      thirdPartyApiCost: 2000,
      contingencyBuffer: Math.round(totalCost * 0.10),
      profitMargin: Math.round(totalCost * 0.18),
      grandTotal: totalCost,
      currency: "USD"
    },
    termsAndConditions: prop.termsAndConditions || "Standard 30% advance retainer upon contract signature, 40% upon Milestone 3 sprint completion, and 30% upon final production signoff. 60-day post-launch bug warranty included."
  };
}

const defaultWelcomeMessage = {
  id: 1,
  sender: 'ai',
  text: "How can I assist you with your software project today?\n- 💰 **Project Cost & Quotation Estimates**\n- 👨‍💻 **Bench Developer Availability & Skill Matching**\n- 🏗️ **Technical Cloud Architecture Recommendations**\n- 📄 **Automatic SOW Proposal Generation**",
  time: '12:00 PM',
  actionType: 'welcome'
};

export function AppProvider({ children }) {
  const [activeTab, setActiveTabRaw] = useState('landing');
  const prevTabRef = useRef('landing');
  const [darkMode, setDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  // OTP verification state
  const [pendingOtpData, setPendingOtpData] = useState(null); // { email, name, demoOtp? }

  const openAuthPage = (mode = 'login') => {
    setAuthMode(mode);
    setActiveTab('auth');
  };

  // Persistent Proposals State
  const [proposals, setProposals] = useState(() => {
    try {
      const saved = localStorage.getItem('proposalai_proposals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => normalizeProposal(p));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return mockProposals.map(p => normalizeProposal(p));
  });

  // Single Field Login & Role Authentication State
  const [userRole, setUserRole] = useState('client');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('proposalai_current_user');
      return saved ? JSON.parse(saved) : { name: 'Alex Rivera', email: 'alex@fintech.com', companyName: 'FinTech Global Labs', role: 'Enterprise Client' };
    } catch (e) {
      return { name: 'Alex Rivera', email: 'alex@fintech.com', companyName: 'FinTech Global Labs', role: 'Enterprise Client' };
    }
  });

  const [currentClient, setCurrentClient] = useState(() => {
    try {
      const saved = localStorage.getItem('proposalai_current_client');
      return saved ? JSON.parse(saved) : { id: 'CLI-101', name: 'FinTech Global Labs', email: 'alex@fintech.com', industry: 'FinTech & Payments' };
    } catch (e) {
      return { id: 'CLI-101', name: 'FinTech Global Labs', email: 'alex@fintech.com', industry: 'FinTech & Payments' };
    }
  });

  // User-isolated Multi-session Chat History System
  const getUserKey = (user) => {
    const email = user?.email || 'guest';
    return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  };

  const createNewSessionObj = (title = "New Chat") => {
    return {
      id: `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      messages: [defaultWelcomeMessage],
      graphMemory: createInitialGraphState().contextMemory
    };
  };

  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const uKey = getUserKey(currentUser);
      const saved = localStorage.getItem(`proposalai_chat_sessions_${uKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [createNewSessionObj()];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return chatSessions[0]?.id || `session-${Date.now()}`;
  });

  // Reload or initialize chatSessions when currentUser email changes
  useEffect(() => {
    const uKey = getUserKey(currentUser);
    try {
      const saved = localStorage.getItem(`proposalai_chat_sessions_${uKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Clean fresh session for new user login
    const fresh = createNewSessionObj();
    setChatSessions([fresh]);
    setCurrentSessionId(fresh.id);
  }, [currentUser?.email]);

  // Persist chatSessions to localStorage per user
  useEffect(() => {
    const uKey = getUserKey(currentUser);
    try {
      localStorage.setItem(`proposalai_chat_sessions_${uKey}`, JSON.stringify(chatSessions));
    } catch (e) {
      console.error(e);
    }
  }, [chatSessions, currentUser?.email]);

  const activeSession = chatSessions.find(s => s.id === currentSessionId) || chatSessions[0] || createNewSessionObj();
  const chatMessages = activeSession.messages || [defaultWelcomeMessage];
  const graphMemory = activeSession.graphMemory || createInitialGraphState().contextMemory;

  const handleSetChatMessages = (updater) => {
    setChatSessions(prevSessions => {
      const targetId = currentSessionId || prevSessions[0]?.id;
      return prevSessions.map(sess => {
        if (sess.id !== targetId) return sess;
        const currentMsgs = sess.messages || [];
        const newMsgs = typeof updater === 'function' ? updater(currentMsgs) : updater;

        let newTitle = sess.title;
        if (sess.title === "New Chat" || !sess.title) {
          const firstUserMsg = newMsgs.find(m => m.sender === 'user' && m.text && m.text.length > 2);
          if (firstUserMsg) {
            newTitle = firstUserMsg.text.length > 32 ? firstUserMsg.text.slice(0, 32) + '...' : firstUserMsg.text;
          }
        }

        return {
          ...sess,
          title: newTitle,
          messages: newMsgs
        };
      });
    });
  };

  const handleSetGraphMemory = (updater) => {
    setChatSessions(prevSessions => {
      const targetId = currentSessionId || prevSessions[0]?.id;
      return prevSessions.map(sess => {
        if (sess.id !== targetId) return sess;
        const currentMem = sess.graphMemory || createInitialGraphState().contextMemory;
        const newMem = typeof updater === 'function' ? updater(currentMem) : updater;
        return {
          ...sess,
          graphMemory: newMem
        };
      });
    });
  };

  const startNewChat = (silent = false) => {
    const fresh = createNewSessionObj();
    setChatSessions(prev => [fresh, ...prev]);
    setCurrentSessionId(fresh.id);
    if (!silent) showNotification("Started clean new chat conversation", "info");
  };

  const setActiveTab = (tab) => {
    prevTabRef.current = tab;
    setActiveTabRaw(tab);
  };

  const switchChatSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const deleteChatSession = (sessionId) => {
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createNewSessionObj();
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
    showNotification("Deleted conversation from history", "info");
  };

  // LLM API Key (OpenAI / Gemini optional key)
  const [llmApiKey, setLlmApiKey] = useState(() => {
    try {
      return localStorage.getItem('proposalai_llm_api_key') || '';
    } catch (e) {
      return '';
    }
  });

  const [benchDevs, setBenchDevs] = useState(mockBenchDevelopers);
  const [clients, setClients] = useState(mockClients);
  const [activeProposal, setActiveProposalState] = useState(() => proposals[0] || normalizeProposal(mockProposals[0]));
  const [promptInput, setPromptInput] = useState('');
  const [proposalPrefill, setProposalPrefill] = useState(null);
  const [notification, setNotification] = useState(null);

  // Financial Config
  const [financialConfig, setFinancialConfig] = useState({
    devCount: 6,
    avgHourlyRate: 60,
    durationWeeks: 12,
    cloudCost: 3500,
    apiCost: 2000,
    contingencyPct: 10,
    marginPct: 25,
    includeGst: false
  });

  // Single Field Login & Role Authentication State

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('proposalai_is_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const loginWithEmail = ({ name, email, password }) => {
    if (!email || !email.includes('@')) {
      showNotification('Please enter a valid email address', 'error');
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password) {
      showNotification('Please enter your password', 'error');
      return { success: false, error: 'Please enter your password' };
    }

    // Verify against auth DB
    const authResult = authLogin({ email, password });
    if (!authResult.success) {
      if (authResult.requiresVerification) {
        return { success: false, requiresVerification: true, error: authResult.error, userEmail: authResult.userEmail || email };
      }
      return { success: false, error: authResult.error };
    }

    const dbUser = authResult.user;
    const userDisplayName = dbUser.name || name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const matchingClient = clients.find(c => c.email.toLowerCase() === email.toLowerCase()) || {
      id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      name: dbUser.companyName || userDisplayName,
      email: email,
      industry: "Software & SaaS"
    };

    const userObj = {
      name: userDisplayName,
      email: dbUser.email,
      companyName: dbUser.companyName || userDisplayName,
      role: 'Enterprise Client'
    };

    setCurrentUser(userObj);
    setCurrentClient(matchingClient);
    setUserRole('client');
    setIsLoggedIn(true);

    try {
      localStorage.setItem('proposalai_current_user', JSON.stringify(userObj));
      localStorage.setItem('proposalai_current_client', JSON.stringify(matchingClient));
      localStorage.setItem('proposalai_user_role', 'client');
      localStorage.setItem('proposalai_is_logged_in', 'true');
    } catch (e) {}

    setActiveTab('aichat');
    showNotification(`Welcome back, ${userDisplayName}!`, 'success');
    return { success: true };
  };

  const registerWithEmail = async ({ name, companyName, email, password }) => {
    if (!name || name.trim().length < 2)
      return { success: false, error: 'Please enter your full name' };
    if (!email || !email.includes('@'))
      return { success: false, error: 'Please enter a valid email address' };
    if (!password || password.length < 6)
      return { success: false, error: 'Password must be at least 6 characters long' };

    // Check duplicate email in auth DB
    if (emailExists(email))
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };

    // Register user (unverified)
    const regResult = authRegister({ name, email, password, companyName });
    if (!regResult.success) return { success: false, error: regResult.error };

    // Generate & send OTP
    const otp = generateOtp();
    storeOtp(email, otp);
    const emailResult = await sendOtpEmail(email, name, otp);

    // Store pending OTP data so OTP screen can show it
    setPendingOtpData({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      demoOtp: emailResult.demoMode ? emailResult.demoOtp : null,
      demoMode: emailResult.demoMode
    });

    return { success: true, requiresOtp: true, demoMode: emailResult.demoMode, demoOtp: emailResult.demoOtp };
  };

  // Called after OTP is verified successfully
  const completeRegistration = ({ email }) => {
    const verifiedUser = markUserVerified(email);
    if (!verifiedUser) return { success: false, error: 'Verification failed. Please try again.' };

    const userObj = {
      name: verifiedUser.name,
      email: verifiedUser.email,
      companyName: verifiedUser.companyName,
      role: 'Enterprise Client'
    };
    const clientObj = {
      id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      name: verifiedUser.companyName,
      email: verifiedUser.email,
      industry: 'Software & SaaS'
    };

    setCurrentUser(userObj);
    setCurrentClient(clientObj);
    setUserRole('client');
    setIsLoggedIn(true);
    setPendingOtpData(null);
    clearOtp(email);

    try {
      localStorage.setItem('proposalai_current_user', JSON.stringify(userObj));
      localStorage.setItem('proposalai_current_client', JSON.stringify(clientObj));
      localStorage.setItem('proposalai_user_role', 'client');
      localStorage.setItem('proposalai_is_logged_in', 'true');
    } catch (e) {}

    setActiveTab('aichat');
    showNotification(`Welcome to ProposalAI, ${verifiedUser.name}! 🎉`, 'success');
    return { success: true };
  };

  const loginAsClient = (clientObj) => {
    const client = clientObj || clients[0] || { name: 'FinTech Global Labs', email: 'alex@fintech.com' };
    loginWithEmail({ email: client.email || 'alex@fintech.com', password: 'password123' });
  };

  const loginAsAdmin = (clientObj = null) => {
    loginAsClient(clientObj || currentClient);
  };

  const logoutPortal = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('proposalai_is_logged_in', 'false');
    } catch (e) {}
    setActiveTab('landing');
    showNotification('Logged out successfully', 'info');
  };

  const switchUserPortal = (newRole, clientObj = null) => {
    setUserRole('client');
    if (clientObj) {
      setCurrentClient(clientObj);
      try {
        localStorage.setItem('proposalai_current_client', JSON.stringify(clientObj));
      } catch (e) {}
    }
    setActiveTab('aichat');
    showNotification(`Switched account to ${clientObj?.name || currentClient?.name}`, 'success');
  };

  // Modal active targets
  const [selectedDevForProfile, setSelectedDevForProfile] = useState(null);
  const [selectedDevForVideoCall, setSelectedDevForVideoCall] = useState(null);

  // Persist Proposals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('proposalai_proposals', JSON.stringify(proposals));
    } catch (e) {
      console.error('Failed to save proposals:', e);
    }
  }, [proposals]);

  // Persist Chat Messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('proposalai_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {
      console.error('Failed to save chat messages:', e);
    }
  }, [chatMessages]);

  // Persist LangGraph Memory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('proposalai_graph_memory', JSON.stringify(graphMemory));
    } catch (e) {
      console.error('Failed to save graph memory:', e);
    }
  }, [graphMemory]);

  // Persist LLM API Key
  useEffect(() => {
    try {
      if (llmApiKey) {
        localStorage.setItem('proposalai_llm_api_key', llmApiKey);
      } else {
        localStorage.removeItem('proposalai_llm_api_key');
      }
    } catch (e) {
      console.error('Failed to save LLM API Key:', e);
    }
  }, [llmApiKey]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loginWithSingleField = (accessKey) => {
    const devMatch = benchDevs.find(d => d.empCode.toLowerCase() === accessKey.toLowerCase() || d.email.toLowerCase() === accessKey.toLowerCase());
    if (devMatch) {
      setCurrentUser({ name: devMatch.name, email: devMatch.email, empCode: devMatch.empCode, role: devMatch.role });
    } else {
      setCurrentUser({ name: accessKey.split('@')[0] || 'User', email: accessKey, empCode: 'EMP-999', role: 'Sales Specialist' });
    }
    setIsLoggedIn(true);
    showNotification(`Logged in successfully as ${accessKey}`, 'success');
  };

  const addGeneratedProposal = (newProp, skipChatMessage = false) => {
    const normalized = normalizeProposal(newProp);
    normalized.isClientCreated = true;
    normalized.createdByEmail = currentUser?.email || normalized.createdByEmail;
    
    if (!normalized.clientName || normalized.clientName.endsWith('Corp') || normalized.clientName === "FinTech Global Labs" || normalized.clientName === "Enterprise Account") {
      normalized.clientName = currentUser?.name || currentClient?.name || currentUser?.companyName || normalized.clientName;
    }

    if (currentUser?.email) {
      normalized.clientEmail = currentUser.email;
    }

    setProposals(prev => {
      const filtered = prev.filter(p => p.proposalId !== normalized.proposalId);
      return [normalized, ...filtered];
    });
    setActiveProposalState(normalized);

    if (!skipChatMessage) {
      // Record generation event in Chat History
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const chatMsg = {
        id: Date.now(),
        sender: 'ai',
        text: `🎉 **New Proposal Generated & Stored in History!**\n\n- **Project Name**: ${normalized.projectName}\n- **Proposal ID**: ${normalized.proposalId}\n- **Client**: ${normalized.clientName}\n- **Est. Budget**: $${(normalized.financials?.grandTotal || normalized.estimatedCost || 0).toLocaleString()}\n- **Timeline**: ${normalized.timeline?.realisticWeeks || 12} Weeks\n- **Assigned Team**: ${normalized.teamStructure?.length || 5} Developers\n\n*Saved in Proposal History & Dashboard Overview.*`,
        time: timeStr,
        actionType: 'proposal_created',
        proposalData: normalized
      };

      setChatMessages(prev => [...prev, chatMsg]);
    }
    showNotification(`Proposal "${normalized.projectName}" saved to history!`, 'success');
  };

  const clearChatHistory = () => {
    setChatMessages([defaultWelcomeMessage]);
    setGraphMemory(createInitialGraphState().contextMemory);
    try {
      localStorage.removeItem('proposalai_chat_messages');
      localStorage.removeItem('proposalai_graph_memory');
    } catch (e) {
      console.error(e);
    }
    showNotification("AI Chat history & LangGraph memory cleared", "info");
  };

  const handleSelectProposalForView = (prop) => {
    if (!prop) return;
    const normalized = normalizeProposal(prop);
    setActiveProposalState(normalized);
    setActiveTab('preview');
  };

  const updateDevStatus = (devId, newStatus) => {
    setBenchDevs(prev => prev.map(d => d.id === devId ? { ...d, status: newStatus } : d));
    showNotification(`Developer status updated to ${newStatus}`, 'info');
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      darkMode,
      setDarkMode,
      proposals,
      benchDevs,
      clients,
      activeProposal,
      setActiveProposal: handleSelectProposalForView,
      promptInput,
      setPromptInput,
      proposalPrefill,
      setProposalPrefill,
      addGeneratedProposal,
      chatMessages,
      setChatMessages: handleSetChatMessages,
      chatSessions,
      currentSessionId,
      startNewChat,
      switchChatSession,
      deleteChatSession,
      clearChatHistory,
      graphMemory,
      setGraphMemory: handleSetGraphMemory,
      llmApiKey,
      setLlmApiKey,
      updateDevStatus,
      notification,
      showNotification,
      financialConfig,
      setFinancialConfig,
      authMode,
      setAuthMode,
      openAuthPage,
      currentUser,
      isLoggedIn,
      loginWithSingleField,
      loginWithEmail,
      registerWithEmail,
      completeRegistration,
      pendingOtpData,
      setPendingOtpData,
      verifyOtp,
      generateOtp,
      storeOtp,
      sendOtpEmail,
      loginAsClient,
      loginAsAdmin,
      logoutPortal,
      userRole,
      setUserRole,
      currentClient,
      setCurrentClient,
      switchUserPortal,
      isLoginModalOpen,
      setIsLoginModalOpen,
      selectedDevForProfile,
      setSelectedDevForProfile,
      selectedDevForVideoCall,
      setSelectedDevForVideoCall
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
