/**
 * Prompt Templates Module for Gemini / LLM / SOW Generation
 */

export function buildSowPromptTemplate({
  projTitle,
  clientName,
  industry,
  cleanTitle,
  userInput,
  stack,
  devCount,
  totalHrs,
  duration,
  benchDevs,
  devBreakdownForSow,
  devCost,
  cloudCost,
  contingency,
  grandTotal,
  extractedRequirements
}) {
  const devListContext = benchDevs.map(d => `${d.name} (${d.role}, $${d.hourlyRate}/hr, ${d.experienceYears}yrs exp)`).join(', ');

  return `You are an expert Enterprise Technology Consultant generating a professional Scope of Work (SOW) Proposal.

PROJECT CONTEXT:
- Project Name: ${projTitle}
- Client: ${clientName}
- Industry: ${industry}
- Mentioned Requirements: ${cleanTitle || userInput || 'General enterprise software platform'}
- Preferred Tech Stack: ${stack.join(', ')}
- Team Size: ${devCount} developers
- Total Project Effort: ${totalHrs} person-hours (FIXED regardless of team size)
- Calendar Timeline: ${duration} weeks delivery
- Available Engineers: ${devListContext}

CRITICAL PRICING & ALLOCATION MODEL:
Total effort = ${totalHrs} person-hours split across allocated developers by role.
Role-based hour allocation:
${devBreakdownForSow.map(d => `- ${d.name} (${d.role}): ${d.hours} hrs × $${d.hourlyRate}/hr = $${d.cost.toLocaleString()}`).join('\n')}
Total Engineering Cost: $${devCost.toLocaleString()}

OUTPUT FORMAT (STRICT REQUIREMENT - Output in exact GitHub Markdown with these EXACT headings):

# Project Summary

- **Project Type**: ${industry} Platform (${projTitle})
- **Complexity**: ${totalHrs >= 1200 ? 'Enterprise' : totalHrs >= 750 ? 'Large' : totalHrs >= 400 ? 'Medium' : 'Small'} — Project requires modular frontend, backend microservices, security compliance, and automated deployment pipelines.
- **Major Features**: ${extractedRequirements?.join(', ') || 'Core Workflow Engine, User Authentication, Admin Dashboard, Payment Gateway, Real-Time Telemetry'}
- **Total Engineering Hours**: ${totalHrs} Person-Hours
- **Recommended Team**: ${benchDevs.map(d => d.role).join(', ')} (${devCount} Developers)
- **Timeline**: ${duration} Weeks (${Math.ceil(duration / 4)} Month${Math.ceil(duration / 4) > 1 ? 's' : ''})
- **Milestones**:
  - **Sprint 1-2**: Technical Specification, Data Modeling & CI/CD Cloud Setup
  - **Sprint 3-${Math.round(duration * 0.5)}**: Backend APIs, Database Schemas & Core Microservices
  - **Sprint ${Math.round(duration * 0.5) + 1}-${Math.round(duration * 0.85)}**: Frontend Integration, Payment Gateway & Admin Console
  - **Sprint ${Math.round(duration * 0.85) + 1}-${duration}**: Security Audit, End-to-End QA Testing & Production Deployment

---

# Engineering Team

| Developer Name | Role | Hourly Rate | Allocated Hours | Cost |
| :--- | :--- | :--- | :--- | :--- |
${devBreakdownForSow.map(d => `| ${d.name} | ${d.role} | $${d.hourlyRate}/hr | ${d.hours} hrs | $${d.cost.toLocaleString()} |`).join('\n')}

---

# Financial Summary

| Item | Description | Cost |
| :--- | :--- | :--- |
| **Engineering** | Total Engineering Labor (${totalHrs} Person-Hours) | $${devCost.toLocaleString()} |
| **Infrastructure** | Database, Server & CI/CD Pipeline Setup | $500 |
| **Third-Party APIs** | External Service Integrations & Payments | $1,500 |
| **Cloud** | Managed Cloud Infrastructure Hosting | $1,500 |
| **Deployment** | Production Cutover, Security & SSL Setup | $500 |
| **Contingency (10%)** | Risk Reserve & Technical Buffer | $${Math.round(devCost * 0.10).toLocaleString()} |
| **Grand Total** | **Total Project Investment** | **$${(devCost + 4000 + Math.round(devCost * 0.10)).toLocaleString()} USD** |

---

# Assumptions

- **Key Assumptions**: Client will provide timely feedback within 48 hours for sprint reviews; API credentials and access will be provisioned during Sprint 1.
- **Excluded Features**: Physical hardware integration, custom video streaming infrastructure from scratch, legacy data migration over 100GB.
- **Optional Future Enhancements**: Advanced AI Predictive Analytics, Native Mobile Application Wrappers, Multi-Region Active-Active Database Replication.

IMPORTANT RULES:
- Use the EXACT numbers provided above — do NOT alter calculated costs or hours
- Format everything in clean GitHub Markdown with exact section headings
- Do NOT add any preamble or text before '# Project Summary'`;
}

export function buildGeneralChatSystemPrompt(memory, userInput) {
  return `You are ProposalAI Assistant, an expert enterprise presales consultant.
User Context Memory:
- Name: ${memory.userName || 'Client'}
- Project: ${memory.projectTitle || 'Software App'}
- Tech Stack: ${memory.techStack?.join(', ') || 'React, Node.js, AWS'}

Respond like ChatGPT: helpful, structured using clean GitHub markdown formatting. Be conversational and professional.
Do NOT generate cost estimates or pricing unless the user explicitly asks for cost/price/budget.
Do NOT assign developers or allocate teams unless asked.

User Question: ${userInput}`;
}
