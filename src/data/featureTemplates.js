/**
 * Domain & Industry Feature Templates Data Module
 */

export const FEATURE_TEMPLATES = {
  movie_faceswap: [
    { name: 'HD Video Streaming & Transcoding Upload Pipeline (FFmpeg & S3)', description: 'Video upload and adaptive HLS streaming engine with multi-quality resolution switcher', estimatedWeeks: 3, id: 'stream-player' },
    { name: 'AI Neural Face-Swap & Character Video Fusion Engine (PyTorch)', description: 'Deep learning pipeline for swapping faces onto video characters in high definition', estimatedWeeks: 3, id: 'stream-faceswap' },
    { name: 'Voice Cloning & Custom Audio Lip-Sync Engine (ElevenLabs API)', description: 'Generative AI voice clone and audio synchronization with video performance', estimatedWeeks: 2, id: 'stream-voice' },
    { name: 'Green Screen Stage, Script & Interactive Web Series Renderer', description: 'Interactive stage background, custom manuscript editor, and video renderer', estimatedWeeks: 2, id: 'stream-greenscreen' },
    { name: 'Subscription Membership & Paywall Checkout Integration (Stripe)', description: 'Stripe subscription plans and pay-per-generation credits system', estimatedWeeks: 2, id: 'stream-sub' },
    { name: 'Admin Video Moderation & DRM Content Protection Shield', description: 'Content safety filter, DRM asset protection, and admin moderation suite', estimatedWeeks: 2, id: 'stream-admin' }
  ],

  lead_generation: [
    { name: 'LinkedIn Data Scraper & Prospect Extraction Engine (Playwright)', description: 'Automated data scraping pipeline targeting LinkedIn profiles with proxy rotation', estimatedWeeks: 3, id: 'lead-scraper' },
    { name: 'AI Lead Scoring & Keep/Reject Classifier Engine', description: 'Machine learning & LLM prompt model for scoring lead quality and automated keep/reject classification', estimatedWeeks: 3, id: 'lead-scoring' },
    { name: 'Automated Google Sheets & CRM API Integration Sync', description: 'Real-time two-way synchronization of qualified leads into Google Sheets and CRM databases', estimatedWeeks: 2, id: 'lead-sheets' },
    { name: 'Cold Email Outreach & Lead Enrichment Pipeline', description: 'Email verification, domain lookup, and automated cold outreach sequences', estimatedWeeks: 2, id: 'lead-email' },
    { name: 'Proxy Rotation, Anti-Detection & Rate-Limiting Shield', description: 'IP proxy pool rotation and bot-detection bypass middleware', estimatedWeeks: 2, id: 'lead-proxy' },
    { name: 'Executive Lead Pipeline Analytics & Export Console', description: 'Visual pipeline metrics, conversion rates, and CSV/Excel export tool', estimatedWeeks: 2, id: 'lead-analytics' }
  ],

  dental_clinic: [
    { name: 'Online Appointment Booking System', description: 'Patients can book, reschedule, and cancel appointments online with real-time availability', estimatedWeeks: 2, id: 'den-book' },
    { name: 'Patient Portal & Medical Records', description: 'Secure login for patients to view history, prescriptions, and reports', estimatedWeeks: 3, id: 'den-portal' },
    { name: 'Doctor/Staff Dashboard', description: 'Admin panel for managing schedules, patients, and clinic operations', estimatedWeeks: 2, id: 'den-dash' },
    { name: 'Automated Email & SMS Reminders', description: 'Appointment confirmations and reminders via email and SMS', estimatedWeeks: 1, id: 'den-sms' },
    { name: 'Services & Pricing Page', description: 'Display dental/medical services with pricing and descriptions', estimatedWeeks: 1, id: 'den-price' },
    { name: 'AI Virtual Health Assistant', description: 'Chatbot for answering FAQs, symptom checking, and appointment guidance', estimatedWeeks: 3, id: 'den-ai' }
  ],

  pet_ecommerce: [
    { name: 'Pet Breed & Specs Profile Catalog with Health & Vaccine Status Filters', description: 'Browse pet food, toys, and supplies categorized by pet type and breed', estimatedWeeks: 2, id: 'pet-catalog' },
    { name: 'Veterinary Appointment & Grooming Slot Booking Calendar', description: 'Book appointments for grooming and vet visits', estimatedWeeks: 2, id: 'pet-vet' },
    { name: 'Pet Medical History Records, Vaccination Tracker & Diet Planner', description: 'Customer portal to save pet medical history and weight', estimatedWeeks: 2, id: 'pet-health' },
    { name: 'Pet Food & Accessories E-Commerce Cart & Automated Checkout', description: 'Add to cart, apply coupons, and secure multi-step checkout', estimatedWeeks: 2, id: 'pet-shop' },
    { name: 'Live Pet Wearable GPS Telemetry & Activity Monitoring System', description: 'Real-time location and walk tracking', estimatedWeeks: 2, id: 'pet-gps' },
    { name: 'Pet Adoption Verification & Owner Management Dashboard', description: 'Manage stock, vendors, prices, and sales analytics', estimatedWeeks: 1, id: 'pet-owner' }
  ],

  ecommerce: [
    { name: 'Product Catalog with Search & Filters', description: 'Browse products with categories, search, and advanced filters', estimatedWeeks: 2, id: 'eco-catalog' },
    { name: 'Shopping Cart & Checkout', description: 'Add to cart, apply coupons, and secure multi-step checkout', estimatedWeeks: 2, id: 'eco-pay' },
    { name: 'Payment Gateway Integration', description: 'Stripe/Razorpay/PayPal payment processing with order confirmation', estimatedWeeks: 2, id: 'eco-track' },
    { name: 'Order Tracking & History', description: 'Real-time order status tracking and purchase history for customers', estimatedWeeks: 2, id: 'eco-review' },
    { name: 'Admin Inventory Dashboard', description: 'Manage products, stock levels, pricing, and analytics', estimatedWeeks: 2, id: 'eco-invent' },
    { name: 'Customer Reviews & Ratings', description: 'Product review system with star ratings and verified purchases', estimatedWeeks: 1, id: 'eco-recom' }
  ],

  fintech: [
    { name: 'User Authentication & KYC Verification', description: 'Secure onboarding with identity verification and 2FA', estimatedWeeks: 3, id: 'fin-gate' },
    { name: 'Digital Wallet & Balance Management', description: 'Add funds, transfer money, and manage wallet balance', estimatedWeeks: 3, id: 'fin-vault' },
    { name: 'Transaction Processing Engine', description: 'Real-time payment processing with multi-currency support', estimatedWeeks: 3, id: 'fin-fraud' },
    { name: 'Transaction History & Analytics', description: 'Detailed statements, spending insights, and export functionality', estimatedWeeks: 2, id: 'fin-ledger' },
    { name: 'Fraud Detection System', description: 'AI-powered suspicious activity detection and alerts', estimatedWeeks: 3, id: 'fin-plaid' },
    { name: 'Admin Compliance Dashboard', description: 'Regulatory compliance monitoring and audit trail management', estimatedWeeks: 2, id: 'fin-wallet' }
  ],

  ai_rag: [
    { name: 'Interactive Natural Language Prompt Console with AI Agent Persona', description: 'Natural language chat interface with custom agent personalities', estimatedWeeks: 2, id: 'nlp-llm' },
    { name: 'Pinecone Vector Database Document Search & RAG Query Pipeline', description: 'Vector embeddings, semantic search, and document chunk retrieval', estimatedWeeks: 2, id: 'nlp-vector' },
    { name: 'Automated File & Data Fact Extractor (PDF, Word, Images)', description: 'Upload documents and parse structured facts automatically', estimatedWeeks: 2, id: 'nlp-parser' },
    { name: 'Prompt Injection Shield & Automated Content Moderation Filter', description: 'Security guardrails for LLM prompts and responses', estimatedWeeks: 1, id: 'nlp-safety' },
    { name: 'Smart Email Follow-Ups & Automated Workflow Integrations', description: 'Auto-generate follow-up emails and sync with external tools', estimatedWeeks: 1, id: 'nlp-outreach' },
    { name: 'LLM Token Usage Telemetry & API Cost Analytics Dashboard', description: 'Track API consumption, token counts, and cost estimates', estimatedWeeks: 1, id: 'nlp-analytics' }
  ],

  wordpress: [
    { name: 'Custom Responsive Theme Design & Page Layout Builder', description: 'Tailored WP design matching corporate branding', estimatedWeeks: 1, id: 'wp-theme' },
    { name: 'Storefront Checkout & Payment Gateway Integration', description: 'WooCommerce checkout with local/global gateways', estimatedWeeks: 1, id: 'wp-checkout' },
    { name: 'SEO Optimization & XML Sitemap Configurations', description: 'On-page SEO, Yoast/RankMath setup, and schema markup', estimatedWeeks: 1, id: 'wp-seo' },
    { name: 'Contact Inquiry Forms & Automated CRM Synchronizations', description: 'Form submissions with lead capture to HubSpot/Salesforce', estimatedWeeks: 1, id: 'wp-crm' },
    { name: 'CDN Speed Optimization & Caching Hardening', description: 'WP Rocket, Cloudflare CDN, and image compression', estimatedWeeks: 1, id: 'wp-speed' },
    { name: 'Security Hardening, Anti-Spam Captcha & Database Backups', description: 'Wordfence setup, daily backups, and malware scanning', estimatedWeeks: 1, id: 'wp-audit' }
  ],

  car_rental: [
    { name: 'Vehicle Fleet Catalog with Spec Comparison & Availability Filter', description: 'Browse available cars with specifications and filters', estimatedWeeks: 2, id: 'car-fleet' },
    { name: 'Pickup & Dropoff Location, Date & Time Slot Reservation System', description: 'Select locations and dates for booking', estimatedWeeks: 2, id: 'car-reserve' },
    { name: 'Automated Driver\'s License & Identity Document Verification Gate', description: 'Scan and verify identity documents automatically', estimatedWeeks: 2, id: 'car-verify' },
    { name: 'Security Deposit Pre-Authorization Hold & Payment Gateway', description: 'Pre-authorize credit card holds for rental deposits', estimatedWeeks: 1, id: 'car-dep' },
    { name: 'Live Vehicle Telemetry & GPS Mileage Tracking Integration', description: 'Real-time GPS tracking and mileage monitoring', estimatedWeeks: 2, id: 'car-gps' },
    { name: 'Admin Fleet Operations, Maintenance & Revenue Analytics Dashboard', description: 'Fleet management, maintenance logs, and financial reports', estimatedWeeks: 2, id: 'car-admin' }
  ]
};

/**
 * Derives features dynamically for any custom text prompt if no explicit category matches
 */
export function synthesizeZeroShotFeatures(text = "") {
  const stopWords = new Set([
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'what', 'which', 'this', 'that', 'am', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'do', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'of', 'at', 'by', 'for', 'with', 'about', 'to', 'from', 'in', 'out', 'on', 'all', 'any', 'can', 'will', 'just', 'should', 'now', 'want', 'need', 'build', 'create', 'make', 'website', 'app', 'application', 'platform', 'portal', 'system', 'software', 'like', 'tool', 'solution', 'where', 'can'
  ]);

  const rawWords = (text || "").split(/[\s,._\-\/\\]+/).filter(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.length > 2 && !stopWords.has(clean);
  });

  const domainWords = rawWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const domainTopic = domainWords.slice(0, 3).join(' ') || 'Custom Solution';
  const primaryWord = domainWords[0] || 'Service';

  return [
    { id: "dyn-catalog", name: `${domainTopic} Interactive Catalog & Multi-Criteria Search Engine`, description: `Browse and search ${domainTopic} items with real-time filters`, estimatedWeeks: 2, selected: true },
    { id: "dyn-core", name: `Core ${domainTopic} Booking & Automated Order Request Dispatcher`, description: `Core workflow engine for ${domainTopic}`, estimatedWeeks: 2, selected: true },
    { id: "dyn-track", name: `Real-Time ${primaryWord} Status Telemetry & Notification Engine`, description: `Live progress updates and automated status alerts`, estimatedWeeks: 2, selected: true },
    { id: "dyn-pay", name: `Integrated Payment Gateway, Deposit Pre-Auth & Invoicing Portal`, description: `Secure credit card checkout and billing invoices`, estimatedWeeks: 1, selected: true },
    { id: "dyn-user", name: `${domainTopic} User Account Portal & History Records Log`, description: `User profile management and activity records`, estimatedWeeks: 1, selected: true },
    { id: "dyn-admin", name: `Executive Admin Operations Dashboard & ${primaryWord} Analytics`, description: `Admin control panel and operational reporting`, estimatedWeeks: 2, selected: true }
  ];
}
