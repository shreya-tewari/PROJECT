/**
 * Architecture Recommendation Templates by Industry & Complexity
 */

export const ARCHITECTURE_TEMPLATES = {
  "Generative AI": {
    frontend: "React 18 + Next.js App Router (TypeScript, Tailwind CSS, WebSockets)",
    backend: "FastAPI Async Microservices (Python 3.11, Celery Workers, FFmpeg Engine)",
    database: "PostgreSQL Primary + Redis Cache + Pinecone Vector Database",
    cloud: "AWS Enterprise (EC2 g5.xlarge GPU Instances, S3 Storage, CloudFront CDN)",
    aiLayer: "PyTorch Deep Learning Pipeline, OpenAI GPT-4o, ElevenLabs Voice Synthesis",
    deployment: "Docker Containers, Kubernetes (EKS), Automated GitHub Actions CI/CD",
    security: "OAuth 2.0 / OIDC, AWS KMS Encryption, DRM Video Protection Shield"
  },
  "Media & Entertainment / OTT": {
    frontend: "React 18 + Next.js (TypeScript, Video.js HLS/DASH Player)",
    backend: "Node.js Express API Gateway + FFmpeg Transcoding Pipeline",
    database: "PostgreSQL Multi-AZ + Redis Cluster for Session State",
    cloud: "AWS Cloud (S3 Video Storage, CloudFront Global Edge CDN, ECS Fargate)",
    aiLayer: "Content Recommendation Engine & Automated Subtitle Transcriber",
    deployment: "Docker Containers, AWS Copilot CI/CD Pipeline",
    security: "Widevine DRM / AES-128 Encryption, Stripe Webhook Authentication"
  },
  "Retail & E-Commerce": {
    frontend: "React 18 + Vite (TypeScript, Tailwind CSS, Lucide Icons)",
    backend: "Node.js Express REST API Gateway + Stripe Checkout Engine",
    database: "PostgreSQL (ACID Compliant Transactions) + Redis Caching",
    cloud: "AWS ECS Fargate Containers + CloudFront CDN",
    aiLayer: "Product Recommendation Engine & Search Auto-Suggest",
    deployment: "Vercel Frontend + AWS ECS Backend Deployment",
    security: "PCI-DSS Level 1 Compliant Payments, JWT Auth, HTTPS Enforcement"
  },
  "Healthcare & Medical": {
    frontend: "React 18 + Next.js (TypeScript, WebRTC Video SDK)",
    backend: "Python FastAPI / Node.js Express (HIPAA Audit Compliant)",
    database: "Encrypted PostgreSQL (AWS RDS Multi-AZ) + Encrypted S3 Medical Vault",
    cloud: "AWS HIPAA Compliant Isolated VPC (KMS Encryption at Rest & in Transit)",
    aiLayer: "AI Health Assistant & Automated Symptom Checker",
    deployment: "AWS ECS Fargate with Automated Health Checks & CloudWatch Alarms",
    security: "HIPAA Compliant KMS Audit Logging, OAuth2.0 + MFA Authentication"
  },
  "FinTech & Payments": {
    frontend: "React 18 (TypeScript, Financial Charting & Data Tables)",
    backend: "Java Spring Boot / Node.js Microservices (High-Throughput Sub-50ms)",
    database: "PostgreSQL Double-Entry Ledger DB + Redis Distributed Lock",
    cloud: "AWS High-Availability VPC (RDS Multi-AZ, ElastiCache, WAF Shield)",
    aiLayer: "Real-Time Transaction Fraud Detection Machine Learning Model",
    deployment: "Kubernetes (EKS) + Automated Blue-Green Deployment",
    security: "PCI-DSS Level 1 Vault, Plaid API Encryption, OAuth2.0 Token Exchange"
  },
  "CMS & Business Web": {
    frontend: "WordPress Custom Theme / React Component Wrappers",
    backend: "PHP 8.2 / WordPress REST API Gateway",
    database: "MySQL 8.0 Managed Database",
    cloud: "Managed Cloud Hosting (WP Engine / Vercel / Cloudflare Edge)",
    aiLayer: "SEO Content Optimizer & Automated Captcha Filter",
    deployment: "Git-based Automated Deployment Pipeline",
    security: "Wordfence WAF, SSL Encryption, Daily Automated Offsite Backups"
  },
  "Default": {
    frontend: "React 18 (TypeScript, Tailwind CSS, Lucide UI)",
    backend: "Node.js Express Enterprise REST API Gateway",
    database: "PostgreSQL Primary + Redis Caching",
    cloud: "AWS Cloud (ECS Fargate, S3 & RDS Multi-AZ)",
    aiLayer: "Google Gemini 1.5 Flash / OpenAI GPT-4o Integration",
    deployment: "Docker Containers with Automated CI/CD Deployment",
    security: "OAuth2.0 / JWT Authentication & HTTPS Enforcement"
  }
};

export function getArchitectureRecommendation(industry = "", complexityScore = 5) {
  const template = ARCHITECTURE_TEMPLATES[industry] || ARCHITECTURE_TEMPLATES["Default"];
  return {
    ...template,
    complexityTier: complexityScore >= 8 ? "Enterprise" : complexityScore >= 5 ? "Large" : "Standard"
  };
}
