// 100 Proposals Data with Client Contact & Detailed Estimate Breakup
export const mockProposals = [
  {
    id: "PROP-901",
    projectName: "AI-Powered Omnichannel E-Commerce Platform",
    clientName: "OmniCart E-Commerce",
    clientEmail: "lukas.weber@omnicart.de",
    clientPhone: "+49 30 1234567",
    industry: "Retail & E-Commerce",
    estimatedCost: 145000,
    durationWeeks: 16,
    techStack: ["React", "Node.js", "PostgreSQL", "AWS", "OpenAI API", "Redis"],
    assignedDevsCount: 6,
    status: "Won",
    createdAt: "2026-06-12",
    winProbability: 95,
    summary: "Complete modernization of web & mobile storefront with personalized AI product recommendations, real-time inventory management, and headless checkout.",
    estimateBreakup: [
      { item: "Frontend Web & Mobile App (React & Flutter)", hours: 480, rate: 55, total: 26400, empCode: "EMP-101" },
      { item: "AI Recommendation & RAG Engine (Python & OpenAI)", hours: 360, rate: 75, total: 27000, empCode: "EMP-102" },
      { item: "DevOps & Cloud Architecture (AWS ECS & CI/CD)", hours: 240, rate: 65, total: 15600, empCode: "EMP-103" },
      { item: "UI/UX Design & Design System (Figma)", hours: 160, rate: 45, total: 7200, empCode: "EMP-104" },
      { item: "High-Throughput Backend Microservices (Java)", hours: 400, rate: 60, total: 24000, empCode: "EMP-105" },
      { item: "Cloud Infrastructure & Subscriptions", hours: 1, rate: 4500, total: 4500, empCode: "N/A" },
      { item: "Contingency Buffer (10%)", hours: 1, rate: 10470, total: 10470, empCode: "N/A" }
    ]
  },
  {
    id: "PROP-902",
    projectName: "HIPAA-Compliant Patient Telehealth Portal",
    clientName: "HealthPulse Diagnostics",
    clientEmail: "robert.vance@healthpulse.io",
    clientPhone: "+44 20 7946 0912",
    industry: "Healthcare",
    estimatedCost: 98000,
    durationWeeks: 12,
    techStack: ["React", "Python", "FastAPI", "PostgreSQL", "AWS S3", "Docker"],
    assignedDevsCount: 4,
    status: "Won",
    createdAt: "2026-06-25",
    winProbability: 90,
    summary: "Secure video consultation portal with electronic medical records (EMR) synchronization, automated appointment scheduling, and encrypted chat.",
    estimateBreakup: [
      { item: "FastAPI Backend & Telehealth WebRTC", hours: 320, rate: 75, total: 24000, empCode: "EMP-102" },
      { item: "React Patient Dashboard & EMR Sync", hours: 320, rate: 55, total: 17600, empCode: "EMP-101" },
      { item: "HIPAA Security Audit & Cloud Hardening", hours: 160, rate: 65, total: 10400, empCode: "EMP-103" },
      { item: "QA Automation & Compliance Verification", hours: 160, rate: 40, total: 6400, empCode: "EMP-108" },
      { item: "Contingency & Buffer", hours: 1, rate: 39600, total: 39600, empCode: "N/A" }
    ]
  }
];

const statuses = ["Won", "Won", "Won", "In Review", "Sent", "Draft", "Lost"];
const projectTypes = [
  { name: "Enterprise ERP Cloud Migration", industry: "SaaS", cost: 180000, weeks: 18, devs: 7, stack: ["Java Spring Boot", "React", "AWS", "PostgreSQL"] },
  { name: "AI Document Extractor & SOW Engine", industry: "AI/ML", cost: 115000, weeks: 12, devs: 4, stack: ["Python", "LangChain", "OpenAI API", "Pinecone"] },
  { name: "Mobile Wallet & Payment Gateway", industry: "FinTech", cost: 135000, weeks: 14, devs: 5, stack: ["Flutter", "Node.js", "PostgreSQL", "Firebase"] }
];

for (let i = 3; i <= 100; i++) {
  const proj = projectTypes[(i - 3) % projectTypes.length];
  const stat = statuses[i % statuses.length];
  const clientIdx = (i % 45) + 1;
  mockProposals.push({
    id: `PROP-${900 + i}`,
    projectName: `${proj.name} (Phase ${(i % 3) + 1})`,
    clientName: `Client Enterprise ${clientIdx}`,
    clientEmail: `client.${clientIdx}@enterprise.com`,
    clientPhone: `+1 (555) ${100 + clientIdx}-${2000 + i}`,
    industry: proj.industry,
    estimatedCost: proj.cost + ((i % 6) * 5000),
    durationWeeks: proj.weeks + (i % 4),
    techStack: proj.stack,
    assignedDevsCount: proj.devs,
    status: stat,
    createdAt: `2026-0${(i % 6) + 1}-${10 + (i % 18)}`,
    winProbability: stat === "Won" ? 100 : stat === "Lost" ? 20 : 65 + (i % 30),
    summary: `Enterprise implementation of ${proj.name.toLowerCase()} featuring high scalability, SOC2 compliance, and automated deployment pipelines.`,
    estimateBreakup: [
      { item: "Core System Engineering & Microservices", hours: 400, rate: 65, total: 26000, empCode: "EMP-101" },
      { item: "Cloud Infrastructure & Testing Suite", hours: 200, rate: 60, total: 12000, empCode: "EMP-103" },
      { item: "Project Management & Contingency Margin", hours: 1, rate: proj.cost - 38000, total: proj.cost - 38000, empCode: "N/A" }
    ]
  });
}
