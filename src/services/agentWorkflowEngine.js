import { retrieveRagContext, matchBenchDevelopers, findSimilarProposals } from './ragEngine';
import { calculateRealisticInfrastructureCosts } from './langGraphEngine';

// Helper to infer dynamic tech stack directly from user's project prompt
export function inferTechStackFromPrompt(promptText = "") {
  const text = (promptText || "").toLowerCase();
  const techSet = new Set();

  // WordPress / Low Budget
  if (text.includes("wordpress") || text.includes("elementor") || text.includes("cms")) {
    techSet.add("WordPress");
    techSet.add("PHP");
    techSet.add("MySQL");
    techSet.add("Elementor");
  }

  // AI Movie / Face-Swap Video / Voice
  if (text.includes("movie") || text.includes("face") || text.includes("video") || text.includes("voice") || text.includes("comedy") || text.includes("laugh") || text.includes("youtube")) {
    techSet.add("Python");
    techSet.add("FastAPI");
    techSet.add("PyTorch");
    techSet.add("OpenAI API");
    techSet.add("React");
    techSet.add("AWS");
  }

  // AI / Resume Screening / NLP / LLM / Chatbot / HR
  if (text.includes("ai") || text.includes("ml") || text.includes("resume") || text.includes("screening") || 
      text.includes("parsing") || text.includes("nlp") || text.includes("chatbot") || text.includes("llm") || text.includes("gpt") || text.includes("hiring")) {
    techSet.add("Python");
    techSet.add("FastAPI");
    techSet.add("OpenAI API");
    techSet.add("Pinecone Vector DB");
    techSet.add("React");
    techSet.add("PostgreSQL");
  }

  // E-Commerce / Store / Retail / Orders
  if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("store") || text.includes("retail") || text.includes("shopping") || text.includes("bakery") || text.includes("cake")) {
    techSet.add("React");
    techSet.add("Node.js");
    techSet.add("PostgreSQL");
    techSet.add("Redis");
    techSet.add("AWS");
  }

  // Mobile App / Cross-platform
  if (text.includes("mobile") || text.includes("app") || text.includes("flutter") || text.includes("ios") || text.includes("android")) {
    techSet.add("Flutter");
    techSet.add("Node.js");
    techSet.add("MongoDB");
    techSet.add("AWS");
  }

  // Healthcare / Telehealth / HIPAA
  if (text.includes("health") || text.includes("telehealth") || text.includes("doctor") || text.includes("patient") || text.includes("hipaa")) {
    techSet.add("React");
    techSet.add("Python");
    techSet.add("FastAPI");
    techSet.add("PostgreSQL");
    techSet.add("AWS");
    techSet.add("Docker");
  }

  // FinTech / Payments / Banking / Fraud
  if (text.includes("fintech") || text.includes("fraud") || text.includes("bank") || text.includes("payment") || text.includes("wallet")) {
    techSet.add("Java Spring Boot");
    techSet.add("Kafka");
    techSet.add("PostgreSQL");
    techSet.add("Redis");
    techSet.add("AWS");
  }

  // CRM / ERP / Enterprise
  if (text.includes("crm") || text.includes("erp") || text.includes("sales") || text.includes("enterprise")) {
    techSet.add("React");
    techSet.add(".NET Core");
    techSet.add("PostgreSQL");
    techSet.add("Docker");
    techSet.add("Kubernetes");
  }

  // Default fallback if no specific keywords matched
  if (techSet.size === 0) {
    techSet.add("React");
    techSet.add("Node.js");
    techSet.add("PostgreSQL");
    techSet.add("AWS");
  }

  return Array.from(techSet);
}

// Helper to extract clean dynamic title from prompt text
function deriveProjectTitle(promptText, inputProjectName) {
  if (inputProjectName && inputProjectName.trim().length > 3 && inputProjectName !== "Enterprise Software Application" && inputProjectName !== "Omnichannel E-Commerce & AI Platform") {
    return inputProjectName.trim();
  }

  const text = (promptText || "").toLowerCase();
  if (text.includes("pet") || text.includes("pets") || text.includes("animal")) return "Pet E-Commerce Platform";
  if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("ecomm") || text.includes("store") || text.includes("shop")) return "Omnichannel E-Commerce & AI Recommendation Engine";
  if (text.includes("dental") || text.includes("clinic")) return "Dental Clinic Website";
  if (text.includes("wordpress") || text.includes("elementor")) return "WordPress Custom Website";
  if (text.includes("movie") || text.includes("face") || text.includes("swap") || text.includes("video") || text.includes("voice") || text.includes("comedy") || text.includes("laugh") || text.includes("youtube")) return "AI Movie & Face-Swap Video Platform";
  if (text.includes("resume") || text.includes("screening") || text.includes("hiring") || text.includes("recruitment")) return "AI Resume Screening & Candidate Parsing Engine";
  if (text.includes("telehealth") || text.includes("patient") || text.includes("hipaa") || text.includes("doctor")) return "HIPAA-Compliant Patient Telehealth Portal";
  if (text.includes("crm") || text.includes("sales") || text.includes("customer relationship")) return "Enterprise Cloud CRM & Sales Automation System";
  if (text.includes("fraud") && text.includes("payment")) return "Real-Time Payment Fraud Detection Engine";
  if (text.includes("fintech") || text.includes("banking") || text.includes("wallet")) return "FinTech Payment Gateway Platform";
  if (text.includes("chatbot") || text.includes("rag") || text.includes("llm") || text.includes("ai assistant")) return "AI-Powered Customer Support & RAG Chatbot";

  if (promptText && promptText.trim().length > 5) {
    const stopWords = new Set(['need', 'want', 'please', 'generate', 'create', 'build', 'for', 'this', 'app', 'with', 'my', 'budget', 'is', 'low', 'suggest', 'nvp', 'time', 'should', 'months', 'weeks', 'developers', 'people', 'team']);
    const cleanWords = promptText.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w.toLowerCase())).slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    if (cleanWords.length > 3) return `${cleanWords} Platform`;
  }

  return (inputProjectName && inputProjectName.length > 3) 
    ? inputProjectName 
    : "Enterprise Software Application";
}

// Helper to extract dynamic industry
function deriveIndustry(promptText, inputIndustry) {
  const text = (promptText || "").toLowerCase();
  if (text.includes("movie") || text.includes("face") || text.includes("video") || text.includes("voice") || text.includes("comedy") || text.includes("laugh") || text.includes("youtube")) return "Media & Generative AI";
  if (text.includes("wordpress") || text.includes("elementor") || text.includes("cms")) return "CMS & Digital Web";
  if (text.includes("resume") || text.includes("screening") || text.includes("hiring") || text.includes("candidate") || text.includes("hr")) return "HR Tech & Recruitment";
  if (text.includes("health") || text.includes("doctor") || text.includes("patient") || text.includes("hipaa")) return "Healthcare & HIPAA";
  if (text.includes("fintech") || text.includes("fraud") || text.includes("bank") || text.includes("wallet")) return "FinTech & Payments";
  if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("store") || text.includes("retail")) return "Retail & E-Commerce";
  if (text.includes("logistics") || text.includes("fleet") || text.includes("truck")) return "Logistics & Supply Chain";
  if (text.includes("school") || text.includes("lms") || text.includes("course")) return "EdTech & Education";
  return (inputIndustry && inputIndustry !== "FinTech & Payments") ? inputIndustry : "Software & SaaS";
}

// Helper to calculate dynamic duration based on prompt if not explicitly provided
function deriveDurationWeeks(promptText, inputWeeks) {
  if (inputWeeks && Number(inputWeeks) !== 12) {
    return Number(inputWeeks);
  }
  const lower = (promptText || "").toLowerCase();
  let complexity = 5;
  if (lower.includes('movie') || lower.includes('face') || lower.includes('swap') || lower.includes('video') || lower.includes('voice') || lower.includes('generative') || lower.includes('deepfake')) complexity += 4;
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('model') || lower.includes('pytorch') || lower.includes('llm') || lower.includes('rag')) complexity += 2;
  if (lower.includes('enterprise') || lower.includes('bank') || lower.includes('hipaa') || lower.includes('multi-tenant') || lower.includes('security')) complexity += 2;
  if (lower.includes('streaming') || lower.includes('real-time') || lower.includes('telemetry') || lower.includes('kafka')) complexity += 2;
  if (lower.includes('wordpress') || lower.includes('elementor') || lower.includes('cms') || lower.includes('cheap') || lower.includes('low budget')) complexity -= 3;
  if (lower.includes('landing page') || lower.includes('static') || lower.includes('blog')) complexity -= 3;

  complexity = Math.max(1, Math.min(10, complexity));
  return Math.max(3, Math.min(26, Math.round(complexity * 2.4)));
}

// Helper to generate dynamic sprint breakdown matching exact durationWeeks
function generateDynamicSprints(durationWeeks, projectTitle) {
  const weeks = Number(durationWeeks);
  
  if (weeks <= 8) {
    return [
      { sprint: "Sprint 1-2", focus: "Architecture Setup & Wireframes", deliverables: "Technical Spec, Data Models, CI/CD Pipeline" },
      { sprint: "Sprint 3-4", focus: "Core APIs & Database Services", deliverables: "REST APIs, Security Auth, Schema Migrations" },
      { sprint: "Sprint 5-6", focus: "Frontend UI & Feature Integration", deliverables: "Web Dashboard, Responsive Interfaces" },
      { sprint: "Sprint 7-8", focus: "QA Testing & Production Launch", deliverables: "End-to-End Tests, Production Deployment & SOW Signoff" }
    ];
  } else if (weeks <= 12) {
    return [
      { sprint: "Sprint 1-2", focus: "Architecture Discovery & Data Schema", deliverables: "System Spec, OpenAPI Docs, Cloud Infra" },
      { sprint: "Sprint 3-5", focus: "Microservices & Core Logic", deliverables: "Backend Microservices, Security Audit" },
      { sprint: "Sprint 6-8", focus: "Frontend App & Mobile Integration", deliverables: "Interactive Portal, UI Kit, State Management" },
      { sprint: "Sprint 9-10", focus: "AI Pipeline & Third-Party APIs", deliverables: "RAG Vector DB, Payment Gateway, Caching" },
      { sprint: "Sprint 11-12", focus: "UAT Testing & Production Deployment", deliverables: "User Acceptance Signoff, Production Launch" }
    ];
  } else if (weeks <= 16) {
    return [
      { sprint: "Sprint 1-3", focus: "Enterprise Architecture & Cloud Topology", deliverables: "AWS Infra as Code, System Topology, DB Replication" },
      { sprint: "Sprint 4-7", focus: "Distributed Backend & API Gateway", deliverables: "Sub-50ms Microservices, Kafka Streams, Encryption" },
      { sprint: "Sprint 8-11", focus: "Omnichannel Frontend & Mobile Apps", deliverables: "React Web Dashboard & Cross-Platform Mobile Apps" },
      { sprint: "Sprint 12-14", focus: "AI Model & Security Compliance", deliverables: "Vector DB Pipeline, SOC2 / HIPAA Audit Verification" },
      { sprint: "Sprint 15-16", focus: "UAT Hardening & Global Launch", deliverables: "Load Testing, Production Cutover & Support Documentation" }
    ];
  } else {
    return [
      { sprint: "Sprint 1-4", focus: "Enterprise Architecture & Multi-AZ Cloud Setup", deliverables: "System Blueprint, DB Cluster Setup, CI/CD" },
      { sprint: "Sprint 5-10", focus: "High-Availability Backend Microservices", deliverables: "Distributed APIs, Event Streaming, Vault Encryption" },
      { sprint: "Sprint 11-16", focus: "Multi-Tenant Web & Mobile Applications", deliverables: "Web Portals, iOS & Android Apps, Admin Telemetry" },
      { sprint: "Sprint 17-20", focus: "AI Engine & Analytics Intelligence", deliverables: "RAG Search Pipeline, Real-Time Analytics Dashboard" },
      { sprint: "Sprint 21-24", focus: "Security Hardening, Compliance Audit & Go-Live", deliverables: "Penetration Testing, User Training, Global Launch" }
    ];
  }
}

// Simulates real-time Agent Workflow execution pipeline
export async function runMultiAgentProposalWorkflow(inputData, onProgressStep) {
  const {
    companyName = "ProposalAI Solutions",
    clientName = "Enterprise Client",
    clientEmail = null,
    projectName = "",
    industry = "",
    promptText = "",
    selectedTech = [],
    devCount = 6,
    durationWeeks: inputWeeks,
    avgHourlyRate = 60,
    budgetRange = "$100,000 - $150,000",
    selectedFeatures = []
  } = inputData;

  const targetDevCount = Number(devCount) || 6;
  const derivedTitle = deriveProjectTitle(promptText, projectName);
  const derivedInd = deriveIndustry(promptText, industry);
  const durationWeeks = deriveDurationWeeks(promptText, inputWeeks);

  const fullQuery = `${derivedTitle} ${promptText} ${derivedInd} ${selectedTech.join(' ')}`;

  // --- Step 1: Requirement Analyzer Agent ---
  if (onProgressStep) onProgressStep(1, "Requirement Analyzer Agent", `Parsing requirements for ${targetDevCount} devs over ${durationWeeks} weeks...`);
  await new Promise(res => setTimeout(res, 500));

  const textLower = fullQuery.toLowerCase();
  const autoInferredTech = inferTechStackFromPrompt(promptText);
  let extractedTech = (selectedTech && selectedTech.length > 0) ? selectedTech : autoInferredTech;
  if (!extractedTech || extractedTech.length === 0) {
    extractedTech = autoInferredTech;
  }
  extractedTech = Array.from(new Set(extractedTech));

  // --- Step 2: RAG Retrieval Agent ---
  if (onProgressStep) onProgressStep(2, "RAG Knowledge Retrieval Agent", "Searching vector database for matching SOW templates...");
  await new Promise(res => setTimeout(res, 500));

  const ragChunks = retrieveRagContext(fullQuery);
  const similarProposals = findSimilarProposals(fullQuery);

  // --- Step 3: Architecture Recommendation Agent ---
  if (onProgressStep) onProgressStep(3, "Architecture Recommendation Agent", "Designing cloud topology & database schema...");
  await new Promise(res => setTimeout(res, 600));

  const architecture = {
    frontend: textLower.includes("flutter") || textLower.includes("mobile") 
      ? "Flutter (Cross-Platform Mobile App & Web)" 
      : "React 18 + Next.js (TypeScript & Tailwind CSS)",
    backend: textLower.includes("python") || textLower.includes("fastapi")
      ? "Python FastAPI Microservices Server"
      : textLower.includes("java")
      ? "Java Spring Boot Distributed Gateway"
      : "Node.js Express Enterprise Gateway",
    database: textLower.includes("mongo") ? "MongoDB Cluster + Redis Cache" : "PostgreSQL Primary + Redis Distributed Cache",
    cloudInfra: textLower.includes("azure") ? "Microsoft Azure Cloud Services" : "AWS (ECS Fargate, RDS Multi-AZ, S3 & CloudFront)",
    aiVectorDB: textLower.includes("ai") || textLower.includes("rag") || textLower.includes("chatbot") ? "Pinecone Vector DB + OpenAI GPT-4o API" : "N/A",
    security: textLower.includes("hipaa") ? "HIPAA Compliant Encrypted Storage & Audit Logs" : textLower.includes("pci") || textLower.includes("fintech") ? "PCI-DSS Level 1 Encrypted Payment Vault" : "OAuth2.0 / JWT Auth & SOC2 Logging"
  };

  // --- Step 4: Resource Allocation Agent ---
  if (onProgressStep) onProgressStep(4, "Resource Allocation Agent", `Matching top ${targetDevCount} bench developers by skill vectors...`);
  await new Promise(res => setTimeout(res, 600));

  const recommendedBenchDevs = matchBenchDevelopers(extractedTech, targetDevCount);

  // --- Step 5: Timeline Planner Agent ---
  if (onProgressStep) onProgressStep(5, "Timeline Planner Agent", `Generating ${durationWeeks}-week sprint plan & critical path...`);
  await new Promise(res => setTimeout(res, 500));

  const timeline = {
    optimisticWeeks: Math.max(4, durationWeeks - 2),
    realisticWeeks: durationWeeks,
    worstCaseWeeks: durationWeeks + 4,
    confidenceScore: 94,
    sprints: generateDynamicSprints(durationWeeks, derivedTitle)
  };

  // --- Step 6: Risk Analysis Agent ---
  if (onProgressStep) onProgressStep(6, "Risk Analysis Agent", "Evaluating technical feasibility & latency risks...");
  await new Promise(res => setTimeout(res, 500));

  const riskAnalysis = [
    { risk: "Third-party API rate limits & response latency", level: "Medium", mitigation: "Implement Redis caching and exponential backoff retries." },
    { risk: "Scope creep during UAT sprint", level: "High", mitigation: "Strict change-request workflow with pre-approved sprint milestones." },
    { risk: "Data compliance & security standards", level: "Medium", mitigation: "End-to-end TLS encryption and automated vulnerability scans." }
  ];

  // --- Step 7: Cost Estimator & Proposal Writer Agent ---
  if (onProgressStep) onProgressStep(7, "Cost Estimator & Proposal Writer Agent", `Assembling ${durationWeeks}-week financial quote for ${recommendedBenchDevs.length} developers...`);
  await new Promise(res => setTimeout(res, 600));

  const estimateBreakup = recommendedBenchDevs.map((dev) => {
    const devHours = Math.round((durationWeeks * 40));
    const total = devHours * dev.hourlyRate;
    return {
      item: `${dev.role} Engineering (${dev.name})`,
      empCode: dev.empCode,
      hours: devHours,
      rate: dev.hourlyRate,
      total: total
    };
  });

  const totalDevCost = estimateBreakup.reduce((sum, item) => sum + item.total, 0);
  const { cloudInfraCost, thirdPartyApiCost, cloudInfraDescription, thirdPartyApiDescription } = calculateRealisticInfrastructureCosts(promptText, derivedTitle, derivedInd);
  const contingencyBuffer = Math.round(totalDevCost * 0.10);
  const grandTotal = totalDevCost + cloudInfraCost + thirdPartyApiCost + contingencyBuffer;

  estimateBreakup.push(
    { item: `Cloud Infrastructure (${cloudInfraDescription})`, empCode: "N/A", hours: 1, rate: cloudInfraCost, total: cloudInfraCost },
    { item: `Third-Party APIs (${thirdPartyApiDescription})`, empCode: "N/A", hours: 1, rate: thirdPartyApiCost, total: thirdPartyApiCost },
    { item: "Contingency Buffer (10%)", empCode: "N/A", hours: 1, rate: contingencyBuffer, total: contingencyBuffer }
  );

  function generateDynamicScopeOfWork(prompt, title, tech) {
    if (selectedFeatures && selectedFeatures.length > 0) {
      const items = [
        `End-to-End System Blueprint, Interactive Wireframes & Architecture Specification for ${title}`
      ];
      selectedFeatures.forEach(feat => {
        items.push(feat);
      });
      items.push("Enterprise Cloud Infrastructure Setup (AWS/GCP), CI/CD Automated Pipelines & Docker Containerization");
      items.push("Security Audits, Role-Based Access Control (RBAC), Penetration Testing & 60-Day Post-Launch SLA Warranty");
      return items;
    }

    const pLower = (prompt || "").toLowerCase();
    const primaryTechStr = (tech && tech.length > 0) ? tech.slice(0, 3).join(', ') : 'Modern Cloud Microservices';
    
    const items = [
      `End-to-End System Blueprint, Interactive Wireframes & Architecture Specification for ${title}`,
      `High-Throughput Backend Microservices & API Gateway Services built with ${primaryTechStr}`
    ];

    if (pLower.includes("movie") || pLower.includes("video") || pLower.includes("face") || pLower.includes("voice") || pLower.includes("character") || pLower.includes("comedy") || pLower.includes("laugh") || pLower.includes("youtube")) {
      items.push("AI Deep Learning Face-Swap & Neural Voice Cloning Pipeline (PyTorch / ElevenLabs API)");
      items.push("High-Throughput FFmpeg Video Rendering Engine & Monetization Telemetry Vault");
    } else if (pLower.includes("wordpress") || pLower.includes("elementor") || pLower.includes("cms")) {
      items.push("Custom Responsive WordPress Theme & Elementor Pro Interactive Page Layout Setup");
      items.push("WooCommerce / Custom Payment Gateway Integration & SEO Caching Optimization");
    } else if (pLower.includes("resume") || pLower.includes("screening") || pLower.includes("hiring") || pLower.includes("hr")) {
      items.push("Automated Multi-Format Resume Parser & Vector Database Indexing (Pinecone)");
      items.push("Recruiter Candidate Scoring Dashboard & Automated Outreach Scheduling");
    } else if (pLower.includes("telehealth") || pLower.includes("health") || pLower.includes("doctor") || pLower.includes("patient") || pLower.includes("hipaa")) {
      items.push("HIPAA-Compliant WebRTC Video Consultation Suite & Patient EMR Encrypted Vault");
      items.push("Automated Appointment Scheduling & Hospital Admin Telemetry Dashboard");
    } else if (pLower.includes("fraud") || pLower.includes("payment") || pLower.includes("bank") || pLower.includes("fintech") || pLower.includes("wallet")) {
      items.push("Sub-50ms High-Throughput Payment Transaction Gateway & Ledger Vault");
      items.push("Machine Learning Real-Time Fraud Detection Rules Engine & Alert Telemetry");
    } else if (pLower.includes("ecommerce") || pLower.includes("e-commerce") || pLower.includes("store") || pLower.includes("shopping") || pLower.includes("shop")) {
      items.push("High-Availability Product Catalog Engine, Cart Checkout & Dynamic Pricing Service");
      items.push("Real-Time Inventory Management, Payment Gateway & Order Fulfillment Pipeline");
    } else if (pLower.includes("mobile") || pLower.includes("flutter") || pLower.includes("ios") || pLower.includes("android")) {
      items.push("Cross-Platform Mobile Application Suite (iOS & Android) with Offline Cache Sync");
      items.push("Native Push Notification Server & Device Telemetry Integration");
    } else {
      items.push(`Custom Core Business Logic Engine & Specialized Feature Workflows for ${title}`);
      items.push(`Interactive User Portal, Admin Telemetry Dashboard & Feature Modules`);
    }

    items.push("Enterprise Cloud Infrastructure Setup (AWS/GCP), CI/CD Automated Pipelines & Docker Containerization");
    items.push("Security Audits, Role-Based Access Control (RBAC), Penetration Testing & 60-Day Post-Launch SLA Warranty");

    return items;
  }

  const scopeOfWork = generateDynamicScopeOfWork(promptText, derivedTitle, extractedTech);

  const profitMargin = Math.round(totalDevCost * 0.18);

  const generatedProposal = {
    proposalId: `PROP-${Math.floor(1000 + Math.random() * 9000)}`,
    companyName,
    clientName,
    clientEmail: clientEmail || `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
    clientPhone: "+1 (555) 349-1092",
    projectName: derivedTitle,
    industry: derivedInd,
    createdAt: new Date().toISOString().split('T')[0],
    complexity: durationWeeks >= 16 ? "Enterprise / High" : durationWeeks >= 12 ? "Medium / High" : "Standard",
    executiveSummary: `We are pleased to submit this proposal for ${derivedTitle} on behalf of ${companyName}. Designed specifically for ${clientName}, this initiative leverages modern cloud architecture, a dedicated team of ${recommendedBenchDevs.length} pre-vetted bench engineers, and a ${durationWeeks}-week delivery timeline to accelerate time-to-market while mitigating technical risk.`,
    scopeOfWork,
    deliverables: [
      `Production-ready ${derivedTitle} Codebase`,
      "OpenAPI / Swagger API Specifications & Technical Docs",
      "Terraform / AWS Infrastructure as Code Scripts",
      "Automated Testing Suites (Unit, Integration & E2E)",
      "Admin User Guide & Production Deployment Signoff"
    ],
    techStack: extractedTech,
    architecture,
    teamStructure: recommendedBenchDevs,
    timeline,
    durationWeeks,
    riskAnalysis,
    estimateBreakup,
    financials: {
      devCost: totalDevCost,
      cloudInfraCost,
      thirdPartyApiCost,
      contingencyBuffer,
      profitMargin,
      grandTotal,
      currency: "USD"
    },
    ragReferenceChunks: ragChunks,
    similarPastProposals: similarProposals,
    termsAndConditions: "Standard 30% advance retainer upon contract signature, 40% upon Milestone 3 sprint completion, and 30% upon final production signoff. 60-day post-launch bug warranty included."
  };

  return generatedProposal;
}
