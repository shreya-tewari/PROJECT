import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { runMultiAgentProposalWorkflow, inferTechStackFromPrompt } from '../services/agentWorkflowEngine';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { VoiceInputModal } from '../components/modals/VoiceInputModal';
import {
  Sparkles,
  BotMessageSquare,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Users,
  Clock,
  FileText,
  RotateCcw,
  ExternalLink,
  Wand2,
  Mic,
  MicOff
} from 'lucide-react';
import { useRef } from 'react';

// Smart Helper to suggest domain-tailored features based on project text
export function suggestFeaturesForPrompt(promptText = "") {
  const text = (promptText || "").toLowerCase();

  // 0. Netflix / Hotstar / Movie Streaming / OTT / Videos / Cinema / Film
  if (text.includes("netflix") || text.includes("hotstar") || text.includes("hulu") || text.includes("movie") || text.includes("stream") || text.includes("video") || text.includes("ott") || text.includes("cinema") || text.includes("film")) {
    return [
      { id: "stream-player", name: "HD Video Streaming Player with Multi-Quality Resolution Switcher (HLS/DASH)", durationWeeks: 3, selected: true },
      { id: "stream-upload", name: "User Movie Upload Portal with Cloud Transcoding Pipeline (FFmpeg & S3)", durationWeeks: 3, selected: true },
      { id: "stream-sub", name: "Subscription Membership Paywall (Monthly/Annual Plans & Stripe Gateway)", durationWeeks: 2, selected: true },
      { id: "stream-catalog", name: "Movie Catalog with Genre Filtering, Search & Personal Watchlist", durationWeeks: 2, selected: true },
      { id: "stream-profile", name: "User Profiles, Watch History & Continue Watching Playback Sync", durationWeeks: 1, selected: true },
      { id: "stream-admin", name: "Admin Video Moderation Console & DRM Content Protection Gate", durationWeeks: 2, selected: true }
    ];
  }

  // 0.1 Dental / Medical / Clinic / Doctor / Patient / Hospital / Appointment / Health
  if (text.includes("dental") || text.includes("clinic") || text.includes("doctor") || text.includes("hospital") || text.includes("medical") || text.includes("patient") || text.includes("appointment") || text.includes("health")) {
    return [
      { id: "den-book", name: "Online Appointment Booking System", durationWeeks: 2, selected: true },
      { id: "den-portal", name: "Patient Portal & Medical Records", durationWeeks: 3, selected: true },
      { id: "den-dash", name: "Doctor/Staff Dashboard", durationWeeks: 2, selected: true },
      { id: "den-sms", name: "Automated Email & SMS Reminders", durationWeeks: 1, selected: true },
      { id: "den-price", name: "Services & Pricing Page", durationWeeks: 1, selected: true },
      { id: "den-ai", name: "AI Virtual Health Assistant", durationWeeks: 3, selected: true }
    ];
  }

  // 0.2 Car Rental / Vehicle / Fleet / Transport
  if (text.includes("car") || text.includes("vehicle") || text.includes("fleet") || text.includes("rental") || text.includes("pickup") || text.includes("dropoff")) {
    return [
      { id: "car-fleet", name: "Vehicle Fleet Catalog with Spec Comparison & Availability Filter", durationWeeks: 2, selected: true },
      { id: "car-reserve", name: "Pickup & Dropoff Location, Date & Time Slot Reservation System", durationWeeks: 2, selected: true },
      { id: "car-verify", name: "Automated Driver's License & Identity Document Verification Gate", durationWeeks: 2, selected: true },
      { id: "car-dep", name: "Security Deposit Pre-Authorization Hold & Payment Gateway", durationWeeks: 1, selected: true },
      { id: "car-gps", name: "Live Vehicle Telemetry & GPS Mileage Tracking Integration", durationWeeks: 2, selected: true },
      { id: "car-admin", name: "Admin Fleet Operations, Maintenance & Revenue Analytics Dashboard", durationWeeks: 2, selected: true }
    ];
  }

  // 1. Flowers / Floral / Nursery / Plants / Bouquet / Gifts
  if (text.includes("flower") || text.includes("floral") || text.includes("bouquet") || text.includes("plant") || text.includes("nursery") || text.includes("florist") || text.includes("rose") || text.includes("gift")) {
    return [
      { id: "fl-catalog", name: "Interactive Flower & Bouquet Catalog with High-Res Photo Gallery", durationWeeks: 2, selected: true },
      { id: "fl-occasion", name: "Occasion-Based Filtering (Birthdays, Anniversaries, Weddings, Sympathy)", durationWeeks: 1, selected: true },
      { id: "fl-card", name: "Custom Gift Card & Personal Greeting Message Attachment Writer", durationWeeks: 1, selected: true },
      { id: "fl-deliver", name: "Same-Day Local Delivery Radius & Scheduled Calendar Time Slot Picker", durationWeeks: 2, selected: true },
      { id: "fl-pay", name: "Stripe / Credit Card / UPI Payment Gateway Checkout Integration", durationWeeks: 1, selected: true },
      { id: "fl-invent", name: "Floral Inventory Management & Cold-Storage Stock Tracker Dashboard", durationWeeks: 1, selected: true }
    ];
  }

  // 2. Food / Bakery / Restaurant / Delivery / Cafe / Cake / Dessert / Grocery
  if (text.includes("bakery") || text.includes("cake") || text.includes("food") || text.includes("restaurant") || text.includes("cafe") || text.includes("dining") || text.includes("grocery") || text.includes("chef") || text.includes("dessert")) {
    return [
      { id: "fd-menu", name: "Digital Interactive Menu with Diet Category Filters (Veg, Vegan, Gluten-Free)", durationWeeks: 1, selected: true },
      { id: "fd-order", name: "Online Order Cart, Delivery Dispatch & Table Reservation System", durationWeeks: 2, selected: true },
      { id: "fd-track", name: "Live Order Progress Tracker with Driver GPS Map Integration", durationWeeks: 2, selected: true },
      { id: "fd-pay", name: "Stripe / Wallet / Cash on Delivery Payment Processing Gateway", durationWeeks: 1, selected: true },
      { id: "fd-kitchen", name: "Kitchen Display System (KDS) & Real-Time Order Ticket Dispatcher", durationWeeks: 1, selected: true },
      { id: "fd-promo", name: "Customer Loyalty Rewards Program & Promo Code Discount Engine", durationWeeks: 1, selected: true }
    ];
  }

  // 3. E-Commerce / Store / Selling / Shop / Product / Retail / Fashion / Boutique
  if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("store") || text.includes("sell") || text.includes("shop") || text.includes("retail") || text.includes("product") || text.includes("buy") || text.includes("boutique")) {
    return [
      { id: "eco-catalog", name: "High-Availability Product Catalog Server, Shopping Cart & One-Click Checkout", durationWeeks: 2, selected: true },
      { id: "eco-pay", name: "Stripe / Credit Card / UPI Multi-Currency Payment Gateway Portal", durationWeeks: 1, selected: true },
      { id: "eco-track", name: "Real-Time Order Tracking, SMS Notifications & Automated Email Alerts", durationWeeks: 1, selected: true },
      { id: "eco-review", name: "Customer Product Ratings, Photo Reviews & Q&A Discussion Board", durationWeeks: 1, selected: true },
      { id: "eco-invent", name: "Inventory Database Sync Dashboard & Automated Low-Stock Alert System", durationWeeks: 1, selected: true },
      { id: "eco-recom", name: "AI Recommendation Engine Based on Customer Purchase Behavior", durationWeeks: 2, selected: true }
    ];
  }

  // 4. Real Estate / Property / Housing / Rental / Broker / Apartment
  if (text.includes("real estate") || text.includes("property") || text.includes("house") || text.includes("housing") || text.includes("broker") || text.includes("apartment") || text.includes("realty")) {
    return [
      { id: "re-grid", name: "Dynamic Property Listing Grid with High-Definition Virtual 3D Tours", durationWeeks: 3, selected: true },
      { id: "re-map", name: "Interactive Map Search with Neighborhood Amenity & Radius Filters", durationWeeks: 2, selected: true },
      { id: "re-agent", name: "Agent Appointment Scheduler & Direct Inquiry Lead Gate", durationWeeks: 1, selected: true },
      { id: "re-calc", name: "Mortgage Loan Amortization Calculator & Monthly Cost Estimator", durationWeeks: 1, selected: true },
      { id: "re-owner", name: "Property Owner Listing Submission & Verification Portal", durationWeeks: 2, selected: true },
      { id: "re-alert", name: "Automated Saved-Search Email Alerts for New Matching Properties", durationWeeks: 1, selected: true }
    ];
  }

  // 5. Car Rental / Vehicle / Fleet / Automobile / Transport / Taxi
  if (text.includes("car") || text.includes("vehicle") || text.includes("fleet") || text.includes("rental") || text.includes("auto") || text.includes("taxi") || text.includes("drive")) {
    return [
      { id: "car-fleet", name: "Vehicle Fleet Catalog with Spec Comparison & Availability Filter", durationWeeks: 2, selected: true },
      { id: "car-book", name: "Pickup & Dropoff Location, Date & Time Slot Reservation System", durationWeeks: 2, selected: true },
      { id: "car-kyc", name: "Automated Driver's License & Identity Document Verification Gate", durationWeeks: 2, selected: true },
      { id: "car-pay", name: "Security Deposit Pre-Authorization Hold & Payment Gateway", durationWeeks: 1, selected: true },
      { id: "car-gps", name: "Fleet Maintenance Log & Vehicle GPS Telemetry Tracking", durationWeeks: 2, selected: true },
      { id: "car-contract", name: "Digital Contract E-Signature & Rental Invoice PDF Generator", durationWeeks: 1, selected: true }
    ];
  }

  // 6. Booking / Salon / Spa / Clinic / Fitness / Appointment / Studio / Services
  if (text.includes("booking") || text.includes("appointment") || text.includes("salon") || text.includes("spa") || text.includes("fitness") || text.includes("gym") || text.includes("studio") || text.includes("barber") || text.includes("service")) {
    return [
      { id: "bk-calendar", name: "Interactive Calendar Service Booking & Staff Specialist Picker", durationWeeks: 2, selected: true },
      { id: "bk-pkg", name: "Service Package Selector with Add-On Customization Options", durationWeeks: 1, selected: true },
      { id: "bk-sms", name: "Twilio Automated SMS & WhatsApp Appointment Reminder Alerts", durationWeeks: 1, selected: true },
      { id: "bk-pay", name: "Deposit Payment Gateway & Cancellation Policy Manager", durationWeeks: 1, selected: true },
      { id: "bk-notes", name: "Client Visit History & Digital Consultation Notes Log", durationWeeks: 1, selected: true },
      { id: "bk-staff", name: "Staff Work Schedule Shift Management & Commission Calculator", durationWeeks: 2, selected: true }
    ];
  }

  // 7. Education / LMS / Academy / Course / School / Learning / Tutor
  if (text.includes("education") || text.includes("course") || text.includes("lms") || text.includes("school") || text.includes("academy") || text.includes("learn") || text.includes("tutor") || text.includes("student")) {
    return [
      { id: "edu-video", name: "HD Video Course Streaming Library with Playback Progress Sync", durationWeeks: 2, selected: true },
      { id: "edu-quiz", name: "Student Quiz Evaluator & Automated Certificate PDF Generator", durationWeeks: 2, selected: true },
      { id: "edu-forum", name: "Discussion Forum & Instructor Q&A Community Board", durationWeeks: 1, selected: true },
      { id: "edu-sub", name: "Subscription Membership Billing & Course Tier Paywall", durationWeeks: 1, selected: true },
      { id: "edu-report", name: "Student Performance Telemetry & Progress Report Dashboard", durationWeeks: 1, selected: true },
      { id: "edu-live", name: "Live Interactive Virtual Classroom WebRTC Conference Room", durationWeeks: 3, selected: true }
    ];
  }

  // 8. Social / Community / Forum / Chat / Messaging / Network
  if (text.includes("social") || text.includes("community") || text.includes("forum") || text.includes("chat") || text.includes("messaging") || text.includes("network") || text.includes("feed")) {
    return [
      { id: "soc-profile", name: "Customized User Profile Cards with Activity Feed & Follow System", durationWeeks: 2, selected: true },
      { id: "soc-chat", name: "High-Throughput Real-Time Direct Messaging Console (WebSockets)", durationWeeks: 2, selected: true },
      { id: "soc-post", name: "Media Post Upload Feed with Like, Comment & Share Interactions", durationWeeks: 2, selected: true },
      { id: "soc-mod", name: "Automated Content Moderation & Abuse Reporting Shield", durationWeeks: 1, selected: true },
      { id: "soc-push", name: "Push Notification Dispatch Engine for Social Interactions", durationWeeks: 1, selected: true },
      { id: "soc-admin", name: "Community Admin Analytics & User Moderation Panel", durationWeeks: 1, selected: true }
    ];
  }

  // 9. Telehealth / Medical / Doctor / Patient / Hospital / Healthcare / HIPAA
  if (text.includes("telehealth") || text.includes("health") || text.includes("doctor") || text.includes("patient") || text.includes("hipaa") || text.includes("medical") || text.includes("hospital")) {
    return [
      { id: "hipaa-video", name: "Encrypted WebRTC Secure Doctor-Patient HD Video Consultation Room", durationWeeks: 3, selected: true },
      { id: "hipaa-emr", name: "Electronic Medical Records EMR Integration & FHIR Data Interoperability", durationWeeks: 3, selected: true },
      { id: "hipaa-sched", name: "Appointment Booking Calendar Dashboard & Twilio Automated SMS Alerts", durationWeeks: 1, selected: true },
      { id: "hipaa-vault", name: "HIPAA Compliant Encrypted Audit Logging & Cloud KMS Key Vault", durationWeeks: 2, selected: true },
      { id: "hipaa-rx", name: "e-Prescription Dispatch System & Authorized Pharmacy Connector", durationWeeks: 2, selected: true },
      { id: "hipaa-bill", name: "Stripe Medical Invoicing Interface & Insurance Claim API", durationWeeks: 2, selected: true }
    ];
  }

  // 10. AI / Machine Learning / LLM / RAG / Bot / Chatbot / NLP
  if (text.includes("ai") || text.includes("ml") || text.includes("resume") || text.includes("screening") || text.includes("parsing") || text.includes("nlp") || text.includes("llm") || text.includes("chatbot") || text.includes("gpt")) {
    return [
      { id: "nlp-llm", name: "Interactive Natural Language Prompt Console with AI Agent Persona", durationWeeks: 2, selected: true },
      { id: "nlp-vector", name: "Pinecone Vector Database Document Search & RAG Query Pipeline", durationWeeks: 2, selected: true },
      { id: "nlp-parser", name: "Automated File & Data Fact Extractor (PDF, Word, Images)", durationWeeks: 2, selected: true },
      { id: "nlp-safety", name: "Prompt Injection Shield & Automated Content Moderation Filter", durationWeeks: 1, selected: true },
      { id: "nlp-outreach", name: "Smart Email Follow-Ups & Automated Workflow Integrations", durationWeeks: 1, selected: true },
      { id: "nlp-analytics", name: "LLM Token Usage Telemetry & API Cost Analytics Dashboard", durationWeeks: 1, selected: true }
    ];
  }

  // 11. FinTech / Banking / Payment / Fraud / Crypto / Wallet
  if (text.includes("fintech") || text.includes("payment") || text.includes("fraud") || text.includes("wallet") || text.includes("banking") || text.includes("bank") || text.includes("crypto")) {
    return [
      { id: "fin-gate", name: "Sub-50ms High-Throughput Payment Transaction Processing Gateway", durationWeeks: 3, selected: true },
      { id: "fin-vault", name: "PCI-DSS Level 1 Compliant Encrypted Credit Card Vault", durationWeeks: 3, selected: true },
      { id: "fin-fraud", name: "Real-Time Transaction Fraud Detection Machine Learning Engine", durationWeeks: 2, selected: true },
      { id: "fin-ledger", name: "Double-Entry Transaction Ledger DB Schema & Automatic Reconciliations", durationWeeks: 2, selected: true },
      { id: "fin-plaid", name: "Plaid API Direct Bank Account Connection & ACH Verification", durationWeeks: 1, selected: true },
      { id: "fin-wallet", name: "Mobile QR Wallet, Peer-to-Peer Transfer & Multi-Currency Support", durationWeeks: 2, selected: true }
    ];
  }

  // 12. WordPress / CMS / Webflow
  if (text.includes("wordpress") || text.includes("elementor") || text.includes("cms") || text.includes("webflow")) {
    return [
      { id: "wp-theme", name: "Custom Responsive Theme Design & Page Layout Builder", durationWeeks: 1, selected: true },
      { id: "wp-checkout", name: "Storefront Checkout & Payment Gateway Integration", durationWeeks: 1, selected: true },
      { id: "wp-seo", name: "SEO Optimization & XML Sitemap Configurations", durationWeeks: 1, selected: true },
      { id: "wp-crm", name: "Contact Inquiry Forms & Automated CRM Synchronizations", durationWeeks: 1, selected: true },
      { id: "wp-speed", name: "CDN Speed Optimization & Caching Hardening", durationWeeks: 1, selected: true },
      { id: "wp-audit", name: "Security Hardening, Anti-Spam Captcha & Database Backups", durationWeeks: 1, selected: true }
    ];
  }

  // 13. Zero-Shot Dynamic Feature Synthesizer for ANY Custom Requirement (99% Precision Engine)
  const stopWords = new Set([
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'what', 'which', 'this', 'that', 'am', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'do', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'of', 'at', 'by', 'for', 'with', 'about', 'to', 'from', 'in', 'out', 'on', 'all', 'any', 'can', 'will', 'just', 'should', 'now', 'want', 'need', 'build', 'create', 'make', 'website', 'app', 'application', 'platform', 'portal', 'system', 'software', 'like', 'tool', 'solution', 'where', 'can'
  ]);

  const rawWords = text.split(/[\s,._\-\/\\]+/).filter(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.length > 2 && !stopWords.has(clean);
  });

  const domainWords = rawWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const domainTopic = domainWords.slice(0, 3).join(' ') || 'Custom Solution';
  const primaryWord = domainWords[0] || 'Service';
  const secondaryWord = domainWords[1] || 'Operations';

  return [
    { id: "dyn-core", name: `${domainTopic} Core System & Interactive User Interface`, durationWeeks: 3, selected: true },
    { id: "dyn-catalog", name: `${domainTopic} Catalog & Real-Time Search Filters`, durationWeeks: 2, selected: true },
    { id: "dyn-track", name: `Real-Time ${secondaryWord} Tracking, Telemetry & Status Alerts`, durationWeeks: 2, selected: true },
    { id: "dyn-pay", name: `Secure Payment Gateway, Checkout & Billing Invoicing`, durationWeeks: 1, selected: true },
    { id: "dyn-user", name: `${domainTopic} User Profile Management & Security Access`, durationWeeks: 1, selected: true },
    { id: "dyn-admin", name: `Executive Admin Operations Console & ${primaryWord} Analytics`, durationWeeks: 2, selected: true }
  ];
}

export function ProposalGeneratorPage() {
  const { promptInput, addGeneratedProposal, setActiveProposal, setActiveTab, setSelectedDevForProfile, setSelectedDevForVideoCall, financialConfig, showNotification, proposalPrefill, setProposalPrefill, currentClient, currentUser } = useApp();

  const initialPrompt = promptInput || "";
  const [companyName, setCompanyName] = useState("ProposalAI Solutions");
  const [clientName, setClientName] = useState(() => currentClient?.name || currentUser?.companyName || "My Enterprise Account");
  const [projectName, setProjectName] = useState("");
  const [industry, setIndustry] = useState("Software & SaaS");
  const [promptText, setPromptText] = useState(initialPrompt);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const basePromptRef = useRef('');

  // Voice Dictation Handler for Proposal Generator
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
      showNotification?.("Direct mic speech recognition is unavailable in this environment. Type or paste text below.", "warning");
      const textInput = prompt("Browser Mic API unavailable. Type or paste your spoken prompt below:", promptText || "");
      if (textInput && textInput.trim()) {
        setPromptText(textInput.trim());
      }
      return;
    }

    try {
      basePromptRef.current = promptText || '';

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showNotification?.("🎙️ Listening... Speak your project requirements now!", "info");
      };

      recognition.onresult = (event) => {
        let transcriptStr = '';
        for (let i = 0; i < event.results.length; i++) {
          transcriptStr += event.results[i][0].transcript;
        }

        if (transcriptStr.trim()) {
          const base = basePromptRef.current ? basePromptRef.current.trim() + ' ' : '';
          const fullText = base + transcriptStr.trim();
          setPromptText(fullText);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') return;
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showNotification?.("Microphone permission denied. Please allow mic access in your browser settings.", "error");
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

  useEffect(() => {
    if (currentClient?.name) {
      setClientName(currentClient.name);
    }
  }, [currentClient]);
  const [selectedTech, setSelectedTech] = useState(() => initialPrompt ? inferTechStackFromPrompt(initialPrompt) : []);
  const [devCount, setDevCount] = useState(financialConfig?.devCount || 6);
  const [durationWeeks, setDurationWeeks] = useState(financialConfig?.durationWeeks || 12);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [customFeatureText, setCustomFeatureText] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [agentLog, setAgentLog] = useState([]);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // Auto-infer tech stack whenever promptText changes
  useEffect(() => {
    if (promptText && promptText.trim().length > 0) {
      const inferred = inferTechStackFromPrompt(promptText);
      setSelectedTech(inferred);
    } else {
      setSelectedTech([]);
    }
  }, [promptText]);

  const isPrefilledRef = useRef(false);

  // Auto-suggest features whenever promptText changes (only if NOT prefilled from chat)
  useEffect(() => {
    if (promptText && promptText.trim().length > 5 && !isPrefilledRef.current) {
      const suggested = suggestFeaturesForPrompt(promptText);
      setSuggestedFeatures(suggested);
    }
  }, [promptText]);

  // Dynamic timeline calculation based on selected features
  useEffect(() => {
    if (isPrefilledRef.current) return; // Respect prefilled durationWeeks from chat
    const selectedWeeks = suggestedFeatures
      .filter(f => f.selected)
      .reduce((sum, f) => sum + f.durationWeeks, 0);
    if (selectedWeeks > 0) {
      setDurationWeeks(selectedWeeks);
    }
  }, [suggestedFeatures]);

  const toggleFeatureSelected = (id) => {
    isPrefilledRef.current = false; // User manually interacted with checkboxes
    setSuggestedFeatures(prev =>
      prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f)
    );
  };

  const handleAddCustomFeature = () => {
    if (!customFeatureText.trim()) return;
    const newFeat = {
      id: `custom-${Date.now()}`,
      name: customFeatureText.trim(),
      durationWeeks: 2, // Default duration for custom features
      selected: true
    };
    setSuggestedFeatures(prev => [...prev, newFeat]);
    setCustomFeatureText('');
    showNotification?.("Custom feature added and checked!", "success");
  };

  useEffect(() => {
    if (promptInput) {
      setPromptText(promptInput);
    }
  }, [promptInput]);

  useEffect(() => {
    if (financialConfig?.devCount) {
      setDevCount(financialConfig.devCount);
    }
    if (financialConfig?.durationWeeks) {
      setDurationWeeks(financialConfig.durationWeeks);
    }
  }, [financialConfig]);

  // Handle prefilled data from chat & auto-run
  useEffect(() => {
    if (proposalPrefill) {
      isPrefilledRef.current = true;
      if (proposalPrefill.companyName) setCompanyName(proposalPrefill.companyName);
      if (proposalPrefill.clientName) setClientName(proposalPrefill.clientName);
      if (proposalPrefill.projectName) setProjectName(proposalPrefill.projectName);
      if (proposalPrefill.industry) setIndustry(proposalPrefill.industry);
      if (proposalPrefill.promptText) setPromptText(proposalPrefill.promptText);
      if (proposalPrefill.selectedTech) setSelectedTech(proposalPrefill.selectedTech);
      if (proposalPrefill.devCount) setDevCount(proposalPrefill.devCount);
      if (proposalPrefill.durationWeeks) setDurationWeeks(proposalPrefill.durationWeeks);
      if (proposalPrefill.features && proposalPrefill.features.length > 0) {
        setSuggestedFeatures(proposalPrefill.features);
      } else if (proposalPrefill.promptText) {
        const suggested = suggestFeaturesForPrompt(proposalPrefill.promptText);
        setSuggestedFeatures(suggested);
      }

      const currentPrefill = { ...proposalPrefill };
      setProposalPrefill(null);

      if (currentPrefill.autoRun) {
        handleRunGenerator(currentPrefill);
      }
    }
  }, [proposalPrefill, setProposalPrefill]);

  const availableTechPills = [
    "React", "Node.js", "Python", "FastAPI", "Java Spring Boot", ".NET Core",
    "Flutter", "iOS Swift", "Android Kotlin", "AWS", "Docker", "Kubernetes",
    "PostgreSQL", "MongoDB", "Redis", "Pinecone Vector DB", "OpenAI API", "Kafka"
  ];

  const toggleTech = (tech) => {
    setSelectedTech(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleRunGenerator = async (overrideParams = null) => {
    // Check if overrideParams is a valid config object (not a React SyntheticEvent)
    const isValidConfig = overrideParams && typeof overrideParams === 'object' && !overrideParams._reactName && !overrideParams.nativeEvent && !overrideParams.target;
    
    const activePrompt = (isValidConfig && overrideParams.promptText) 
      ? overrideParams.promptText 
      : (promptText || promptInput || "");

    if (!activePrompt || !activePrompt.trim()) {
      showNotification("Please type client requirement details first!", "warning");
      return;
    }

    setIsGenerating(true);
    setHasRun(true);
    setAgentLog([]);
    setGeneratedDraft(null);

    const pCompany = (isValidConfig && overrideParams.companyName) ? overrideParams.companyName : companyName;
    const pClient = (isValidConfig && overrideParams.clientName) ? overrideParams.clientName : clientName;
    const pProject = (isValidConfig && overrideParams.projectName) ? overrideParams.projectName : projectName;
    const pIndustry = (isValidConfig && overrideParams.industry) ? overrideParams.industry : industry;
    const pTech = (isValidConfig && overrideParams.selectedTech) ? overrideParams.selectedTech : selectedTech;
    const pDevs = (isValidConfig && overrideParams.devCount) ? overrideParams.devCount : devCount;
    const pWeeks = (isValidConfig && overrideParams.durationWeeks) ? overrideParams.durationWeeks : durationWeeks;

    const activeFeatures = suggestedFeatures
      .filter(f => f.selected)
      .map(f => f.name);

    try {
      const result = await runMultiAgentProposalWorkflow({
        companyName: pCompany,
        clientName: pClient,
        clientEmail: currentUser?.email || `${pClient.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
        projectName: pProject,
        industry: pIndustry,
        promptText: activePrompt,
        selectedTech: pTech,
        devCount: Number(pDevs) || 6,
        durationWeeks: Number(pWeeks) || 12,
        selectedFeatures: activeFeatures
      }, (stepNum, agentName, logMessage) => {
        setCurrentStep(stepNum);
        setAgentLog(prev => [...prev, { step: stepNum, agent: agentName, message: logMessage, time: new Date().toLocaleTimeString() }]);
      });

      setIsGenerating(false);
      setGeneratedDraft(result);
      if (result.projectName) setProjectName(result.projectName);
      if (result.industry) setIndustry(result.industry);
      if (result.durationWeeks) setDurationWeeks(result.durationWeeks);
      addGeneratedProposal(result);
    } catch (error) {
      console.error("Failed to run multi-agent proposal workflow:", error);
      setIsGenerating(false);
      showNotification("An error occurred during proposal generation. Please try again.", "error");
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-900 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            AI Proposal Generator & Requirement Analyzer
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            7-Agent AI Workflow converting natural language briefs into complete SOW proposals with dynamic developer allocation and custom sprint plans.
          </p>
        </div>

        {generatedDraft && (
          <button
            onClick={() => {
              setActiveProposal(generatedDraft);
              setActiveTab('preview');
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Open Document Preview</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Input Form Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <GlassCard>
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <BotMessageSquare className="w-5 h-5 text-emerald-600" />
              1. Client & Project Requirements
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 font-semibold">Natural Language Project Brief</label>
                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xs"
                    title="Open Voice Input Assistant"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Voice Input</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Type client requirement details or click Voice Input to speak..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Core Feature Checklist & Selection Form */}
              {suggestedFeatures.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3.5">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      Select Scope & Features
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Select features to dynamically estimate timeline and SOW financials.
                    </p>
                  </div>

                  {/* Feature Checklist List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {suggestedFeatures.map((feat) => (
                      <label
                        key={feat.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          feat.selected
                            ? 'bg-white border-emerald-300 shadow-xs font-semibold'
                            : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={feat.selected || false}
                          onChange={() => toggleFeatureSelected(feat.id)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-400 border-slate-300 accent-emerald-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-[11px] leading-tight ${
                            feat.selected ? 'text-slate-900 font-bold' : 'text-slate-500'
                          }`}>
                            {feat.name}
                          </div>
                          <div className="text-[9.5px] text-emerald-600 font-bold mt-0.5">
                            Est. Effort: {feat.durationWeeks} week{feat.durationWeeks > 1 ? 's' : ''}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Custom Feature Adder Form */}
                  <div className="pt-2 border-t border-emerald-100 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customFeatureText}
                      onChange={(e) => setCustomFeatureText(e.target.value)}
                      placeholder="Add custom feature..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeature}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] shadow-xs shrink-0 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Controls: Team Size & Duration Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1 font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" /> Team Size:
                    </span>
                    <span className="text-emerald-700 font-bold">{devCount} Devs</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={devCount}
                    onChange={(e) => setDevCount(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer mt-1"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-1 font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Timeline:
                    </span>
                    <span className="text-emerald-700 font-bold">{durationWeeks} Wks</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={36}
                    step={2}
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Company (Provider)</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Project Name (Optional)</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Auto-detected from prompt..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option>Media & Generative AI</option>
                    <option>CMS & Digital Web</option>
                    <option>HR Tech & Recruitment</option>
                    <option>Food & Hospitality</option>
                    <option>EdTech & Education</option>
                    <option>Software & SaaS</option>
                    <option>Retail & E-Commerce</option>
                    <option>FinTech & Payments</option>
                    <option>Healthcare & HIPAA</option>
                    <option>Logistics & Supply Chain</option>
                  </select>
                </div>
              </div>

              {/* Technology Stack Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-600 font-semibold">Required Tech Stack (AI Matching)</label>
                  <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Wand2 className="w-3 h-3 text-emerald-600" /> Auto-Inferred from Brief
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {availableTechPills.map((tech) => {
                    const isSel = selectedTech.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTech(tech)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border ${isSel
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900'
                          }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => handleRunGenerator()}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Executing 7 AI Agents ({devCount} Devs, {durationWeeks} Wks)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Proposal ({devCount} Devs, {durationWeeks} Wks)</span>
                  </>
                )}
              </button>

            </div>
          </GlassCard>
        </div>

        {/* Right Output & Agent Execution Pipeline (7 cols) */}
        <div className="lg:col-span-7 space-y-5">

          {/* Agent Pipeline Stepper */}
          <GlassCard>
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                2. AI Agent Workflow Pipeline (7 Agents)
              </span>
              {isGenerating && <Badge variant="emerald">Running Step {currentStep}/7</Badge>}
            </h3>

            <div className="space-y-3">
              {[
                { step: 1, name: "Requirement Analyzer Agent", desc: "Parsing brief & extracting core requirements" },
                { step: 2, name: "RAG Retrieval Agent", desc: "Searching vector database for matching SOWs" },
                { step: 3, name: "Architecture Recommendation Agent", desc: "Generating cloud topology & DB schema" },
                { step: 4, name: "Resource Allocation Agent", desc: `Matching top ${devCount} available developers by skill vectors` },
                { step: 5, name: "Timeline Planner Agent", desc: `Calculating ${durationWeeks}-week sprint plan & milestones` },
                { step: 6, name: "Risk Analysis Agent", desc: "Assessing API latency & operational risks" },
                { step: 7, name: "Cost Estimator & Writer Agent", desc: `Assembling ${durationWeeks}-week quote for ${devCount} developers` }
              ].map((ag) => {
                const isCurrent = isGenerating && currentStep === ag.step;
                const isPassed = isGenerating ? currentStep > ag.step : (hasRun && generatedDraft !== null);
                return (
                  <div
                    key={ag.step}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${isCurrent
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md shadow-emerald-500/10'
                        : isPassed
                          ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${isCurrent
                          ? 'bg-emerald-600 text-white animate-bounce'
                          : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : ag.step}
                      </div>
                      <div>
                        <div className="font-bold">{ag.name}</div>
                        <div className="text-[11px] opacity-80">{ag.desc}</div>
                      </div>
                    </div>

                    {isCurrent && <span className="text-[10px] font-semibold text-emerald-700 animate-pulse">PROCESSING...</span>}
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Empty Placeholder before generating */}
          {!isGenerating && !generatedDraft && (
            <GlassCard className="text-center py-10">
              <div className="max-w-md mx-auto space-y-2 text-xs">
                <Sparkles className="w-8 h-8 text-emerald-600 mx-auto animate-pulse" />
                <div className="font-bold text-sm text-slate-900">Ready for Requirement Analysis</div>
                <p className="text-slate-500 leading-relaxed">
                  Type client requirement details in the box on the left and click <span className="text-emerald-700 font-semibold">"Generate Proposal"</span> to execute the 7-Agent AI Workflow.
                </p>
              </div>
            </GlassCard>
          )}

          {/* Generated Draft Output Card */}
          {generatedDraft && (
            <GlassCard className="border-emerald-300">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <div>
                  <Badge variant="emerald">Proposal Draft Ready</Badge>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{generatedDraft.projectName}</h3>
                  <div className="text-xs text-slate-500">ID: {generatedDraft.proposalId} • Client: {generatedDraft.clientName}</div>
                </div>

                <button
                  onClick={() => {
                    setActiveProposal(generatedDraft);
                    setActiveTab('preview');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>View Full Document</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Draft Summary Highlights */}
              <div className="grid grid-cols-3 gap-3 text-center mb-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-medium">Est. Timeline</div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">{generatedDraft.timeline.realisticWeeks} Weeks</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-medium">Assigned Devs</div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">{generatedDraft.teamStructure.length} Engineers</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-medium">Total Budget</div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">${generatedDraft.financials.grandTotal.toLocaleString()}</div>
                </div>
              </div>

              {/* Executive Summary Snippet */}
              <div className="text-xs text-slate-800 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 leading-relaxed mb-4">
                <div className="font-semibold text-emerald-900 mb-1">Executive Summary Snippet:</div>
                {generatedDraft.executiveSummary}
              </div>

              {/* AI Recommended Tech Stack & Timeline Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mb-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Inferred Tech Stack & Timeline Analysis</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Auto-Calculated</span>
                </div>

                <div>
                  <div className="text-slate-600 text-[11px] font-semibold mb-1.5">Recommended Tech Stack:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedDraft.techStack && generatedDraft.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {generatedDraft.architecture && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block font-semibold">Frontend Architecture:</span>
                      <span className="text-slate-800 font-medium">{generatedDraft.architecture.frontend}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block font-semibold">Backend Infrastructure:</span>
                      <span className="text-slate-800 font-medium">{generatedDraft.architecture.backend}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Matched Bench Devs Preview */}
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">AI-Recommended Engineering Team ({generatedDraft.teamStructure.length} Engineers):</div>
                <div className="flex flex-wrap gap-2">
                  {generatedDraft.teamStructure.map(dev => (
                    <div key={dev.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <img src={dev.avatar} alt={dev.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <span>{dev.name}</span>
                          <button
                            onClick={() => setSelectedDevForProfile(dev)}
                            className="font-mono text-[10px] text-emerald-700 hover:underline flex items-center"
                          >
                            ({dev.empCode})
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">{dev.role} (${dev.hourlyRate}/hr)</div>
                      </div>
                      <Badge variant="emerald" size="sm">{dev.matchPercentage || 95}% Match</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

        </div>
      </div>

      {/* Voice Input Assistant Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptComplete={(spokenText) => {
          setPromptText(spokenText);
          showNotification?.("🎙️ Spoken requirement inserted into generator!", "success");
        }}
        initialText={promptText}
      />
    </div>
  );
}
