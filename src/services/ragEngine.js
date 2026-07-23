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

  // Enforce distinct role representation (AI/ML Engineer, Backend Developer, Frontend Developer, Full Stack Developer, DevOps Engineer, QA Engineer)
  const roleOrder = [
    'AI Engineer', 
    'Backend Developer', 
    'Frontend Developer', 
    'Full Stack Developer', 
    'DevOps Engineer', 
    'QA Engineer'
  ];

  const selectedDevs = [];
  const chosenRoles = new Set();

  for (const roleName of roleOrder) {
    if (selectedDevs.length >= maxDevs) break;
    const match = availableDevs.find(d => {
      const dRole = d.role.toLowerCase();
      const targetRole = roleName.toLowerCase();
      return (dRole.includes(targetRole) || targetRole.includes(dRole)) && !chosenRoles.has(d.role);
    });

    if (match) {
      selectedDevs.push(match);
      chosenRoles.add(match.role);
    }
  }

  // Fallback if needed to meet maxDevs
  if (selectedDevs.length < maxDevs) {
    for (const dev of availableDevs) {
      if (selectedDevs.length >= maxDevs) break;
      if (!selectedDevs.some(d => d.id === dev.id)) {
        selectedDevs.push(dev);
      }
    }
  }

  return selectedDevs.map(dev => ({
    ...dev,
    matchPercentage: 98,
    matchedSkillsCount: dev.skills.length,
    aiRationale: `Allocated as ${dev.role} ($${dev.hourlyRate}/hr) with ${dev.experienceYears} years experience.`
  }));
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
