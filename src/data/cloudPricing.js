/**
 * Cloud Infrastructure & API Cost Pricing Matrix
 */

export const CLOUD_PRICING_TIERS = {
  small: {
    cloudInfraCost: 300,
    thirdPartyApiCost: 150,
    cloudInfraDescription: "Managed Cloud Hosting (Vercel / Cloudflare Edge CDN & PostgreSQL)",
    thirdPartyApiDescription: "Stripe Gateway & Email Notification Service"
  },
  medium: {
    cloudInfraCost: 800,
    thirdPartyApiCost: 400,
    cloudInfraDescription: "AWS Cloud (ECS Container, RDS Database & Redis Cache)",
    thirdPartyApiDescription: "Stripe, SendGrid Email & Auth0 Authentication APIs"
  },
  large: {
    cloudInfraCost: 1500,
    thirdPartyApiCost: 1000,
    cloudInfraDescription: "AWS Multi-AZ Encrypted Cloud Infrastructure (HIPAA/PCI-DSS Vault & Redis Cluster)",
    thirdPartyApiDescription: "Stripe Payment Vault, Plaid API & Twilio SMS Gateway"
  },
  enterprise: {
    cloudInfraCost: 3500,
    thirdPartyApiCost: 2000,
    cloudInfraDescription: "AWS Enterprise Cloud (GPU Compute Cluster, S3 Storage & CloudFront Global CDN)",
    thirdPartyApiDescription: "Google Gemini 1.5 Pro / OpenAI GPT-4o, ElevenLabs Audio & Pinecone Vector DB"
  }
};

export function calculateCloudPricing(promptText = "", projectTitle = "", industry = "", complexityScore = 5) {
  const text = (promptText + ' ' + projectTitle + ' ' + industry).toLowerCase();

  if (complexityScore >= 9 || text.includes("movie") || text.includes("video") || text.includes("streaming") || text.includes("deepfake") || text.includes("generative")) {
    return CLOUD_PRICING_TIERS.enterprise;
  } else if (complexityScore >= 7 || text.includes("hipaa") || text.includes("fintech") || text.includes("bank") || text.includes("telehealth")) {
    return CLOUD_PRICING_TIERS.large;
  } else if (complexityScore <= 3 || text.includes("wordpress") || text.includes("elementor") || text.includes("cms") || text.includes("cheap") || text.includes("low budget") || text.includes("small")) {
    return CLOUD_PRICING_TIERS.small;
  } else {
    return CLOUD_PRICING_TIERS.medium;
  }
}
