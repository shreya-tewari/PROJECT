import { retrieveRagContext, matchBenchDevelopers, findSimilarProposals } from './ragEngine';
import { sendBackendChatTurn } from './backendApi';

/**
 * LangGraph Conversational State Graph Engine for ProposalAI
 * Simulates a LangGraph state machine with memory retention, entity extraction, 
 * vector RAG context retrieval, and optional live LLM API execution.
 */

// Initial Graph Memory State
export function createInitialGraphState() {
  return {
    currentNode: 'INIT',
    history: [],
    contextMemory: {
      userName: null,
      projectTitle: null,
      techStack: [],
      devCount: null,
      durationWeeks: null,
      totalProjectHours: null,   // FIXED total effort (person-hours) for this project
      budget: null,
      industry: 'Software & SaaS',
      extractedRequirements: [],
      lastTopic: null,
      conversationPhase: null,
      suggestedFeatures: []
    }
  };
}

/**
 * Estimates TOTAL project effort in person-hours based on complexity score.
 * This is the FIXED amount of work regardless of team size.
 * More devs = faster delivery (fewer calendar weeks), NOT more hours.
 * Formula basis: industry-standard COCOMO-lite estimation
 *
 * Complexity 1-3  → small   (simple site, landing page, WordPress)
 * Complexity 4-6  → medium  (e-commerce, CRM, basic SaaS)
 * Complexity 7-8  → large   (fintech, healthtech, AI platform)
 * Complexity 9-10 → XL      (AI video, deepfake, real-time streaming)
 */
export function estimateTotalProjectHours(complexityScore, featureWeeks = 0) {
  // If we have feature-level week estimates, use those as base
  // Each feature-week = ~35 hrs of focused dev work (realistic, not 40 since meetings, reviews etc.)
  if (featureWeeks > 0) {
    return Math.round(featureWeeks * 35);
  }
  // Complexity-based estimation
  const baseHours = {
    1: 80,   2: 140,  3: 220,
    4: 320,  5: 450,  6: 600,
    7: 800,  8: 1100, 9: 1500, 10: 2000
  };
  return baseHours[Math.round(complexityScore)] || 450;
}

/**
 * Given total project hours + devCount, compute calendar weeks.
 * Applies a parallelization efficiency factor (Brooks' Law: adding devs has diminishing returns).
 * A single dev works ~35 effective hrs/week (meetings, code review, etc).
 * Each extra dev beyond 2 reduces efficiency slightly due to coordination overhead.
 */
export function computeCalendarWeeks(totalHours, devCount) {
  const hoursPerDevPerWeek = 35; // realistic effective hours (not 40)
  // Parallelization efficiency: 1 dev=100%, 2 devs=90%, 3=82%, 4=75%, 5=70%, 6+=66%
  const efficiency = Math.max(0.66, 1 - (devCount - 1) * 0.08);
  const effectiveTeamHrsPerWeek = devCount * hoursPerDevPerWeek * efficiency;
  return Math.ceil(totalHours / effectiveTeamHrsPerWeek);
}

/**
 * Given total project hours + durationWeeks, compute recommended devCount.
 */
export function computeDevCount(totalHours, durationWeeks) {
  const hoursPerDevPerWeek = 35;
  // Binary-search for the devCount where computeCalendarWeeks(totalHours, devCount) ≈ durationWeeks
  for (let d = 1; d <= 12; d++) {
    if (computeCalendarWeeks(totalHours, d) <= durationWeeks) return d;
  }
  return 12;
}

/**
 * Role-based hour allocation: each developer works on their specific module,
 * not the entire project duration. Returns hours per dev role.
 * totalHours is split among roles by their typical contribution.
 */
export function allocateHoursByRole(totalHours, devRoles) {
  // Typical effort split in a software project:
  // Full Stack: 25% | Frontend: 15% | Backend: 20% | AI/ML: 20%
  // DevOps: 10% | QA: 5% | Data/DB: 5%
  const roleWeights = {
    'Full Stack Developer': 0.25,
    'Frontend Developer': 0.15,
    'Backend Developer': 0.20,
    'AI/ML Engineer': 0.20,
    'DevOps Engineer': 0.10,
    'QA Engineer': 0.05,
    'Node Developer': 0.15,
    'Python Developer': 0.18,
    'Cloud Architect': 0.10,
    'Data Engineer': 0.10
  };

  // Normalize weights for the allocated roles
  const rawWeights = devRoles.map(r => roleWeights[r] || 0.15);
  const totalWeight = rawWeights.reduce((a, b) => a + b, 0);
  return rawWeights.map(w => Math.round((w / totalWeight) * totalHours));
}

// Memory Extraction Node: Extracts key facts from natural language
export function extractMemoryEntities(text, currentMemory) {
  const memory = { ...currentMemory, techStack: [...(currentMemory?.techStack || [])] };
  const lower = text.toLowerCase();

  // Extract Name (e.g., "my name is Shreya", "I am Alex")
  const nameMatch = text.match(/(?:my name is|i am|call me|this is)\s+([A-Za-z]+)/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    if (!['a', 'an', 'the', 'building', 'looking', 'trying', 'wanting'].includes(candidate.toLowerCase())) {
      memory.userName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // Detect Low Budget Signal (handles common typos like budegt, dolar, dollar)
  const isLowBudget = lower.includes('low budget') || 
                     lower.includes('budget is low') || 
                     lower.includes('budegt') ||
                     lower.includes('small budget') || 
                     lower.includes('minimal budget') || 
                     lower.includes('cheap') || 
                     lower.includes('less money') || 
                     lower.includes('less budget') ||
                     lower.includes('affordable') || 
                     lower.includes('under $') || 
                     lower.includes('wordpress') || 
                     lower.includes('landing page') || 
                     lower.includes('cost effective') ||
                     lower.includes('dolar') ||
                     lower.includes('dollar');

  if (isLowBudget) {
    memory.isLowBudget = true;
  }

  // Extract explicit numerical budget & rate (ONLY if explicitly preceded by budget keywords or $ sign)
  const hourlyMatch = lower.match(/(?:\$|usd)\s*(\d+)\s*(?:\/|\s*per\s*)h(?:ou)?r/i) || lower.match(/(\d+)\s*(?:\/|\s*per\s*)h(?:ou)?r/i);
  const totalMatch = lower.match(/(?:budget|budegt|price|cost|under|below|around|about)\s*(?:is|=|:)?\s*\$?([\d,]+)/i) || lower.match(/\$([\d,]+)\s*(?:usd|dolar|dollar|bucks)?/i) || lower.match(/([\d,]+)\s*(?:usd|dolar|dollar|bucks)/i);

  if (hourlyMatch && hourlyMatch[1]) {
    memory.explicitHourlyBudget = parseInt(hourlyMatch[1], 10);
  }

  if (totalMatch && totalMatch[1]) {
    const val = parseInt(totalMatch[1].replace(/,/g, ''), 10);
    if (val > 0 && val < 500000) {
      memory.explicitTotalBudget = val;
    }
  }

  // 1. Dynamic Complexity Scoring
  let complexityScore = 5;
  if (lower.includes('movie') || lower.includes('face') || lower.includes('swap') || lower.includes('video') || lower.includes('voice') || lower.includes('generative') || lower.includes('deepfake')) complexityScore += 4;
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('model') || lower.includes('pytorch') || lower.includes('llm') || lower.includes('rag')) complexityScore += 2;
  if (lower.includes('enterprise') || lower.includes('bank') || lower.includes('hipaa') || lower.includes('multi-tenant') || lower.includes('security')) complexityScore += 2;
  if (lower.includes('streaming') || lower.includes('real-time') || lower.includes('telemetry') || lower.includes('kafka')) complexityScore += 2;
  if (isLowBudget || lower.includes('wordpress') || lower.includes('elementor') || lower.includes('cms')) complexityScore -= 3;
  if (lower.includes('landing page') || lower.includes('static') || lower.includes('blog')) complexityScore -= 3;

  complexityScore = Math.max(1, Math.min(10, complexityScore));
  memory.complexityScore = complexityScore;

  // 2. Extract Explicit Dev Count & Duration
  // Match both singular and plural: "developer", "developers", "dev", "devs", "engineer", "engineers"
  const devMatch = text.match(/(\d+)\s*(?:developers?|devs?|engineers?|people|team\s*members?)/i);
  // Match both singular and plural: "week", "weeks"
  const weekMatch = text.match(/(\d+)\s*(?:weeks?|wks?)/i);
  const monthMatch = text.match(/(\d+)\s*(?:months?|mths?)/i);

  if (devMatch && devMatch[1]) {
    memory.devCount = parseInt(devMatch[1], 10);
    memory.devCountExplicit = true;
  } else {
    if (!memory.devCountExplicit) {
      memory.devCount = null; // will be derived from totalProjectHours later
      memory.devCountExplicit = false;
    }
  }

  if (weekMatch && weekMatch[1]) {
    memory.durationWeeks = parseInt(weekMatch[1], 10);
    memory.durationExplicit = true;
  } else if (monthMatch && monthMatch[1]) {
    memory.durationWeeks = parseInt(monthMatch[1], 10) * 4;
    memory.durationExplicit = true;
  } else {
    if (!memory.durationExplicit) {
      memory.durationWeeks = null; // will be derived from totalProjectHours later
      memory.durationExplicit = false;
    }
  }

  // Compute totalProjectHours from complexity (fixed effort for this project)
  // This is the KEY number: it stays roughly constant regardless of team size
  memory.totalProjectHours = estimateTotalProjectHours(complexityScore);

  // 3. Dynamic Rates & Cloud Infrastructure Costs
  memory.avgHourlyRate = isLowBudget ? 35 : (complexityScore >= 8 ? 65 : (complexityScore >= 5 ? 55 : 45));
  memory.cloudCost = isLowBudget ? 150 : (complexityScore >= 8 ? 4500 : (complexityScore >= 5 ? 1200 : 400));

  // 4. Extract Tech Stack
  const techKeywords = [
    'WordPress', 'PHP', 'Elementor', 'WooCommerce', 'Supabase', 'Firebase', 'Vercel',
    'React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'AWS', 'PostgreSQL', 
    'Docker', 'Kubernetes', 'Flutter', 'React Native', 'GraphQL', 'MongoDB', 
    'PyTorch', 'OpenAI', 'Kafka', 'Redis', 'Vue', 'Angular', 'Java', 'Go'
  ];

  techKeywords.forEach(tech => {
    if (lower.includes(tech.toLowerCase()) && !memory.techStack.includes(tech)) {
      memory.techStack.push(tech);
    }
  });

  // 5. Dynamic Title & Industry Extraction (Only set if projectTitle is not already established)
  if (!memory.projectTitle) {
    if (lower.includes('wordpress') || lower.includes('elementor')) {
      memory.projectTitle = 'WordPress Custom Website';
      memory.industry = 'CMS & Business Web';
      if (!memory.techStack.includes('WordPress')) memory.techStack.push('WordPress', 'PHP', 'MySQL', 'Elementor');
    } else if (lower.includes('netflix') || lower.includes('hotstar') || lower.includes('hulu') || lower.includes('ott') || lower.includes('movie') || lower.includes('stream') || lower.includes('upload movie') || lower.includes('cinema') || lower.includes('video')) {
      memory.projectTitle = 'Video Streaming & Movie OTT Platform';
      memory.industry = 'Media & Entertainment / OTT';
      if (!memory.techStack.includes('Node.js')) memory.techStack.push('React', 'Node.js', 'AWS S3', 'CloudFront', 'FFmpeg', 'HLS');
    } else if (lower.includes('face swap') || lower.includes('face-swap') || lower.includes('deepfake') || lower.includes('voice clone')) {
      memory.projectTitle = 'AI Video Synthesis & Face-Swap Engine';
      memory.industry = 'Generative AI';
      if (!memory.techStack.includes('Python')) memory.techStack.push('Python', 'FastAPI', 'PyTorch', 'FFmpeg', 'ElevenLabs API');
    } else if (lower.includes('pet') || lower.includes('pets') || lower.includes('animal')) {
      memory.projectTitle = 'Pet E-Commerce Platform';
      memory.industry = 'Retail & E-Commerce';
    } else if (lower.includes('e-commerce') || lower.includes('ecommerce') || lower.includes('ecomm') || lower.includes('store') || lower.includes('shopping') || lower.includes('bakery') || lower.includes('shop') || lower.includes('sell')) {
      memory.projectTitle = 'E-Commerce Platform & Online Store';
      memory.industry = 'Retail & E-Commerce';
    } else if (lower.includes('fintech') || lower.includes('payment') || lower.includes('banking') || lower.includes('wallet') || lower.includes('fraud')) {
      memory.projectTitle = 'FinTech Payment Gateway Platform';
      memory.industry = 'FinTech & Payments';
    } else if (lower.includes('telehealth') || lower.includes('health') || lower.includes('medical') || lower.includes('hipaa') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('dental')) {
      memory.projectTitle = lower.includes('dental') ? 'Dental Clinic Website' : 'HIPAA Compliant Telehealth Portal';
      memory.industry = 'Healthcare & Medical';
    } else if (lower.includes('resume') || lower.includes('screening') || lower.includes('parsing') || lower.includes('hiring')) {
      memory.projectTitle = 'AI Resume Screening & Hiring Parser';
      memory.industry = 'HR Tech & Recruitment';
    } else if (text.trim().length > 10 && !lower.includes('remember') && !lower.includes('how much') && !lower.includes('for less') && !lower.includes('giving me')) {
      const stopWords = new Set(['need', 'want', 'please', 'generate', 'create', 'build', 'for', 'this', 'app', 'with', 'my', 'budget', 'is', 'low', 'suggest', 'nvp', 'time', 'should', 'months', 'weeks', 'developers', 'people', 'team', 'less', 'giving', 'more', 'they', 'them', 'that']);
      const cleanWords = text.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w.toLowerCase())).slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (cleanWords.length > 3) {
        memory.projectTitle = `${cleanWords} Platform`;
      }
    }
  }

  return memory;
}

// Intent Classification Node
export function classifyIntent(text, memory) {
  const lower = text.trim().toLowerCase();

  // Casual Greetings / Small Talk
  if (/^(hi+|hy+|hello+|hey+|good\s*(morning|afternoon|evening)|greetings|yo|sup)(\s|!|\.|$)/i.test(lower)) {
    return 'GREETING';
  }

  // Memory Recall ("what do you know about me?", "what did I say?", "do you remember my name?")
  if (lower.includes('remember') || lower.includes('what did i') || lower.includes('what is my name') || lower.includes('my stack') || lower.includes('my project')) {
    return 'MEMORY_RECALL';
  }

  // SOW Proposal Generation Intent — only if user EXPLICITLY says "generate SOW / proposal"
  if ((lower.includes('generate') && (lower.includes('sow') || lower.includes('proposal'))) || 
      (lower.includes('create') && lower.includes('proposal')) ||
      (lower.includes('draft') && lower.includes('sow')) ||
      lower === 'sow' || lower === 'generate sow' || lower === 'generate proposal') {
    return 'PROPOSAL_GENERATION';
  }

  // Explicit Cost/Budget/Timeline Queries (handles typos like budegt, dolar, dollar)
  if (lower.includes('cost') || lower.includes('price') || lower.includes('budget') || lower.includes('budegt') || lower.includes('rate') || lower.includes('how much') || lower.includes('quote') || lower.includes('estimate') || lower.includes('dolar') || lower.includes('dollar') || lower.includes('cheap') || lower.includes('less') || lower.includes('affordable') || lower.includes('low') || memory.isLowBudget || memory.explicitTotalBudget) {
    return 'COST_ESTIMATION';
  }

  // Explicit Timeline Queries
  if (lower.includes('timeline') || lower.includes('duration') || lower.includes('how long') || lower.includes('time for this') || lower.includes('deadline') || lower.includes('delivery')) {
    return 'COST_ESTIMATION';
  }

  // Bench Developers / Candidates Queries
  if (lower.includes('bench') || lower.includes('developer') || lower.includes('engineer') || lower.includes('who is available') || lower.includes('match developer')) {
    return 'BENCH_MATCHING';
  }

  // Technical Architecture Queries
  if (lower.includes('architecture') || lower.includes('cloud') || lower.includes('database') || lower.includes('stack') || lower.includes('infrastructure')) {
    return 'ARCHITECTURE';
  }

  // If features were already suggested and user is responding with confirmations/selections
  if (memory.conversationPhase === 'features_suggested') {
    // User is confirming features, selecting, or saying "yes", "all", "these are fine", listing features etc.
    return 'FEATURE_CONFIRMATION';
  }

  // Project Discovery — user describing a project idea (not an explicit cost/proposal command)
  const projectKeywords = ['want', 'need', 'build', 'create', 'make', 'looking for', 'website', 'app', 'application', 'platform', 'portal', 'system', 'software', 'clinic', 'store', 'shop', 'marketplace', 'saas', 'tool', 'dashboard', 'management', 'booking', 'appointment', 'e-commerce', 'ecommerce', 'crm', 'erp', 'social', 'streaming', 'game', 'mobile', 'startup', 'project'];
  const hasProjectIntent = projectKeywords.some(kw => lower.includes(kw));
  if (hasProjectIntent && lower.length > 8) {
    return 'PROJECT_DISCOVERY';
  }

  return 'GENERAL_CONVERSATION';
}

// Generates complete Markdown SOW Proposal using AI (Gemini LLM)
export async function generateFullSowProposal(memory, userInput = '', apiKey = null) {
  const cleanTitle = (userInput || '').replace(/generate|sow|proposal|draft|for|create/gi, '').trim();
  const projTitle = memory.projectTitle || (cleanTitle.length > 3 ? cleanTitle : 'Enterprise Software Platform');
  const stack = memory.techStack && memory.techStack.length > 0 ? memory.techStack : ['React', 'Node.js', 'PostgreSQL', 'AWS'];
  const devCount = memory.devCount || 4;
  const duration = memory.durationWeeks || 10;
  const propId = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;
  const clientName = memory.userName ? `${memory.userName} (Enterprise)` : "Enterprise Client";
  const industry = memory.industry || "Software & SaaS";

  // Use person-hours model for accurate costing
  const totalHrs = memory.totalProjectHours || estimateTotalProjectHours(memory.complexityScore || 5);
  const benchDevs = matchBenchDevelopers(stack, devCount);
  const roleNames = benchDevs.map(d => d.role);
  const hoursPerRole = allocateHoursByRole(totalHrs, roleNames);
  const devBreakdownForSow = benchDevs.map((d, i) => ({
    ...d,
    hours: hoursPerRole[i],
    cost: Math.round(d.hourlyRate * hoursPerRole[i])
  }));
  const devCost = devBreakdownForSow.reduce((sum, d) => sum + d.cost, 0);

  // Try AI-powered generation via Gemini
  const effectiveKey = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';
  let aiGeneratedSow = null;

  if (effectiveKey && effectiveKey.length > 10) {
    try {
      const devListContext = benchDevs.map(d => `${d.name} (${d.role}, $${d.hourlyRate}/hr, ${d.experienceYears}yrs exp)`).join(', ');

      const sowPrompt = `You are an expert Enterprise Technology Consultant generating a professional Scope of Work (SOW) Proposal.

PROJECT CONTEXT FROM DISCOVERY CONVERSATION:
- Project Name: ${projTitle}
- Client: ${clientName}
- Industry: ${industry}
- User's Mentioned Requirements: ${cleanTitle || userInput || 'General enterprise software platform'}
- Preferred Tech Stack: ${stack.join(', ')}
- Team Size: ${devCount} developers
- Total Project Effort: ${totalHrs} person-hours (FIXED regardless of team size)
- Calendar Timeline: ${duration} weeks delivery
- Available Engineers: ${devListContext}
- Extracted Requirements: ${memory.extractedRequirements?.join(', ') || 'To be detailed in proposal'}

CRITICAL PRICING MODEL: Use person-hours based costing.
Total effort = ${totalHrs} person-hours. Each developer is allocated hours based on their ROLE (not full weeks × 40hrs each).
Role-based hour allocation:
${devBreakdownForSow.map(d => `- ${d.name} (${d.role}): ${d.hours} hrs × $${d.hourlyRate}/hr = $${d.cost.toLocaleString()}`).join('\n')}
Total Engineering Cost: $${devCost.toLocaleString()}

GENERATE a complete, professional SOW proposal in clean GitHub Markdown format with these EXACT sections:

## 📄 Scope of Work (SOW) Proposal
**Proposal ID**: \`${propId}\` | **Client**: ${clientName} | **Industry**: ${industry}

---

### 🎯 1. Executive Summary
Write 3-4 sentences summarizing the project vision, business value, and key outcomes. Be specific to the project type and industry.

---

### 🛠️ 2. Core Scope of Work & Deliverables
List 5-7 specific deliverables tailored to this project (not generic). Each should be a concrete work item.

---

### 🏗️ 3. Recommended Technical Stack
Recommend specific technologies organized by tier (Frontend, Backend, Database, Cloud/DevOps, Security). Use the preferred stack but add your expert recommendations.

---

### 👥 4. Dedicated Engineering Team Structure
List the allocated team members with their role-specific hours and costs exactly as provided above. Do NOT change the numbers.

---

### 💰 5. Financial Investment & Cost Breakdown
Use EXACTLY these numbers:
- Total Project Effort: ${totalHrs} person-hours
- Engineering Cost (role-based allocation): $${devCost.toLocaleString()}
- Cloud Infrastructure: $3,500
- 10% Contingency: $${Math.round(devCost * 0.10).toLocaleString()}
- Grand Total: $${(devCost + 3500 + Math.round(devCost * 0.10)).toLocaleString()} USD

---

### 📅 6. Project Roadmap & Delivery Timeline
Create a detailed sprint-by-sprint plan for ${duration} weeks. Break it into phases (Discovery, Development, Testing, Deployment). Be specific about what happens in each phase.

---

### 🔐 7. Risk Mitigation & Quality Assurance
List 3-4 risk factors and mitigation strategies specific to this project type and industry.

IMPORTANT RULES:
- Be specific and contextual to the project type — do NOT be generic
- Use the EXACT cost numbers provided above — do NOT recalculate
- Format everything in clean GitHub Markdown
- Do NOT add any preamble or explanation outside the SOW format
- Only output the SOW document, nothing else`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: sowPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.length > 100) {
          aiGeneratedSow = text;
        }
      }
    } catch (e) {
      console.warn("AI SOW generation failed, using structured fallback:", e);
    }
  }

  // Calculate costs using person-hours model (already computed above)
  const cloudCost = 3500;
  const contingency = Math.round(devCost * 0.10);
  const grandTotal = devCost + cloudCost + contingency;

  const proposalObj = {
    proposalId: propId,
    projectName: projTitle,
    clientName,
    industry,
    techStack: stack,
    assignedDevsCount: devCount,
    durationWeeks: duration,
    estimatedCost: grandTotal,
    status: "Won",
    winProbability: 96,
    executiveSummary: `SOW proposal for ${projTitle} — ${devCount} engineers, ${duration} weeks, ${stack.join(', ')} stack.`,
    teamStructure: benchDevs,
    financials: {
      devCost,
      cloudInfraCost: cloudCost,
      thirdPartyApiCost: 2000,
      contingencyBuffer: contingency,
      grandTotal,
      currency: "USD"
    }
  };

  // Use AI-generated SOW if available, otherwise structured fallback
  const devListMarkdown = devBreakdownForSow.map(d => `- **${d.name}** (${d.role}) — $${d.hourlyRate}/hr × ${d.hours} hrs = **$${d.cost.toLocaleString()}** [${d.empCode}]`).join('\n');

  const fallbackSow = `## 📄 Scope of Work (SOW) Proposal
**Proposal ID**: \`${propId}\` | **Client**: ${clientName} | **Industry**: ${industry}

---

### 🎯 1. Executive Summary
This Scope of Work proposal outlines the comprehensive technical strategy, architectural blueprint, dedicated engineering team, and financial breakdown for **${projTitle}**. Designed to deliver enterprise-grade performance, high reliability, and seamless scalability for the ${industry} sector.

---

### 🛠️ 2. Core Scope of Work & Deliverables
- **Architecture & System Design**: Scalable microservices topology tailored for **${projTitle}**
- **Backend & API Gateway**: High-throughput REST & GraphQL microservices with JWT/OAuth2 authentication
- **Frontend & UI/UX**: Responsive web application with real-time UI components
- **Cloud Infrastructure**: Automated CI/CD deployment pipeline on **${stack.find(s => ['AWS', 'GCP', 'Azure'].includes(s)) || 'AWS Cloud'}**
- **Security & Quality Assurance**: Automated testing, security audit logging, and compliance checks

---

### 🏗️ 3. Recommended Technical Stack
- **Frontend**: ${stack.filter(s => ['React', 'Next.js', 'Vue', 'Angular', 'Flutter', 'TypeScript'].includes(s)).join(', ') || 'React 18 + Next.js (TypeScript)'}
- **Backend**: ${stack.filter(s => ['Node.js', 'Python', 'Java', 'Go'].includes(s)).join(', ') || 'Node.js Express / Python FastAPI'}
- **Database**: ${stack.filter(s => ['PostgreSQL', 'MongoDB', 'Redis'].includes(s)).join(', ') || 'PostgreSQL + Redis'}
- **Cloud & DevOps**: ${stack.filter(s => ['AWS', 'Docker', 'Kubernetes'].includes(s)).join(', ') || 'AWS (ECS Fargate, S3 & RDS)'}

---

### 👥 4. Dedicated Engineering Team (Role-Based Hour Allocation)
> 💡 *Total project effort: **${totalHrs} person-hours**. Each developer works their specific module — not the full project duration. This is why costs remain consistent regardless of team size.*

${devListMarkdown}

---

### 💰 5. Financial Investment & Cost Breakdown
- **Engineering Cost (${totalHrs} person-hours, role-allocated)**: **$${devCost.toLocaleString()}**
- **Cloud Infrastructure Setup**: **$${cloudCost.toLocaleString()}**
- **10% Risk & Contingency Buffer**: **$${contingency.toLocaleString()}**
- **Total Estimated Investment**: **$${grandTotal.toLocaleString()} USD**

---

### 📅 6. Project Roadmap & Delivery Timeline
- **Target Delivery**: **${duration} Weeks** (${Math.ceil(duration / 4)} Month${Math.ceil(duration / 4) > 1 ? 's' : ''})
- **Sprint 1-2**: Technical Spec, DB Architecture & CI/CD Pipeline
- **Sprint 3-${Math.round(duration * 0.6)}**: Backend APIs, Microservices & Core Frontend Development
- **Sprint ${Math.round(duration * 0.6) + 1}-${duration}**: System Integration, Security Audit, UAT & Cloud Deployment`;

  return {
    markdown: aiGeneratedSow || fallbackSow,
    proposalData: proposalObj
  };
}


// Helper to calculate realistic 2026 market-based cloud & third-party API infrastructure costs
export function calculateRealisticInfrastructureCosts(promptText = '', projectTitle = '', industry = '') {
  const text = (promptText + ' ' + projectTitle + ' ' + industry).toLowerCase();

  let cloudInfraCost = 1800;
  let thirdPartyApiCost = 800;
  let cloudInfraDescription = "AWS Cloud (ECS Fargate, RDS PostgreSQL Multi-AZ, Redis & CloudFront CDN)";
  let thirdPartyApiDescription = "Essential APIs (Stripe, SendGrid, Auth0 & Sentry Telemetry)";

  if (text.includes("movie") || text.includes("video") || text.includes("face") || text.includes("voice") || text.includes("comedy") || text.includes("laugh") || text.includes("deepfake") || text.includes("generative")) {
    cloudInfraCost = 4500;
    thirdPartyApiCost = 2800;
    cloudInfraDescription = "AWS GPU Compute Cluster (g5.xlarge), S3 Video Storage & CloudFront Global CDN";
    thirdPartyApiDescription = "Google Gemini 1.5 Pro / OpenAI GPT-4o, ElevenLabs Audio & Pinecone Vector DB";
  } else if (text.includes("wordpress") || text.includes("elementor") || text.includes("cms") || text.includes("cheap") || text.includes("low budget")) {
    cloudInfraCost = 250;
    thirdPartyApiCost = 150;
    cloudInfraDescription = "Cloudflare Edge CDN, High-Performance WP Managed Hosting, SSL & Domain";
    thirdPartyApiDescription = "Elementor Pro, WooCommerce Extensions & Anti-Spam API";
  } else if (text.includes("telehealth") || text.includes("health") || text.includes("doctor") || text.includes("patient") || text.includes("hipaa")) {
    cloudInfraCost = 3500;
    thirdPartyApiCost = 1800;
    cloudInfraDescription = "HIPAA-Compliant AWS Vault, RDS Encrypted Multi-AZ & Encrypted Audit Logging";
    thirdPartyApiDescription = "WebRTC Video Suite, Twilio SMS Notifications & Encrypted EMR Integration";
  } else if (text.includes("fintech") || text.includes("fraud") || text.includes("payment") || text.includes("bank") || text.includes("wallet")) {
    cloudInfraCost = 3800;
    thirdPartyApiCost = 2200;
    cloudInfraDescription = "PCI-DSS Compliant AWS Microservices Gateway, Multi-Region RDS & Redis Cluster";
    thirdPartyApiDescription = "Stripe Payment Vault, Plaid Banking API & Real-Time Fraud Rules Engine";
  } else if (text.includes("ai") || text.includes("rag") || text.includes("resume") || text.includes("chatbot") || text.includes("screening")) {
    cloudInfraCost = 2800;
    thirdPartyApiCost = 1800;
    cloudInfraDescription = "AWS ECS Microservices, Document Storage S3 & Redis Caching";
    thirdPartyApiDescription = "OpenAI GPT-4o / Gemini Flash, Pinecone Vector Indexing & Document OCR Parser";
  }

  return {
    cloudInfraCost,
    thirdPartyApiCost,
    cloudInfraDescription,
    thirdPartyApiDescription
  };
}

/**
 * Suggests 5-6 relevant features based on the project description.
 * Returns an array of { name, description, estimatedWeeks } objects.
 */
function suggestFeaturesForProject(text, memory) {
  const lower = (text + ' ' + (memory.projectTitle || '')).toLowerCase();
  const features = [];

  // Netflix / Video Streaming / OTT / Movies / Cinema / Upload Movies
  if (lower.includes('netflix') || lower.includes('hotstar') || lower.includes('hulu') || lower.includes('ott') || lower.includes('stream') || lower.includes('upload movie') || lower.includes('movie') || lower.includes('video streaming') || lower.includes('cinema')) {
    features.push(
      { name: 'HD Video Streaming Player (HLS/DASH)', description: 'Adaptive multi-quality video streaming player with subtitle and audio track switching', estimatedWeeks: 3 },
      { name: 'User Movie & Video Upload Portal', description: 'Content upload dashboard with automated cloud video encoding & transcoding pipeline (FFmpeg)', estimatedWeeks: 3 },
      { name: 'Subscription Membership Paywall', description: 'Monthly/annual subscription plans with Stripe & credit card payment integration', estimatedWeeks: 2 },
      { name: 'Movie Catalog with Genre Search & Watchlist', description: 'Filter movies by category, search by title/actor, and add to personal watchlist', estimatedWeeks: 2 },
      { name: 'User Profiles & Continue Watching Sync', description: 'Multi-profile support with playback progress sync and watch history', estimatedWeeks: 2 },
      { name: 'Admin Video Content Moderation & DRM', description: 'Admin control center for managing video assets, DRM encryption, and user access', estimatedWeeks: 2 }
    );
  }
  // Dental / Medical / Clinic
  else if (lower.includes('dental') || lower.includes('clinic') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('medical') || lower.includes('patient') || lower.includes('health')) {
    features.push(
      { name: 'Online Appointment Booking System', description: 'Patients can book, reschedule, and cancel appointments online with real-time availability', estimatedWeeks: 2 },
      { name: 'Patient Portal & Medical Records', description: 'Secure login for patients to view history, prescriptions, and reports', estimatedWeeks: 3 },
      { name: 'Doctor/Staff Dashboard', description: 'Admin panel for managing schedules, patients, and clinic operations', estimatedWeeks: 2 },
      { name: 'Automated Email & SMS Reminders', description: 'Appointment confirmations and reminders via email and SMS', estimatedWeeks: 1 },
      { name: 'Services & Pricing Page', description: 'Display dental/medical services with pricing and descriptions', estimatedWeeks: 1 },
      { name: 'AI Virtual Health Assistant', description: 'Chatbot for answering FAQs, symptom checking, and appointment guidance', estimatedWeeks: 3 }
    );
  }
  // Pet E-Commerce / Animals
  else if (lower.includes('pet') || lower.includes('pets') || lower.includes('animal') || lower.includes('dog') || lower.includes('cat')) {
    features.push(
      { name: 'Pet Product Catalog & Breed Categories', description: 'Browse pet food, toys, and supplies categorized by pet type and breed', estimatedWeeks: 2 },
      { name: 'Shopping Cart & Multi-Payment Checkout', description: 'Add to cart, apply coupons, and secure credit card/PayPal checkout', estimatedWeeks: 2 },
      { name: 'Automated Pet Food Subscription', description: 'Recurring auto-ship orders for pet food and recurring supplies', estimatedWeeks: 2 },
      { name: 'Order Tracking & Live Shipping Updates', description: 'Real-time order status tracking with SMS/email notifications', estimatedWeeks: 2 },
      { name: 'Pet Health Profile & Vet Records Portal', description: 'Customer portal to save pet medical history, weight, and vet contacts', estimatedWeeks: 2 },
      { name: 'Admin Inventory & Supplier Dashboard', description: 'Manage stock, vendors, prices, and sales analytics', estimatedWeeks: 2 }
    );
  }
  // E-commerce / Store / Shop / Ecomm
  else if (lower.includes('e-commerce') || lower.includes('ecommerce') || lower.includes('ecomm') || lower.includes('store') || lower.includes('shop') || lower.includes('marketplace') || lower.includes('bakery') || lower.includes('grocery') || lower.includes('sell') || lower.includes('buy')) {
    features.push(
      { name: 'Product Catalog with Search & Filters', description: 'Browse products with categories, search, and advanced filters', estimatedWeeks: 2 },
      { name: 'Shopping Cart & Checkout', description: 'Add to cart, apply coupons, and secure multi-step checkout', estimatedWeeks: 2 },
      { name: 'Payment Gateway Integration', description: 'Stripe/Razorpay/PayPal payment processing with order confirmation', estimatedWeeks: 2 },
      { name: 'Order Tracking & History', description: 'Real-time order status tracking and purchase history for customers', estimatedWeeks: 2 },
      { name: 'Admin Inventory Dashboard', description: 'Manage products, stock levels, pricing, and analytics', estimatedWeeks: 2 },
      { name: 'Customer Reviews & Ratings', description: 'Product review system with star ratings and verified purchases', estimatedWeeks: 1 }
    );
  }
  // FinTech / Banking / Payments
  else if (lower.includes('fintech') || lower.includes('payment') || lower.includes('bank') || lower.includes('wallet') || lower.includes('fraud') || lower.includes('trading')) {
    features.push(
      { name: 'User Authentication & KYC Verification', description: 'Secure onboarding with identity verification and 2FA', estimatedWeeks: 3 },
      { name: 'Digital Wallet & Balance Management', description: 'Add funds, transfer money, and manage wallet balance', estimatedWeeks: 3 },
      { name: 'Transaction Processing Engine', description: 'Real-time payment processing with multi-currency support', estimatedWeeks: 3 },
      { name: 'Transaction History & Analytics', description: 'Detailed statements, spending insights, and export functionality', estimatedWeeks: 2 },
      { name: 'Fraud Detection System', description: 'AI-powered suspicious activity detection and alerts', estimatedWeeks: 3 },
      { name: 'Admin Compliance Dashboard', description: 'Regulatory compliance monitoring and audit trail management', estimatedWeeks: 2 }
    );
  }
  // AI / ML / Chatbot / Resume
  else if (lower.includes('ai') || lower.includes('chatbot') || lower.includes('resume') || lower.includes('screening') || lower.includes('ml') || lower.includes('hiring')) {
    features.push(
      { name: 'AI-Powered Core Engine', description: 'LLM/ML pipeline for intelligent processing and analysis', estimatedWeeks: 4 },
      { name: 'User Dashboard & Analytics', description: 'Interactive dashboard with insights and result visualization', estimatedWeeks: 2 },
      { name: 'Document Upload & Processing', description: 'Upload files (PDF, DOCX) with AI parsing and data extraction', estimatedWeeks: 2 },
      { name: 'Real-time Chat Interface', description: 'Conversational AI interface with message history', estimatedWeeks: 2 },
      { name: 'API Integration Layer', description: 'RESTful API for third-party integrations and webhooks', estimatedWeeks: 2 },
      { name: 'Admin Panel & User Management', description: 'Role-based access control, usage tracking, and settings', estimatedWeeks: 2 }
    );
  }
  // Education / LMS / Course
  else if (lower.includes('education') || lower.includes('lms') || lower.includes('course') || lower.includes('learning') || lower.includes('school') || lower.includes('university') || lower.includes('tutor')) {
    features.push(
      { name: 'Course Content Management', description: 'Create and organize courses with video, text, and quiz modules', estimatedWeeks: 3 },
      { name: 'Student Dashboard & Progress Tracking', description: 'Track learning progress, grades, and certificates', estimatedWeeks: 2 },
      { name: 'Live Class & Video Integration', description: 'Schedule and conduct live classes with recording support', estimatedWeeks: 3 },
      { name: 'Assignment & Quiz Engine', description: 'Create, submit, and auto-grade assignments and quizzes', estimatedWeeks: 2 },
      { name: 'Discussion Forums', description: 'Course-level discussion boards for student interaction', estimatedWeeks: 1 },
      { name: 'Payment & Subscription Module', description: 'Course purchase, subscription plans, and certificate generation', estimatedWeeks: 2 }
    );
  }
  // Social Media / Community
  else if (lower.includes('social') || lower.includes('community') || lower.includes('forum') || lower.includes('chat') || lower.includes('networking') || lower.includes('dating')) {
    features.push(
      { name: 'User Profiles & Feed', description: 'Create profiles, post updates, and browse a personalized feed', estimatedWeeks: 3 },
      { name: 'Real-time Messaging', description: 'One-to-one and group messaging with media sharing', estimatedWeeks: 3 },
      { name: 'Content Sharing & Media Upload', description: 'Share photos, videos, and stories with privacy controls', estimatedWeeks: 2 },
      { name: 'Notifications System', description: 'Push notifications for likes, comments, follows, and messages', estimatedWeeks: 1 },
      { name: 'Search & Discovery', description: 'Find users, hashtags, and trending content', estimatedWeeks: 2 },
      { name: 'Moderation & Reporting', description: 'Content moderation tools, report system, and admin controls', estimatedWeeks: 2 }
    );
  }
  // Real Estate
  else if (lower.includes('real estate') || lower.includes('property') || lower.includes('rental') || lower.includes('housing') || lower.includes('apartment')) {
    features.push(
      { name: 'Property Listings with Search', description: 'Browse and search properties with map view and filters', estimatedWeeks: 3 },
      { name: 'Virtual Tour & Image Gallery', description: '360° virtual tours and high-quality image galleries', estimatedWeeks: 2 },
      { name: 'Inquiry & Contact System', description: 'Contact agents, schedule viewings, and submit inquiries', estimatedWeeks: 1 },
      { name: 'Agent/Landlord Dashboard', description: 'Manage listings, inquiries, and property analytics', estimatedWeeks: 2 },
      { name: 'Mortgage Calculator', description: 'Interactive EMI/mortgage calculator with comparison tools', estimatedWeeks: 1 },
      { name: 'User Favorites & Alerts', description: 'Save properties and get alerts for new matching listings', estimatedWeeks: 1 }
    );
  }
  // Restaurant / Food
  else if (lower.includes('restaurant') || lower.includes('food') || lower.includes('delivery') || lower.includes('catering') || lower.includes('cafe') || lower.includes('menu')) {
    features.push(
      { name: 'Digital Menu & Ordering', description: 'Browse menu items, customize orders, and add to cart', estimatedWeeks: 2 },
      { name: 'Online Ordering & Delivery Tracking', description: 'Place orders for delivery/pickup with real-time tracking', estimatedWeeks: 3 },
      { name: 'Table Reservation System', description: 'Book tables online with date, time, and party size selection', estimatedWeeks: 1 },
      { name: 'Payment Integration', description: 'Online payment with multiple gateway support and invoicing', estimatedWeeks: 2 },
      { name: 'Restaurant Admin Panel', description: 'Manage menu, orders, staff, and view sales analytics', estimatedWeeks: 2 },
      { name: 'Customer Reviews & Loyalty Program', description: 'Review system with loyalty points and referral rewards', estimatedWeeks: 1 }
    );
  }
  // Generic / Fallback - software project
  else {
    features.push(
      { name: 'User Authentication & Profiles', description: 'Secure sign-up, login, and user profile management', estimatedWeeks: 2 },
      { name: 'Core Dashboard & Analytics', description: 'Main application dashboard with key metrics and insights', estimatedWeeks: 2 },
      { name: 'Data Management Module', description: 'CRUD operations with search, filters, and export capabilities', estimatedWeeks: 2 },
      { name: 'Notifications & Alerts', description: 'Email and in-app notifications for important events', estimatedWeeks: 1 },
      { name: 'Admin Panel & Settings', description: 'Role-based admin controls, configuration, and user management', estimatedWeeks: 2 },
      { name: 'API & Third-Party Integrations', description: 'REST API layer and integration with external services', estimatedWeeks: 2 }
    );
  }

  return features;
}

/**
 * Executes a full LangGraph turn:
 * Input -> Intent Classifier Node -> Memory Extractor Node -> RAG Retrieval Node -> Response Generator Node
 */
export async function processLangGraphTurn({ userInput, history = [], currentMemory = null, apiKey = null, provider = 'openai' }) {
  const memory = extractMemoryEntities(userInput, currentMemory || createInitialGraphState().contextMemory);
  const intent = classifyIntent(userInput, memory);

  // 1. Try Google Gemini API dynamically with full Presales Session Context Memory
  const effectiveGeminiKey = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';

  if (effectiveGeminiKey && effectiveGeminiKey.length > 5) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey.trim()}`;

      const historyFormatted = history.slice(-6).map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
      
      const featuresContext = (memory.suggestedFeatures || []).map((f, i) => `${i + 1}. ${f.name} (~${f.estimatedWeeks} wks): ${f.description}`).join('\n');
      const selectedReqs = (memory.extractedRequirements || []).join(', ');
      const availableDevs = matchBenchDevelopers(memory.techStack || ['React', 'Node.js'], 5).map(d => `- **${d.name}** (${d.role}) @ $${d.hourlyRate}/hr [${d.empCode}] — Skills: ${d.skills.slice(0, 4).join(', ')}`).join('\n');

      const systemPrompt = `You are ProposalAI Assistant, an expert enterprise presales consultant powered by Google Gemini API.

YOUR CORE MANDATE:
Dynamically estimate project costs using real-world Google Cloud / AWS / Vercel cloud infrastructure pricing knowledge and third-party API market rates. Do NOT use static hardcoded values. Match the best developers from our available bench.

CRITICAL PRICING MODEL — READ CAREFULLY:
The total effort for any software project is FIXED in person-hours, regardless of team size.
- Adding more developers compresses the TIMELINE (fewer calendar weeks), it does NOT multiply total cost.
- Each developer works on their OWN module/role, NOT the full project duration.
- Formula: Total Engineering Cost = Σ (each dev's hours × their rate), where each dev's hours = their role's share of total effort.
- NEVER do: devCount × durationWeeks × 40 × rate — this is WRONG and produces absurd inflation.
- CORRECT: Backend dev does backend work (~20% of total hrs), Frontend dev does frontend (~15%), DevOps does infra (~10%), etc.

TOTAL PROJECT EFFORT FOR THIS PROJECT: ~${memory.totalProjectHours || 450} person-hours (fixed)
- If user says "3 developers, 1 week": calendar = 1 week, effort = ~${memory.totalProjectHours || 450} hrs split by role across 3 devs
- If user says "6 developers, 7 weeks": calendar = 7 weeks, effort = ~${memory.totalProjectHours || 450} hrs split by role across 6 devs
- Engineering cost will be ROUGHLY SIMILAR in both cases (small variance from different rate mixes)

CURRENT PROJECT SESSION MEMORY:
- Client Name: ${memory.userName || 'Client'}
- Project Title: ${memory.projectTitle || 'Custom Application'}
- Industry: ${memory.industry || 'Software & SaaS'}
- Tech Stack: ${memory.techStack?.join(', ') || 'React, Node.js, AWS'}
- Current Active Features List:
${featuresContext || 'None suggested yet'}
- Features Selected by Client: ${selectedReqs || 'All features'}

⚠️ USER EXPLICIT CONSTRAINTS (MUST RESPECT — do NOT override these):
- Developer Count: ${memory.devCountExplicit ? `EXACTLY ${memory.devCount} developer(s) as explicitly requested by user` : 'auto-determine based on complexity'}
- Duration: ${memory.durationExplicit ? `EXACTLY ${memory.durationWeeks} week(s) as explicitly requested by user` : 'auto-determine from total effort ÷ team size'}

OUR AVAILABLE BENCH DEVELOPERS (Use ONLY these developers with their exact rates & names):
${availableDevs}

DYNAMIC CALCULATION INSTRUCTIONS:
1. **Total Effort**: The project requires ~${memory.totalProjectHours || 450} person-hours total. This is FIXED.
2. **Developer Team Allocation**: Pick the exact number of devs specified (or suggest 2-4 if unspecified). Assign each dev ONLY their role-specific portion of the total hours (e.g. Full Stack = 25%, Backend = 20%, Frontend = 15%, DevOps = 10%, AI/ML = 20%). Show: Name, Role, Rate/hr, Hours, Subtotal.
3. **Cloud & API Cost Estimation**: Analyze the project domain. Estimate cloud infrastructure and third-party API costs with specific provider names.
4. **Contingency Buffer**: Add a 10% risk & contingency buffer on engineering cost only.
5. **Markdown Formatting**: Present a clean, transparent breakdown with these exact sections:
   - ### 📋 Project Scope & Features Summary
   - ### 👥 Allocated Bench Engineering Team (Name, Role, Rate/hr, Role-Hours, Subtotal — each dev works their module only)
   - ### 💰 Itemized Investment Breakdown (Engineering Cost, Cloud Infrastructure, Third-Party APIs, 10% Contingency, Estimated Total)
   - Include 2 sentences of architectural recommendation.
   - End with: "Click **Generate SOW Proposal Now** below to create your complete proposal document."
6. Be conversational, intelligent, and accurate. NEVER multiply all devs × full weeks × 40hrs. NEVER mistake feature numbers for dollar amounts.`;

      const promptPayload = {
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nRECENT CHAT HISTORY:\n${historyFormatted}\n\nUser Input: ${userInput}` }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptPayload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.length > 15) {
          const lowerText = userInput.toLowerCase();
          const action = (lowerText.includes('sow') || lowerText.includes('proposal')) 
            ? 'proposal' 
            : (lowerText.includes('cost') || lowerText.includes('price') || lowerText.includes('estimate') || lowerText.includes('all') || lowerText.includes('remove') || lowerText.includes('skip') || lowerText.includes('budget') || memory.conversationPhase === 'cost_shown') 
            ? 'cost' 
            : 'chat';

          return {
            response: text,
            memory,
            intent,
            devMatches: matchBenchDevelopers(memory.techStack || ['React', 'Node.js'], 4),
            proposalData: null,
            actionType: action
          };
        }
      }
    } catch (e) {
      console.warn("Live Gemini API execution exception in processLangGraphTurn:", e);
    }
  }

  // Local LangGraph Stateful Response Synthesis Node
  let responseText = '';
  let devMatches = null;
  let actionType = intent.toLowerCase();
  let proposalData = null;

  const namePrefix = memory.userName ? `${memory.userName}, ` : '';

  switch (intent) {
    case 'GREETING': {
      if (memory.userName) {
        responseText = `Hello ${memory.userName}! Welcome back. How can I assist you with your project proposals or developer team allocation today?`;
      } else {
        responseText = `How can I help you with your project requirements today?\n\n- 💬 **Analyze software requirements in natural English**\n- 👨‍💻 **Match pre-vetted bench developers for immediate allocation**\n- 💰 **Calculate transparent cost & timeline breakups**\n- 📄 **Generate complete client SOW proposals**`;
      }
      break;
    }

    case 'MEMORY_RECALL': {
      const memoryFacts = [];
      if (memory.userName) memoryFacts.push(`- **Name**: ${memory.userName}`);
      if (memory.projectTitle) memoryFacts.push(`- **Target Project**: ${memory.projectTitle}`);
      if (memory.techStack.length > 0) memoryFacts.push(`- **Preferred Tech Stack**: ${memory.techStack.join(', ')}`);
      if (memory.devCount) memoryFacts.push(`- **Requested Dev Team**: ${memory.devCount} Engineers`);
      if (memory.durationWeeks) memoryFacts.push(`- **Target Timeline**: ${memory.durationWeeks} Weeks`);

      if (memoryFacts.length > 0) {
        responseText = `Here is everything I remember from our conversation so far, ${namePrefix}:\n\n` + 
          memoryFacts.join('\n') + 
          `\n\nWould you like me to match bench developers or generate a complete SOW proposal with these details?`;
      } else {
        responseText = `I'm currently remembering our active session context! Tell me a bit about your project brief or required tech stack (e.g. *"I need a React and Node app with 5 developers"*), and I'll track your requirements.`;
      }
      break;
    }

    case 'BENCH_MATCHING':
    case 'COST_ESTIMATION': {
      const lowerInputStr = userInput.toLowerCase();

      // Conversational cost feedback check (e.g., "for less you are giving me more", "why so high", "explain cost")
      if (memory.conversationPhase === 'cost_shown' && (lowerInputStr.includes('more') || lowerInputStr.includes('giving me') || lowerInputStr.includes('why') || lowerInputStr.includes('expensive') || lowerInputStr.includes('reduce') || lowerInputStr.includes('cheaper'))) {
        const projName = memory.projectTitle || 'Pet E-Commerce Platform';
        const currentDevCount = memory.devCount || 4;
        const currentWeeks = memory.durationWeeks || 12;

        responseText = `I completely understand your point${namePrefix}! 💡\n\n` +
          `The current estimate for **${projName}** reflects **${currentDevCount} senior developers** working full-time over **${currentWeeks} weeks** to build all selected features.\n\n` +
          `If you'd like to **lower the total cost**, here are 3 ways we can optimize it:\n` +
          `1. 📉 **Reduce Dev Team Size**: Deploy 1-2 developers instead of ${currentDevCount} (reduces cost by up to 50%)\n` +
          `2. 🎯 **Lean MVP Scope**: Include only top 2-3 core features (e.g. Product Catalog & Checkout)\n` +
          `3. 🛠️ **Use Open-Source Templates**: Use pre-built e-commerce frameworks starting at **$35/hr**\n\n` +
          `Would you like me to recalculate a **lean MVP budget** with 1 developer? Or say **"generate SOW"** to proceed with the proposal.`;
        actionType = 'cost';
        break;
      }

      const isLow = memory.isLowBudget || (memory.projectTitle && memory.projectTitle.includes('WordPress'));
      const explicitTotal = memory.explicitTotalBudget;
      const explicitHourly = memory.explicitHourlyBudget;

      const minDevRate = 35; // Lowest bench rate ($35/hr)
      const minDevHours = 40; // 1 week minimum
      const minProjectCost = minDevRate * minDevHours; // $1,400

      // Scenario 1: Explicit Hourly Rate specified is too low (< $35/hr)
      if (explicitHourly && explicitHourly < minDevRate) {
        const lowestDevs = matchBenchDevelopers(memory.techStack, 3, true);
        responseText = `⚠️ **Budget Alert: Target Hourly Rate is Below Minimum Bench Rate**\n\n` +
          `Your requested rate of **$${explicitHourly}/hr** is below our minimum bench engineering rate.\n\n` +
          `### 👥 Lowest-Cost Available Developers on Bench:\n` +
          lowestDevs.map(d => `- **${d.name}** (${d.role}) — ${d.experienceYears} Yrs Exp @ **$${d.hourlyRate}/hr** (${d.matchPercentage}% Match)`).join('\n') +
          `\n\n💡 **Consultant Advice**: Our lowest available developer rate on bench starts at **$${lowestDevs[0]?.hourlyRate || minDevRate}/hr**. Would you like to allocate **${lowestDevs[0]?.name || 'a developer'}** for a lean milestone sprint?`;
        actionType = 'devs';
        devMatches = lowestDevs;
        break;
      }

      // Scenario 2: Explicit Total Budget specified is too low (< $1,400)
      if (explicitTotal && explicitTotal < minProjectCost) {
        const lowestDevs = matchBenchDevelopers(memory.techStack, 2, true);
        responseText = `⚠️ **Budget Alert: Budget is Too Low for Custom Software Engineering**\n\n` +
          `Your specified budget of **$${explicitTotal.toLocaleString()} USD** is unfortunately too low for dedicated custom development.\n\n` +
          `### 📊 Engineering Cost Benchmarks:\n` +
          `- **Lowest Available Developer Bench Rate**: **$${minDevRate}/hr** (${lowestDevs[0]?.name || 'Web Engineer'})\n` +
          `- **Minimum 1-Week Engagement**: **$${minProjectCost.toLocaleString()} USD** (40 hrs @ $${minDevRate}/hr)\n` +
          `- **Your Specified Budget**: **$${explicitTotal.toLocaleString()} USD** (Deficit of $${(minProjectCost - explicitTotal).toLocaleString()})\n\n` +
          `💡 **Consultant Recommendation**:\n` +
          `1. 📈 **Increase Budget**: Raise allocation to at least **$1,400 - $3,000** to deploy our lowest-rate developer for a fast MVP.\n` +
          `2. 🛠️ **No-Code / Template Option**: Consider using no-code tools (Bubble / Webflow) or open-source templates to validate your concept first.`;
        actionType = 'cost';
        devMatches = lowestDevs;
        break;
      }



      // Scenario 3: Normal cost estimation using PERSON-HOURS based model
      // KEY INSIGHT: Total project effort (person-hours) is FIXED by project complexity.
      // Adding more developers just compresses the calendar timeline — it does NOT
      // increase total cost linearly. Cost ≈ totalProjectHours × avgRate (constant).
      const targetStack = memory.techStack.length > 0 ? memory.techStack : (isLow ? ['WordPress', 'PHP', 'React'] : ['React', 'Node.js', 'AWS']);
      
      // Get or compute totalProjectHours (fixed effort)
      const totalHrs = memory.totalProjectHours || estimateTotalProjectHours(memory.complexityScore || 5);
      memory.totalProjectHours = totalHrs;

      // Resolve devCount and duration from each other when only one is specified
      let devCount, weeks;
      if (memory.devCountExplicit && memory.durationExplicit) {
        // Both explicit: respect user fully
        devCount = memory.devCount;
        weeks = memory.durationWeeks;
      } else if (memory.devCountExplicit) {
        // User gave devCount → derive calendar weeks
        devCount = memory.devCount;
        weeks = computeCalendarWeeks(totalHrs, devCount);
        memory.durationWeeks = weeks;
      } else if (memory.durationExplicit) {
        // User gave duration → derive devCount
        weeks = memory.durationWeeks;
        devCount = computeDevCount(totalHrs, weeks);
        memory.devCount = devCount;
      } else {
        // Neither specified: use smart defaults
        devCount = isLow ? 1 : Math.max(2, Math.min(5, Math.round(memory.complexityScore * 0.5)));
        weeks = computeCalendarWeeks(totalHrs, devCount);
        memory.devCount = devCount;
        memory.durationWeeks = weeks;
      }

      const numToFetch = Math.max(devCount, 3);
      devMatches = matchBenchDevelopers(targetStack, numToFetch, isLow);
      const allocatedDevs = devMatches.slice(0, devCount);

      // Allocate hours per developer by ROLE (not naively weeks×40 per dev)
      // Each dev works on their specific module, not the full project duration
      const roleNames = allocatedDevs.map(d => d.role);
      const hoursPerRole = allocateHoursByRole(totalHrs, roleNames);

      const devBreakdown = allocatedDevs.map((d, i) => {
        const hrs = hoursPerRole[i];
        const cost = Math.round(d.hourlyRate * hrs);
        return {
          name: d.name,
          role: d.role,
          empCode: d.empCode,
          hourlyRate: d.hourlyRate,
          hours: hrs,
          cost
        };
      });

      const totalEngineeringCost = devBreakdown.reduce((sum, item) => sum + item.cost, 0);
      const { cloudInfraCost, thirdPartyApiCost, cloudInfraDescription, thirdPartyApiDescription } = calculateRealisticInfrastructureCosts(userInput, memory.projectTitle, memory.industry);
      const contingency = Math.round(totalEngineeringCost * 0.10);
      const grandTotal = totalEngineeringCost + cloudInfraCost + thirdPartyApiCost + contingency;
      const projName = memory.projectTitle || 'Custom Application';

      const lowBudgetCallout = isLow
        ? `\n\n💡 **Low-Budget Optimized Selection**: Matched our lowest-cost available bench developers starting at **$${devMatches[0]?.hourlyRate || 35}/hr**.`
        : '';

      responseText = `Here is the realistic cost & developer allocation breakdown for **${projName}**, ${namePrefix}\n\n` +
        `> 💡 *Total project effort: **~${totalHrs} person-hours** of work. Team size affects delivery speed, not total effort — so cost stays consistent regardless of how many developers you use.*\n\n` +
        `### 👥 Allocated Bench Engineering Team (${weeks} Week${weeks !== 1 ? 's' : ''} delivery / Each dev works their module):` + `\n` +
        devBreakdown.map(d => `- **${d.name}** (${d.role}) — $${d.hourlyRate}/hr × ${d.hours} hrs = **$${d.cost.toLocaleString()}**`).join('\n') + `\n\n` +
        `### 💰 Itemized Financial & Delivery Investment Summary:\n` +
        `- **Direct Engineering Allocation**: **$${totalEngineeringCost.toLocaleString()}** (${totalHrs} total person-hours across ${allocatedDevs.length} developer${allocatedDevs.length > 1 ? 's' : ''})\n` +
        `- **Cloud Infrastructure Setup (${cloudInfraDescription})**: **$${cloudInfraCost.toLocaleString()}**\n` +
        `- **Third-Party APIs & AI Services (${thirdPartyApiDescription})**: **$${thirdPartyApiCost.toLocaleString()}**\n` +
        `- **10% Risk & Contingency Buffer**: **$${contingency.toLocaleString()}**\n` +
        `- **Estimated Total Investment**: **$${grandTotal.toLocaleString()} USD**` +
        lowBudgetCallout;
      actionType = intent === 'BENCH_MATCHING' ? 'devs' : 'cost';
      break;
    }

    case 'ARCHITECTURE': {
      const lower = userInput.toLowerCase();
      const projName = memory.projectTitle || 'Your Custom Application';
      
      let layer1_frontend = "React 18 + Next.js (TypeScript & Tailwind CSS)";
      let layer2_backend = "Node.js Express / Python FastAPI Microservices Gateway";
      let layer3_aiSpecialty = "REST/GraphQL API Layer & Third-Party Service Connectors";
      let layer4_data = "PostgreSQL Primary (Multi-AZ RDS) + Redis Distributed Caching";
      let layer5_infra = "AWS Cloud (ECS Fargate, S3 Media Storage & CloudFront CDN)";

      if (lower.includes("comedy") || lower.includes("stand-up") || lower.includes("standup") || lower.includes("movie") || lower.includes("face") || lower.includes("video") || lower.includes("voice") || lower.includes("laugh") || lower.includes("youtube")) {
        layer1_frontend = "Next.js Web Portal & Mobile Studio UI (Script Editor, Audio/Laugh Track Mixer)";
        layer2_backend = "Python FastAPI High-Performance Microservices Server";
        layer3_aiSpecialty = "PyTorch Deep Learning Pipeline + OpenAI GPT-4o Script Generator + ElevenLabs Audio Synthesis & FFmpeg Laugh-Track Sync";
        layer4_data = "PostgreSQL DB (User & Script Catalog) + Pinecone Vector DB (Audio Embeddings) + Redis Cache";
        layer5_infra = "AWS GPU Compute Cluster (g5.xlarge Instances), S3 Video Bucket & CloudFront Global CDN";
      } else if (lower.includes("wordpress") || lower.includes("elementor") || lower.includes("cms")) {
        layer1_frontend = "WordPress 6.x Custom Theme & Elementor Pro Interactive Page Builder UI";
        layer2_backend = "PHP 8.2 FastCGI Engine & Custom WordPress REST API Extensions";
        layer3_aiSpecialty = "WooCommerce E-Commerce Engine + Automated Anti-Spam & SEO Optimization Plugins";
        layer4_data = "MySQL 8.0 Primary Relational DB + Redis Object Cache & W3 Total Cache";
        layer5_infra = "High-Performance Cloudflare Edge CDN & SSL Secured Web Hosting";
      } else if (lower.includes("resume") || lower.includes("screening") || lower.includes("hiring")) {
        layer1_frontend = "React 18 Recruiter Dashboard & Candidate Drag-and-Drop Upload Portal";
        layer2_backend = "Python FastAPI OCR & Multi-Format Document Parsing Microservices";
        layer3_aiSpecialty = "OpenAI Embeddings API (text-embedding-3-large) + Pinecone Semantic Vector Search Engine";
        layer4_data = "PostgreSQL Primary (Encrypted Applicant Records) + Redis Cache";
        layer5_infra = "AWS Lambda Serverless & ECS Fargate Container Cluster";
      } else if (lower.includes("fintech") || lower.includes("payment") || lower.includes("fraud") || lower.includes("bank")) {
        layer1_frontend = "Next.js Enterprise Banking Portal & Secure iOS/Android Mobile Apps";
        layer2_backend = "Java Spring Boot / Go Sub-50ms High-Throughput Payment Gateway";
        layer3_aiSpecialty = "Apache Kafka Real-Time Fraud Telemetry Stream + ML Fraud Detection Rules Engine";
        layer4_data = "PostgreSQL Multi-AZ Cluster with Read Replicas & Encrypted Vault";
        layer5_infra = "AWS Private Cloud (VPC), Hardware Security Module (HSM) & CloudWatch Audit";
      } else if (lower.includes("telehealth") || lower.includes("health") || lower.includes("doctor")) {
        layer1_frontend = "React 18 Doctor/Patient Portal & Cross-Platform Mobile Suite";
        layer2_backend = "Python FastAPI / Node.js Encrypted Healthcare Gateway";
        layer3_aiSpecialty = "WebRTC HD Video Consultation Server & Automated EMR Records Integrator";
        layer4_data = "PostgreSQL RDS Multi-AZ (HIPAA Encrypted at Rest & in Transit)";
        layer5_infra = "HIPAA-Compliant AWS ECS Cloud Infrastructure with Automated Audit Logging";
      } else if (memory.techStack.length > 0) {
        layer1_frontend = `${memory.techStack.filter(s => ['React', 'Next.js', 'Flutter', 'Vue', 'Angular', 'WordPress'].includes(s)).join(' & ') || 'React 18 + Next.js UI'}`;
        layer2_backend = `${memory.techStack.filter(s => ['Node.js', 'Python', 'FastAPI', 'Java Spring Boot', '.NET Core', 'PHP'].includes(s)).join(' / ') || 'Node.js Express / Python FastAPI'}`;
        layer3_aiSpecialty = `${memory.techStack.filter(s => ['OpenAI API', 'PyTorch', 'Pinecone Vector DB', 'LangChain', 'Kafka', 'FFmpeg'].includes(s)).join(' + ') || 'REST API & Third-Party Service Connectors'}`;
        layer4_data = `${memory.techStack.filter(s => ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Supabase'].includes(s)).join(' + ') || 'PostgreSQL Primary DB + Redis Cache'}`;
        layer5_infra = `${memory.techStack.filter(s => ['AWS', 'Docker', 'Kubernetes', 'Vercel'].includes(s)).join(', ') || 'AWS ECS Fargate & CloudFront CDN'}`;
      }

      responseText = `### 🏗️ Technical Architecture & Cloud Topology for **${projName}**:\n\n` +
        `1. 💻 **Frontend Tier**: ${layer1_frontend}\n` +
        `2. ⚙️ **Backend API Gateway**: ${layer2_backend}\n` +
        `3. 🤖 **AI / Specialty Pipeline**: ${layer3_aiSpecialty}\n` +
        `4. 🗄️ **Persistence & Vector DB**: ${layer4_data}\n` +
        `5. ☁️ **Cloud Infrastructure**: ${layer5_infra}\n\n` +
        `💡 *Architected specifically for ${projName} based on your requirement details.*`;
      actionType = 'architecture';
      break;
    }

    case 'PROPOSAL_GENERATION': {
      const projName = memory.projectTitle || 'Enterprise Software Platform';
      const stackList = memory.techStack && memory.techStack.length > 0 ? memory.techStack.join(', ') : 'React, Node.js, PostgreSQL, AWS';
      const devNum = memory.devCount || 5;
      const weeks = memory.durationWeeks || 12;
      const client = memory.userName || 'Enterprise Client';
      const ind = memory.industry || 'Software & SaaS';

      responseText = `I've gathered your requirements and I'm ready to generate a full SOW proposal. Here's a summary:\n\n` +
        `### 📋 Requirements Summary\n` +
        `- **Project**: ${projName}\n` +
        `- **Client**: ${client}\n` +
        `- **Industry**: ${ind}\n` +
        `- **Tech Stack**: ${stackList}\n` +
        `- **Team Size**: ${devNum} Developers\n` +
        `- **Timeline**: ${weeks} Weeks\n\n` +
        `Click the button below to generate the complete proposal with AI-powered analysis, team allocation, and cost breakdown.`;
      actionType = 'redirect_to_generator';
      break;
    }

    case 'PROJECT_DISCOVERY': {
      // Step 1: User describes a project → we suggest features
      const projName = memory.projectTitle || 'Your Project';
      const features = suggestFeaturesForProject(userInput, memory);
      const totalWeeks = features.reduce((sum, f) => sum + f.estimatedWeeks, 0);

      // Store suggested features in memory so we can use them later
      memory.suggestedFeatures = features;
      memory.conversationPhase = 'features_suggested';

      responseText = `Great! I'd love to help you build **${projName}**. 🚀\n\n` +
        `Based on your requirements, here are the **key features** I'd recommend for this project:\n\n` +
        features.map((f, i) => `**${i + 1}. ${f.name}** (~${f.estimatedWeeks} week${f.estimatedWeeks > 1 ? 's' : ''})\n   ${f.description}`).join('\n\n') +
        `\n\n---\n\n` +
        `📊 **Estimated total development time**: ~${totalWeeks} weeks if all features are included.\n\n` +
        `Which of these features would you like to include? You can:\n` +
        `- Say **"all"** to include everything\n` +
        `- List the numbers you want (e.g. *"1, 2, 4, 5"*)\n` +
        `- Remove some (e.g. *"skip 3 and 6"*)\n` +
        `- Add your own custom feature\n\n` +
        `Once you confirm the features, I'll calculate the **exact timeline and cost estimate** for you.`;
      actionType = 'discovery';
      break;
    }

    case 'FEATURE_CONFIRMATION': {
      // Step 2: User confirms/selects features → we calculate cost & timeline
      const lower = userInput.toLowerCase();
      const suggested = memory.suggestedFeatures || [];
      let selectedFeatures = [];

      // Parse user selection
      const wantsAll = lower.includes('all') || lower.includes('yes') || lower.includes('everything') || lower.includes('include all') || lower.includes('sure') || lower.includes('ok') || lower.includes('fine') || lower.includes('go ahead') || lower.includes('sounds good') || lower.includes('perfect');
      
      if (wantsAll && suggested.length > 0) {
        selectedFeatures = [...suggested];
      } else {
        // Check if user mentioned numbers like "1, 2, 4"
        const numberMatches = userInput.match(/\d+/g);
        if (numberMatches && suggested.length > 0) {
          const indices = numberMatches.map(n => parseInt(n, 10) - 1);
          selectedFeatures = indices
            .filter(i => i >= 0 && i < suggested.length)
            .map(i => suggested[i]);
        }

        // Check if user wants to skip some
        const skipMatch = lower.match(/(?:skip|remove|without|except|not)\s*(.*)/i);
        if (skipMatch && suggested.length > 0) {
          const skipNumbers = skipMatch[1].match(/\d+/g);
          if (skipNumbers) {
            const skipIndices = new Set(skipNumbers.map(n => parseInt(n, 10) - 1));
            selectedFeatures = suggested.filter((_, i) => !skipIndices.has(i));
          }
        }

        // If nothing specific parsed, check if they listed feature-like text
        if (selectedFeatures.length === 0) {
          // Try matching feature names from user input
          const matchedByName = suggested.filter(f => 
            lower.includes(f.name.toLowerCase().split(' ')[0]) || 
            lower.includes(f.name.toLowerCase().split('&')[0].trim())
          );
          if (matchedByName.length > 0) {
            selectedFeatures = matchedByName;
          }
        }

        // Check for custom feature additions
        const customMatch = userInput.match(/(?:add|also|plus|include|custom)[:\s]+(.+)/i);
        if (customMatch) {
          const customName = customMatch[1].trim();
          if (customName.length > 3) {
            selectedFeatures.push({ name: customName, description: 'Custom feature requested by client', estimatedWeeks: 2 });
          }
        }
      }

      // If still no features selected, default to all
      if (selectedFeatures.length === 0) {
        selectedFeatures = [...suggested];
      }

      // PERSON-HOURS model for FEATURE_CONFIRMATION
      // Feature weeks represent sequential work; with parallel devs, actual calendar time compresses.
      const rawFeatureWeeks = selectedFeatures.reduce((sum, f) => sum + f.estimatedWeeks, 0);
      // Total effort = featureWeeks × 35 hrs (realistic focused dev hours per week)
      const totalHrs = estimateTotalProjectHours(memory.complexityScore || 5, rawFeatureWeeks);
      memory.totalProjectHours = totalHrs;
      memory.extractedRequirements = selectedFeatures.map(f => f.name);
      memory.conversationPhase = 'cost_shown';

      const isLow = memory.isLowBudget;

      // Resolve devCount and calendar weeks using the same mutual-derivation logic
      let devCount, totalWeeks;
      if (memory.devCountExplicit && memory.durationExplicit) {
        devCount = memory.devCount;
        totalWeeks = memory.durationWeeks;
      } else if (memory.devCountExplicit) {
        devCount = memory.devCount;
        totalWeeks = computeCalendarWeeks(totalHrs, devCount);
      } else if (memory.durationExplicit) {
        totalWeeks = memory.durationWeeks;
        devCount = computeDevCount(totalHrs, totalWeeks);
      } else {
        devCount = isLow ? 1 : Math.max(1, Math.min(4, Math.round(selectedFeatures.length * 0.4)));
        totalWeeks = computeCalendarWeeks(totalHrs, devCount);
      }
      memory.durationWeeks = totalWeeks;
      memory.devCount = devCount;

      const targetStack = memory.techStack.length > 0 ? memory.techStack : ['React', 'Node.js', 'AWS'];
      devMatches = matchBenchDevelopers(targetStack, Math.max(devCount, 3), isLow);
      const allocatedDevs = devMatches.slice(0, devCount);

      // Role-based hour allocation (each dev works their specific module)
      const roleNames = allocatedDevs.map(d => d.role);
      const hoursPerRole = allocateHoursByRole(totalHrs, roleNames);

      const devBreakdown = allocatedDevs.map((d, i) => {
        const hrs = hoursPerRole[i];
        const cost = Math.round(d.hourlyRate * hrs);
        return { name: d.name, role: d.role, hourlyRate: d.hourlyRate, hours: hrs, cost };
      });

      const totalEngineeringCost = devBreakdown.reduce((sum, d) => sum + d.cost, 0);
      const { cloudInfraCost, thirdPartyApiCost, cloudInfraDescription, thirdPartyApiDescription } = calculateRealisticInfrastructureCosts(userInput, memory.projectTitle, memory.industry);
      const contingency = Math.round(totalEngineeringCost * 0.10);
      const grandTotal = totalEngineeringCost + cloudInfraCost + thirdPartyApiCost + contingency;

      responseText = `Here's your project plan based on the selected features:\n\n` +
        `### ✅ Selected Features (${selectedFeatures.length})\n` +
        selectedFeatures.map((f, i) => `${i + 1}. **${f.name}** — ~${f.estimatedWeeks} week${f.estimatedWeeks > 1 ? 's' : ''} of focused work`).join('\n') +
        `\n\n---\n\n` +
        `> 💡 *Total project effort: **~${totalHrs} person-hours**. These features can be built in parallel — more developers compress the timeline, the total work stays the same.*\n\n` +
        `### 📅 Estimated Timeline\n` +
        `**${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}** delivery with a team of **${devCount} developer${devCount !== 1 ? 's' : ''}** working in parallel\n\n` +
        `### 👥 Recommended Team (Each Dev Works Their Module)\n` +
        devBreakdown.map(d => `- **${d.name}** (${d.role}) — $${d.hourlyRate}/hr × ${d.hours} hrs = **$${d.cost.toLocaleString()}**`).join('\n') +
        `\n\n### 💰 Cost Estimate\n` +
        `| Item | Cost |\n` +
        `|------|------|\n` +
        `| Engineering (${totalHrs} total person-hours) | **$${totalEngineeringCost.toLocaleString()}** |\n` +
        `| Cloud Infrastructure | **$${cloudInfraCost.toLocaleString()}** |\n` +
        `| Third-Party APIs & Services | **$${thirdPartyApiCost.toLocaleString()}** |\n` +
        `| Contingency (10%) | **$${contingency.toLocaleString()}** |\n` +
        `| **Total Estimated Cost** | **$${grandTotal.toLocaleString()} USD** |\n\n` +
        `Want me to **generate a full SOW proposal** for this? Just say *"generate SOW"* and I'll create a complete proposal document for you.`;
      actionType = 'cost';
      break;
    }

    default: {
      const memSummary = [];
      if (memory.projectTitle) memSummary.push(`**Project**: ${memory.projectTitle}`);
      if (memory.techStack.length > 0) memSummary.push(`**Tech Stack**: ${memory.techStack.join(', ')}`);

      const contextBlock = memSummary.length > 0 
        ? `I see you're working on ${memory.projectTitle || 'a project'}. ` 
        : '';

      responseText = `${contextBlock}I'd be happy to help${memory.userName ? `, ${memory.userName}` : ''}! 😊\n\n` +
        `Here's what I can do for you:\n` +
        `- 💡 **Describe your project idea** and I'll suggest the best features to build\n` +
        `- 💰 Ask me to **estimate the cost** and timeline\n` +
        `- 📄 Say **"generate SOW"** to create a full proposal document\n\n` +
        `Try something like: *"I want to build a dental clinic website"* or *"I need an e-commerce app"*`;
      actionType = 'general';
    }
  }

  return {
    response: responseText,
    memory,
    intent,
    devMatches,
    proposalData,
    actionType
  };
}

// Live Cloud LLM API Execution (OpenAI GPT / Google Gemini)
// This is ONLY used as a fallback for general conversation when local flow doesn't handle it.
// The multi-turn discovery flow (suggest features → confirm → cost) is handled locally.
async function fetchLiveLlmResponse({ userInput, history, memory, apiKey, provider }) {
  const geminiKey = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';
  const openaiKey = apiKey || import.meta.env?.VITE_OPENAI_API_KEY || '';
  const lower = userInput.toLowerCase();

  // Don't use live LLM for project discovery or feature confirmation — let local flow handle it
  const projectKeywords = ['want', 'need', 'build', 'create', 'make', 'website', 'app', 'platform', 'portal', 'system', 'clinic', 'store', 'shop', 'dashboard', 'management', 'booking', 'appointment', 'e-commerce'];
  const isProjectDescription = projectKeywords.some(kw => lower.includes(kw));
  if (isProjectDescription && !lower.includes('cost') && !lower.includes('price') && !lower.includes('how much')) {
    return null; // Let local flow handle this
  }

  // Try Google Gemini API
  if (provider === 'gemini' || geminiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
      
      const systemPrompt = `You are ProposalAI Assistant, an expert enterprise presales consultant.
User Context Memory:
- Name: ${memory.userName || 'Client'}
- Project: ${memory.projectTitle || 'Software App'}
- Tech Stack: ${memory.techStack.join(', ') || 'React, Node.js, AWS'}

Respond like ChatGPT: helpful, structured using clean GitHub markdown formatting. Be conversational and professional.
Do NOT generate cost estimates or pricing unless the user explicitly asks for cost/price/budget.
Do NOT assign developers or allocate teams unless asked.`;

      const promptPayload = {
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${userInput}` }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptPayload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            text,
            actionType: 'llm',
            devMatches: null
          };
        }
      }
    } catch (e) {
      console.warn("Gemini REST API fetch exception:", e);
    }
  }

  // Fallback to OpenAI API if configured
  if (openaiKey && openaiKey.trim().length > 5 && openaiKey.startsWith('sk-')) {
    const formattedMessages = [
      {
        role: 'system',
        content: `You are ProposalAI Assistant powered by OpenAI. Respond cleanly in markdown. Be conversational and helpful. Do NOT generate cost estimates unless explicitly asked.`
      },
      ...history.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: userInput }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        return { 
          text, 
          actionType: 'llm',
          devMatches: null
        };
      }
    }
  }

  return null;
}
