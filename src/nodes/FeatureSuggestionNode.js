/**
 * FeatureSuggestionNode
 * Single Responsibility: Generate 5-6 domain-tailored feature recommendations and format user choice options.
 */

import { FEATURE_TEMPLATES, synthesizeZeroShotFeatures } from '../data/featureTemplates';

export function suggestFeaturesForText(text, projectTitle) {
  const lower = (text + ' ' + (projectTitle || '')).toLowerCase();

  if (['lead', 'scrape', 'scraping', 'linkedin', 'prospect', 'google sheet', 'outreach', 'crawler'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.lead_generation;
  }
  if (['movie', 'face', 'swap', 'deepfake', 'video', 'voice', 'character', 'laugh', 'comedy'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.movie_faceswap;
  }
  if (['dental', 'clinic', 'doctor', 'hospital', 'medical', 'patient', 'health'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.dental_clinic;
  }
  if (['pet', 'pets', 'animal', 'dog', 'cat', 'grooming'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.pet_ecommerce;
  }
  if (['e-commerce', 'ecommerce', 'ecomm', 'store', 'shop', 'marketplace', 'bakery', 'grocery', 'sell'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.ecommerce;
  }
  if (['fintech', 'payment', 'bank', 'wallet', 'fraud', 'trading'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.fintech;
  }
  if (['ai', 'chatbot', 'resume', 'screening', 'ml', 'hiring', 'rag', 'llm'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.ai_rag;
  }
  if (['wordpress', 'elementor', 'cms', 'webflow'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.wordpress;
  }
  if (['car', 'vehicle', 'fleet', 'rental', 'auto', 'taxi'].some(k => lower.includes(k))) {
    return FEATURE_TEMPLATES.car_rental;
  }

  return synthesizeZeroShotFeatures(text);
}

export function runFeatureSuggestionNode(state) {
  const text = state.userInput || "";
  const memory = { ...(state.memory || {}) };
  const features = suggestFeaturesForText(text, memory.projectTitle);

  memory.suggestedFeatures = features;
  memory.conversationPhase = 'features_suggested';

  const totalWeeks = features.reduce((sum, f) => sum + (f.estimatedWeeks || f.durationWeeks || 2), 0);

  let responseText = `Great! I'd love to help you build **${memory.projectTitle || 'Software Application'}**. 🚀\n\n`;
  responseText += `Based on your requirements, here are the **key features** I'd recommend for this project:\n\n`;

  features.forEach((feat, index) => {
    const w = feat.estimatedWeeks || feat.durationWeeks || 2;
    responseText += `**${index + 1}. ${feat.name}** (~${w} week${w > 1 ? 's' : ''})\n${feat.description || feat.name}\n\n`;
  });

  responseText += `📊 **Estimated total development time**: ~${totalWeeks} weeks if all features are included.\n\n`;
  responseText += `Which of these features would you like to include? You can:\n`;
  responseText += `- Say **"all"** to include everything\n`;
  responseText += `- List the numbers you want (e.g. *"1, 2, 4, 5"*)\n`;
  responseText += `- Remove some (e.g. *"skip 3 and 6"*)\n`;
  responseText += `- Add your own custom feature\n\n`;
  responseText += `Once you confirm the features, I'll calculate the **exact timeline and cost estimate** for you.`;

  return {
    ...state,
    memory,
    suggestedFeatures: features,
    response: {
      text: responseText,
      actionType: "chat",
      devMatches: null,
      quickReplies: ["Include all features", "Calculate cost estimate", "Show architecture"],
    },
  };
}
