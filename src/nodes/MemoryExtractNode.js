/**
 * MemoryExtractNode
 * Single Responsibility: Extract entities, budget, dev count, duration, tech stack, and dynamic title/industry into state.memory.
 */

function estimateTotalProjectHours(complexityScore) {
  if (complexityScore >= 9) return 2000;
  if (complexityScore >= 8) return 1400;
  if (complexityScore >= 7) return 960;
  if (complexityScore >= 6) return 720;
  if (complexityScore >= 5) return 520;
  if (complexityScore >= 4) return 380;
  return 240;
}

export function runMemoryExtractNode(state) {
  const text = state.userInput || "";
  const lower = text.toLowerCase();
  const memory = { ...(state.memory || {}) };
  if (!memory.techStack) memory.techStack = [];

  // Low budget detection
  const isLowBudget = ["low budget", "budget is low", "small budget", "cheap", "less money", "under $", "wordpress", "cost effective"].some(k => lower.includes(k));
  if (isLowBudget) memory.isLowBudget = true;

  // Name extraction
  const nameMatch = text.match(/(?:my name is|i am|call me|this is)\s+([A-Za-z]+)/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    if (!["a", "an", "building", "looking", "trying"].includes(candidate.toLowerCase())) {
      memory.userName = candidate;
    }
  }

  // Budget Extraction
  const hourlyMatch = text.match(/(?:rate|budget|pay|hourly)\s*(?:of|is|=|:)?\s*\$?(\d+)\s*(?:\/hr|per hour|hr)/i);
  const totalMatch = text.match(/(?:total budget|max budget|budget|cost|around|under)\s*(?:of|is|=|:)?\s*\$?(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k|usd|dollars)?/i);

  if (hourlyMatch && hourlyMatch[1]) memory.explicitHourlyBudget = parseInt(hourlyMatch[1], 10);
  if (totalMatch && totalMatch[1]) {
    const val = parseInt(totalMatch[1].replace(/,/g, ''), 10);
    if (val > 0 && val < 500000) memory.explicitTotalBudget = val;
  }

  // Complexity Scoring
  let complexityScore = 5;
  if (["movie", "face", "swap", "video", "voice", "generative", "deepfake"].some(k => lower.includes(k))) complexityScore += 4;
  if (["ai", "ml", "model", "pytorch", "llm", "rag"].some(k => lower.includes(k))) complexityScore += 2;
  if (["enterprise", "bank", "hipaa", "multi-tenant", "security"].some(k => lower.includes(k))) complexityScore += 2;
  if (["streaming", "real-time", "telemetry", "kafka"].some(k => lower.includes(k))) complexityScore += 2;
  if (isLowBudget || ["wordpress", "elementor", "cms"].some(k => lower.includes(k))) complexityScore -= 3;

  complexityScore = Math.max(1, Math.min(10, complexityScore));
  memory.complexityScore = complexityScore;

  // Dev count & Duration
  const devMatch = text.match(/(\d+)\s*(?:developers?|devs?|engineers?|people|team\s*members?)/i);
  const weekMatch = text.match(/(\d+)\s*(?:weeks?|wks?)/i);
  const monthMatch = text.match(/(\d+)\s*(?:months?|mths?)/i);

  if (devMatch && devMatch[1]) {
    memory.devCount = parseInt(devMatch[1], 10);
    memory.devCountExplicit = true;
  }
  if (weekMatch && weekMatch[1]) {
    memory.durationWeeks = parseInt(weekMatch[1], 10);
    memory.durationExplicit = true;
  } else if (monthMatch && monthMatch[1]) {
    memory.durationWeeks = parseInt(monthMatch[1], 10) * 4;
    memory.durationExplicit = true;
  }

  memory.totalProjectHours = estimateTotalProjectHours(complexityScore);
  memory.avgHourlyRate = isLowBudget ? 35 : (complexityScore >= 8 ? 65 : (complexityScore >= 5 ? 55 : 45));
  memory.cloudCost = isLowBudget ? 150 : (complexityScore >= 8 ? 4500 : (complexityScore >= 5 ? 1200 : 400));

  // Tech Stack extraction
  const techKeywords = ['WordPress', 'PHP', 'Elementor', 'WooCommerce', 'Supabase', 'Firebase', 'React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes', 'Flutter', 'Kafka', 'Redis'];
  techKeywords.forEach(tech => {
    if (lower.includes(tech.toLowerCase()) && !memory.techStack.includes(tech)) {
      memory.techStack.push(tech);
    }
  });

  // Dynamic Title & Industry Extraction (Allow topic switching if new project described)
  const isNewTopicInput = text.length > 15 && ['want', 'need', 'build', 'create', 'make', 'app', 'website', 'platform', 'movie', 'video', 'store', 'clinic', 'health', 'fintech', 'lead', 'scrape'].some(k => lower.includes(k));
  if (!memory.projectTitle || isNewTopicInput) {
    let newTitle = null;
    let newInd = null;

    if (lower.includes('wordpress') || lower.includes('elementor')) {
      newTitle = 'WordPress Custom Website';
      newInd = 'CMS & Business Web';
      if (!memory.techStack.includes('WordPress')) memory.techStack.push('WordPress', 'PHP', 'MySQL', 'Elementor');
    } else if (['lead', 'scrape', 'scraping', 'linkedin', 'prospect', 'google sheet', 'outreach', 'crawler'].some(k => lower.includes(k))) {
      newTitle = 'AI Lead Generation & Scraping Automation App';
      newInd = 'B2B Growth & Automation';
      memory.techStack = ['Python', 'FastAPI', 'Playwright', 'OpenAI API', 'Google Sheets API', 'React'];
    } else if (['movie', 'face', 'video', 'voice', 'character', 'deepfake'].some(k => lower.includes(k))) {
      newTitle = 'AI Movie & Face-Swap Video Platform';
      newInd = 'Media & Generative AI';
      memory.techStack = ['Python', 'FastAPI', 'PyTorch', 'FFmpeg', 'ElevenLabs API', 'React'];
    } else if (['netflix', 'hotstar', 'hulu', 'ott', 'stream', 'cinema'].some(k => lower.includes(k))) {
      newTitle = 'Video Streaming & Movie OTT Platform';
      newInd = 'Media & Entertainment / OTT';
      memory.techStack = ['React', 'Node.js', 'AWS S3', 'CloudFront', 'FFmpeg', 'HLS'];
    } else if (['pet', 'pets', 'animal'].some(k => lower.includes(k))) {
      newTitle = 'Pet E-Commerce Platform';
      newInd = 'Retail & E-Commerce';
    } else if (['e-commerce', 'ecommerce', 'ecomm', 'shopping', 'bakery', 'shop'].some(k => lower.includes(k)) || (lower.includes('store') && !['store in', 'store it', 'store data'].some(k => lower.includes(k)))) {
      newTitle = 'E-Commerce Platform & Online Store';
      newInd = 'Retail & E-Commerce';
    } else if (['fintech', 'payment', 'banking', 'wallet', 'fraud'].some(k => lower.includes(k))) {
      newTitle = 'FinTech Payment Gateway Platform';
      newInd = 'FinTech & Payments';
    } else if (['telehealth', 'health', 'medical', 'hipaa', 'doctor', 'clinic', 'dental'].some(k => lower.includes(k))) {
      newTitle = lower.includes('dental') ? 'Dental Clinic Website' : 'HIPAA Compliant Telehealth Portal';
      newInd = 'Healthcare & Medical';
    } else if (['resume', 'screening', 'parsing', 'hiring'].some(k => lower.includes(k))) {
      newTitle = 'AI Resume Screening & Hiring Parser';
      newInd = 'HR Tech & Recruitment';
    } else if (text.trim().length > 10 && !['remember', 'how much', 'for less', 'giving me'].some(k => lower.includes(k))) {
      const stopWords = new Set(['need', 'want', 'please', 'generate', 'create', 'build', 'for', 'this', 'app', 'with', 'my', 'budget', 'is', 'low', 'suggest', 'time', 'should', 'months', 'weeks', 'developers', 'people', 'team']);
      const cleanWords = text.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w.toLowerCase())).slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (cleanWords.length > 3) {
        newTitle = `${cleanWords} Platform`;
        newInd = 'Software & SaaS';
      }
    }

    if (newTitle && newTitle !== memory.projectTitle) {
      memory.projectTitle = newTitle;
      memory.industry = newInd;
      memory.suggestedFeatures = null;
      memory.extractedRequirements = null;
      memory.conversationPhase = null;
    }
  }

  return {
    ...state,
    memory,
    project: {
      title: memory.projectTitle,
      category: memory.industry,
      industry: memory.industry,
    },
  };
}
