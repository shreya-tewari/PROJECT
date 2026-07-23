import { mockRagKnowledgeBase } from "../data/mockRagKnowledgeBase.js";
import { mockBenchDevelopers } from "../data/mockBenchDevelopers.js";
import { mockProposals } from "../data/mockProposals.js";

/* =====================================================
   PROJECT CATEGORIES
===================================================== */

const PROJECT_CATEGORIES = {
  ecommerce: [
    "ecommerce",
    "shopping",
    "store",
    "shop",
    "cart",
    "checkout",
    "product",
    "inventory",
    "payment",
    "marketplace"
  ],

  healthcare: [
    "hospital",
    "clinic",
    "doctor",
    "patient",
    "medical",
    "ehr",
    "emr",
    "appointment",
    "pharmacy",
    "dental",
    "dentist"
  ],

  ai: [
    "ai",
    "llm",
    "gpt",
    "chatbot",
    "agent",
    "machine learning",
    "face swap",
    "voice clone",
    "vision",
    "ocr",
    "classification",
    "prediction"
  ],

  crm: [
    "crm",
    "lead",
    "customer",
    "sales",
    "pipeline",
    "deal",
    "contact"
  ],

  erp: [
    "erp",
    "inventory",
    "finance",
    "payroll",
    "purchase",
    "warehouse"
  ],

  booking: [
    "booking",
    "reservation",
    "schedule",
    "calendar",
    "hotel",
    "travel",
    "flight"
  ],

  education: [
    "school",
    "student",
    "teacher",
    "learning",
    "course",
    "education",
    "lms"
  ],

  social: [
    "social",
    "community",
    "post",
    "comment",
    "friend",
    "message"
  ]
};

/* =====================================================
   SKILL MAPPING
===================================================== */

const SKILL_MAP = {

  react: [
    "react",
    "nextjs",
    "next",
    "frontend",
    "tailwind"
  ],

  backend: [
    "node",
    "express",
    "fastapi",
    "django",
    "laravel",
    "spring"
  ],

  database: [
    "mysql",
    "postgres",
    "mongodb",
    "redis",
    "supabase"
  ],

  ai: [
    "openai",
    "langchain",
    "llm",
    "rag",
    "vector",
    "embedding",
    "crewai"
  ],

  devops: [
    "docker",
    "aws",
    "azure",
    "gcp",
    "kubernetes",
    "terraform"
  ],

  mobile: [
    "flutter",
    "react native",
    "android",
    "ios"
  ]

};

/* =====================================================
   CLEAN TEXT
===================================================== */

function cleanText(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =====================================================
   TOKENIZE
===================================================== */

function tokenize(text = "") {
  return cleanText(text)
    .split(" ")
    .filter(word => word.length > 2);
}

/* =====================================================
   PROJECT CLASSIFIER
===================================================== */

export function classifyProject(query = "") {

  const tokens = tokenize(query);

  let bestCategory = "custom";

  let highestScore = 0;

  for (const [category, keywords] of Object.entries(PROJECT_CATEGORIES)) {

    let score = 0;

    keywords.forEach(keyword => {

      if (query.toLowerCase().includes(keyword))
        score++;

    });

    if (score > highestScore) {

      highestScore = score;

      bestCategory = category;

    }

  }

  return {

    category: bestCategory,

    confidence:
      highestScore === 0
        ? 0.45
        : Number(
          Math.min(
            0.99,
            highestScore /
            PROJECT_CATEGORIES[bestCategory].length +
            0.55
          ).toFixed(2)
        )

  };

}

/* =====================================================
   KEYWORD EXTRACTION
===================================================== */

export function extractKeywords(query = "") {

  return [...new Set(tokenize(query))];

}
/* =====================================================
   WEIGHTED SIMILARITY ENGINE
===================================================== */

function calculateSimilarity(query = "", text = "", tags = []) {

  if (!query || !text) return 0;

  const queryTokens = tokenize(query);

  const document =
    cleanText(text + " " + tags.join(" "));

  let score = 0;

  queryTokens.forEach(token => {

    // Exact Match
    if (document.includes(token))
      score += 5;

    // Partial Match
    else if (
      document
        .split(" ")
        .some(word => word.startsWith(token))
    )
      score += 3;

  });

  // Tag Bonus
  tags.forEach(tag => {

    if (query.toLowerCase().includes(tag.toLowerCase()))
      score += 4;

  });

  // Category Bonus

  const category = classifyProject(query);

  if (
    document.includes(category.category)
  )
    score += 8;

  const maxPossible =
    queryTokens.length * 5 + 15;

  return Number(
    Math.min(score / maxPossible, 1).toFixed(2)
  );

}

/* =====================================================
   RAG RETRIEVAL
===================================================== */

export function retrieveRagContext(query) {

  if (!query)
    return mockRagKnowledgeBase.slice(0, 3);

  const category =
    classifyProject(query);

  const scoredChunks =
    mockRagKnowledgeBase.map(chunk => {

      const similarity =
        calculateSimilarity(

          query,

          chunk.documentTitle +
          " " +
          chunk.content,

          chunk.tags || []

        );

      return {

        ...chunk,

        category: category.category,

        similarityScore: similarity

      };

    });

  const relevant = scoredChunks

    .filter(chunk => chunk.similarityScore >= 0.40)

    .sort(

      (a, b) =>

        b.similarityScore -

        a.similarityScore

    );

  if (!relevant.length)
    return scoredChunks

      .sort(

        (a, b) =>

          b.similarityScore -

          a.similarityScore

      )

      .slice(0, 2);

  return relevant.slice(0, 5);

}

/* =====================================================
   PROPOSAL SEARCH
===================================================== */

export function findSimilarProposals(query) {

  const category =
    classifyProject(query);

  const proposals =
    mockProposals.map(proposal => {

      const similarity =
        calculateSimilarity(

          query,

          `
          ${proposal.projectName}
          ${proposal.summary}
          ${proposal.description || ""}
          ${(proposal.techStack || []).join(" ")}
          ${(proposal.features || []).join(" ")}
          ${proposal.industry || ""}
          `,

          proposal.techStack || []

        );

      return {

        ...proposal,

        projectCategory:
          category.category,

        similarityScore:
          similarity

      };

    });

  return proposals

    .filter(p => p.similarityScore >= 0.35)

    .sort(

      (a, b) =>

        b.similarityScore -

        a.similarityScore

    )

    .slice(0, 5);

}

/* =====================================================
   REQUIRED SKILLS
===================================================== */

export function detectRequiredSkills(query = "") {

  const lower = query.toLowerCase();

  const detected = [];

  Object.entries(SKILL_MAP).forEach(

    ([skill, keywords]) => {

      const matched = keywords.some(

        keyword =>

          lower.includes(keyword)

      );

      if (matched)
        detected.push(skill);

    }

  );

  return [...new Set(detected)];

}
/* =====================================================
   DEVELOPER MATCHING ENGINE
===================================================== */

const ROLE_SKILLS = {
  "Frontend Developer": [
    "react",
    "nextjs",
    "frontend",
    "tailwind",
    "javascript",
    "typescript",
    "html",
    "css"
  ],

  "Backend Developer": [
    "node",
    "express",
    "fastapi",
    "django",
    "laravel",
    "spring",
    "api",
    "backend"
  ],

  "Full Stack Developer": [
    "react",
    "node",
    "express",
    "fastapi",
    "mongodb",
    "postgres",
    "mysql",
    "typescript"
  ],

  "AI Engineer": [
    "openai",
    "langchain",
    "rag",
    "llm",
    "embedding",
    "crewai",
    "machine learning",
    "vision",
    "ocr"
  ],

  "DevOps Engineer": [
    "aws",
    "docker",
    "kubernetes",
    "terraform",
    "nginx",
    "linux",
    "azure",
    "gcp"
  ],

  "QA Engineer": [
    "testing",
    "jest",
    "cypress",
    "playwright",
    "qa",
    "automation"
  ]
};

/* =====================================================
   MATCH SCORE
===================================================== */

function calculateDeveloperScore(dev, requiredSkills = []) {

  const devSkills = (dev.skills || []).map(s => s.toLowerCase());

  let matched = [];

  requiredSkills.forEach(skill => {

    if (
      devSkills.some(
        d =>
          d.includes(skill) ||
          skill.includes(d)
      )
    ) {
      matched.push(skill);
    }

  });

  const percentage =
    requiredSkills.length === 0
      ? 70
      : Math.round(
        (matched.length /
          requiredSkills.length) *
        100
      );

  return {

    matched,

    percentage

  };

}

/* =====================================================
   TEAM SIZE
===================================================== */

function recommendedTeamSize(category) {

  switch (category) {

    case "ai":
      return 5;

    case "ecommerce":
      return 4;

    case "crm":
      return 3;

    case "healthcare":
      return 4;

    case "erp":
      return 5;

    case "booking":
      return 3;

    default:
      return 3;

  }

}

/* =====================================================
   MATCH DEVELOPERS
===================================================== */

export function matchBenchDevelopers(
  requiredSkills = [],
  maxDevs = null,
  isLowBudget = false,
  projectCategory = "custom"
) {

  const available = mockBenchDevelopers.filter(
    d => d.status === "Available"
  );

  const teamSize =
    maxDevs ||
    recommendedTeamSize(projectCategory);

  const scored = available.map(dev => {

    const result =
      calculateDeveloperScore(
        dev,
        requiredSkills
      );

    return {

      ...dev,

      matchedSkills:
        result.matched,

      matchedSkillsCount:
        result.matched.length,

      matchPercentage:
        result.percentage

    };

  });

  scored.sort(

    (a, b) =>

      b.matchPercentage -

      a.matchPercentage

  );

  let selected = [];

  const usedRoles = new Set();

  for (const dev of scored) {

    if (
      selected.length >= teamSize
    )
      break;

    if (
      usedRoles.has(dev.role)
    )
      continue;

    selected.push(dev);

    usedRoles.add(dev.role);

  }

  if (
    isLowBudget
  ) {

    selected = selected.sort(

      (a, b) =>

        a.hourlyRate -

        b.hourlyRate

    );

  }

  return selected.map(dev => ({

    ...dev,

    aiRationale: `
${dev.role} selected because
${dev.matchPercentage}% of required skills
matched.
Hourly Rate: $${dev.hourlyRate}/hr
Experience:
${dev.experienceYears} years.
Matched Skills:
${dev.matchedSkills.join(", ") || "General Development"}
`

  }));

}
