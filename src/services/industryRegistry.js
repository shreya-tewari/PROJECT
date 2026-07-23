/**
 * Dynamic Pluggable Industry Registry
 * Allows runtime registration of custom industry feature templates & architecture patterns.
 */

import { FEATURE_TEMPLATES } from '../data/featureTemplates.js';
import { ARCHITECTURE_TEMPLATES } from '../templates/architectureTemplates.js';

class IndustryRegistry {
  constructor() {
    this.customFeatureTemplates = new Map();
    this.customArchitectureTemplates = new Map();
  }

  registerIndustryPlugin({ industryKey, industryName, featureSuite = [], architecture = null }) {
    if (industryKey && featureSuite.length > 0) {
      this.customFeatureTemplates.set(industryKey.toLowerCase(), featureSuite);
    }
    if (industryName && architecture) {
      this.customArchitectureTemplates.set(industryName, architecture);
    }
    console.log(`[IndustryRegistry] Plugin registered for: ${industryName || industryKey}`);
  }

  getFeaturesForIndustry(key) {
    const k = (key || "").toLowerCase();
    if (this.customFeatureTemplates.has(k)) {
      return this.customFeatureTemplates.get(k);
    }
    return FEATURE_TEMPLATES[k] || null;
  }

  getArchitectureForIndustry(industryName) {
    if (this.customArchitectureTemplates.has(industryName)) {
      return this.customArchitectureTemplates.get(industryName);
    }
    return ARCHITECTURE_TEMPLATES[industryName] || ARCHITECTURE_TEMPLATES["Default"];
  }
}

export const industryRegistry = new IndustryRegistry();
