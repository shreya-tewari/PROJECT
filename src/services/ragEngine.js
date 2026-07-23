import { mockRagKnowledgeBase } from '../data/mockRagKnowledgeBase';
import { mockBenchDevelopers } from '../data/mockBenchDevelopers';
import { mockProposals } from '../data/mockProposals';

// Simulates TF-IDF / Cosine Similarity Vector Matching for RAG
function calculateSimilarity(query, text, tags = []) {
  if (!query || !text) return 0;
  const qTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const textLower = (text + ' ' + tags.join(' ')).toLowerCase();
  
  let matchCount = 0;
  qTerms.forEach(term => {
    if (textLower.includes(term)) matchCount += 1;
  });

  const baseScore = qTerms.length > 0 ? matchCount / qTerms.length : 0.5;
  // Add slight realistic vector variance
  const score = Math.min(0.98, Math.max(0.65, baseScore * 0.4 + 0.58 + (text.length % 7) * 0.01));
  return Number(score.toFixed(2));
}

// Retrieve relevant RAG context chunks based on natural language query
export function retrieveRagContext(query) {
  if (!query) return mockRagKnowledgeBase.slice(0, 3);

  const scoredChunks = mockRagKnowledgeBase.map(chunk => {
    const score = calculateSimilarity(query, chunk.content + ' ' + chunk.documentTitle, chunk.tags);
    return {
      ...chunk,
      similarityScore: score
    };
  });

  return scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 4);
}

// Search and rank bench developers based on skill vector matching
export function matchBenchDevelopers(requiredSkills = [], maxDevs = 4, isLowBudget = false) {
  const availableDevs = mockBenchDevelopers.filter(d => d.status === 'Available');

  // Filter out QA/testers/designers unless specifically requested in requiredSkills
  const reqLower = requiredSkills.map(s => s.toLowerCase());
  const needsQA = reqLower.some(s => s.includes('test') || s.includes('qa') || s.includes('automation'));
  const needsDesign = reqLower.some(s => s.includes('ui') || s.includes('ux') || s.includes('design') || s.includes('figma'));

  const eligibleDevs = availableDevs.filter(dev => {
    const roleLow = dev.role.toLowerCase();
    if (!needsQA && (roleLow.includes('tester') || roleLow.includes('qa'))) return false;
    if (!needsDesign && (roleLow.includes('designer') || roleLow.includes('ux'))) return false;
    return true;
  });

  const targetDevs = eligibleDevs.length > 0 ? eligibleDevs : availableDevs;

  const scoredDevs = targetDevs.map(dev => {
    let matchedSkillsCount = 0;
    requiredSkills.forEach(reqSkill => {
      if (dev.skills.some(s => s.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(s.toLowerCase()))) {
        matchedSkillsCount++;
      }
    });

    const matchRatio = requiredSkills.length > 0 ? matchedSkillsCount / requiredSkills.length : 0.7;
    const expBonus = Math.min(0.15, dev.experienceYears * 0.015);
    
    // Balanced ranking formula for low budget vs skill fit
    const combinedScore = (matchRatio * 50) + (dev.rating * 10) + (isLowBudget ? (50 - dev.hourlyRate) * 1.5 : 0);
    const matchPercentage = Math.min(99, Math.round(combinedScore));

    return {
      ...dev,
      matchPercentage: Math.max(75, matchPercentage),
      matchedSkillsCount,
      aiRationale: isLowBudget
        ? `Cost-optimized developer matching low budget at $${dev.hourlyRate}/hr with ${dev.experienceYears} yrs experience.`
        : `Selected for ${matchedSkillsCount}/${requiredSkills.length || 1} skill overlaps, ${dev.experienceYears} years experience, and immediate availability at $${dev.hourlyRate}/hr.`
    };
  });

  return scoredDevs.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, maxDevs);
}

// Perform semantic search over past proposals
export function findSimilarProposals(query) {
  return mockProposals.map(p => {
    const score = calculateSimilarity(query, p.projectName + ' ' + p.summary, p.techStack);
    return {
      ...p,
      similarityScore: score
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 3);
}
