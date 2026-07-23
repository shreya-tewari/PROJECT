// Vector Database Chunks & Knowledge Base for RAG Semantic Matching

export const mockRagKnowledgeBase = [
  {
    chunkId: "VEC-1001",
    documentTitle: "SOW Template - Enterprise Microservices & Cloud Native Platforms",
    category: "SOW Templates",
    embeddingDimensions: 1536,
    tags: ["cloud", "microservices", "aws", "kubernetes", "architecture"],
    content: "Standard Scope of Work for Cloud Migration & Microservices: Architecture discovery (2 weeks), containerization via Docker & Kubernetes, CI/CD pipeline setup via GitHub Actions, database migration with zero downtime, and SOC2 compliance hardening.",
    similarityScore: 0.94
  },
  {
    chunkId: "VEC-1002",
    documentTitle: "Case Study - FinTech High-Frequency Payment Gateway",
    category: "Past Proposals & Case Studies",
    embeddingDimensions: 1536,
    tags: ["fintech", "payment", "fraud", "kafka", "java", "security"],
    content: "Delivered sub-50ms transaction processing platform processing $2.5B annually. Utilized Java Spring Boot microservices, Apache Kafka event streaming, and PostgreSQL with Read Replicas. Team size: 7 developers (2 Backend, 1 DevOps, 1 Architect, 1 QA, 1 Fullstack, 1 PM). Timeline: 16 weeks.",
    similarityScore: 0.91
  },
  {
    chunkId: "VEC-1003",
    documentTitle: "Case Study - Omnichannel E-Commerce & AI Recommendation Engine",
    category: "Past Proposals & Case Studies",
    embeddingDimensions: 1536,
    tags: ["ecommerce", "retail", "ai", "recommendation", "react", "node", "python"],
    content: "Built modern headless e-commerce store with Next.js frontend, Node.js backend microservices, and Python/PyTorch AI recommendation server. Achieved 35% higher average order value (AOV) for client. Team: 6 developers. Duration: 14 weeks.",
    similarityScore: 0.89
  },
  {
    chunkId: "VEC-1004",
    documentTitle: "Enterprise Rate Card & Developer Pricing Model (2026)",
    category: "Pricing & Rate Cards",
    embeddingDimensions: 1536,
    tags: ["pricing", "rates", "bench", "hourly", "cost", "margin"],
    content: "Official standard rate card: Senior Solution Architect ($95/hr), AI/ML Specialist ($75/hr), DevOps Specialist ($65/hr), Full Stack / Java Dev ($55-60/hr), Mobile Dev ($50/hr), QA Engineer ($40/hr). Standard profit margin targeted at 25-35% with 10% contingency buffer.",
    similarityScore: 0.88
  },
  {
    chunkId: "VEC-1005",
    documentTitle: "RAG & LLM Document Intelligence Architecture Pattern",
    category: "Technical Architecture",
    embeddingDimensions: 1536,
    tags: ["ai", "rag", "llm", "vector", "pinecone", "openai", "embeddings"],
    content: "Reference architecture for LLM applications: Client UI (React/Next.js) -> API Gateway (FastAPI/Node) -> Hybrid Vector DB (Pinecone/pgvector + BM25 hybrid search) -> LLM Provider (GPT-4o/Claude 3.5 Sonnet) with response streaming and fallback redundancy.",
    similarityScore: 0.96
  },
  {
    chunkId: "VEC-1006",
    documentTitle: "Case Study - HIPAA Telehealth Portal & Patient Management",
    category: "Past Proposals & Case Studies",
    embeddingDimensions: 1536,
    tags: ["healthcare", "hipaa", "telehealth", "python", "react", "security"],
    content: "Designed encrypted telemedicine video suite with real-time WebRTC, automated medical record syncing, and HIPAA compliance audit logs. Team size: 4 developers (1 Python, 1 React, 1 QA, 1 DevOps). Duration: 12 weeks.",
    similarityScore: 0.87
  },
  {
    chunkId: "VEC-1007",
    documentTitle: "Company Policy - Bench Resource Allocation & Skill Matching",
    category: "Company Policies",
    embeddingDimensions: 1536,
    tags: ["bench", "allocation", "hiring", "skills", "utilization"],
    content: "Bench engineers marked as Available are prioritized for client proposals based on exact skill match, notice period (Immediate preferred), cost efficiency, and previous client satisfaction ratings. Target bench utilization is >85%.",
    similarityScore: 0.85
  }
];
