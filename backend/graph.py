import os
import json
import re
from typing import List, Dict, Any, Optional, TypedDict
import urllib.request
import urllib.error

# Attempt to import LangChain and LangGraph modules
try:
    from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
    from langchain_core.prompts import ChatPromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

try:
    from langgraph.graph import StateGraph, START, END
    from langgraph.checkpoint.memory import MemorySaver
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False

# Read Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Define LangGraph Agent State Schema
class AgentState(TypedDict):
    messages: List[Dict[str, Any]]
    memory_context: Dict[str, Any]
    user_input: str
    intent: str
    response: str
    dev_matches: Optional[List[Dict[str, Any]]]
    proposal_data: Optional[Dict[str, Any]]
    action_type: str

# Company Bench Developers Dataset for RAG Node
COMPANY_BENCH_DEVS = [
    {
        "id": 1, "empCode": "EMP-101", "name": "Alex Rivera", "role": "Full Stack Developer", 
        "experienceYears": 6, "hourlyRate": 25, "skills": ["React", "Node.js", "TypeScript", "PostgreSQL"], 
        "status": "Available", "matchPercentage": 98, "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": 2, "empCode": "EMP-102", "name": "Priya Sharma", "role": "AI/ML Engineer", 
        "experienceYears": 5, "hourlyRate": 35, "skills": ["Python", "PyTorch", "OpenAI API", "LangChain", "LangGraph"], 
        "status": "Available", "matchPercentage": 95, "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": 3, "empCode": "EMP-103", "name": "Marcus Vance", "role": "DevOps Engineer", 
        "experienceYears": 8, "hourlyRate": 28, "skills": ["AWS", "Kubernetes", "Terraform", "CI/CD"], 
        "status": "Available", "matchPercentage": 92, "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": 4, "empCode": "EMP-104", "name": "Elena Rostova", "role": "UI/UX Designer", 
        "experienceYears": 4, "hourlyRate": 22, "skills": ["Figma", "Design Systems", "Prototyping", "React"], 
        "status": "Available", "matchPercentage": 89, "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": 5, "empCode": "EMP-105", "name": "David Chen", "role": "Backend Developer", 
        "experienceYears": 7, "hourlyRate": 24, "skills": ["Java", "Spring Boot", "Kafka", "Microservices"], 
        "status": "Available", "matchPercentage": 91, "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    }
]

def call_gemini_llm(prompt: str, system_prompt: str = "", api_key: str = None) -> Optional[str]:
    """Helper to invoke Google Gemini API directly via REST."""
    key = api_key or GEMINI_API_KEY
    if not key or len(key) < 10 or not key.startswith("AIza"):
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"

    contents = []
    if system_prompt:
        contents.append({"role": "user", "parts": [{"text": f"System Context: {system_prompt}"}]})
        contents.append({"role": "model", "parts": [{"text": "Understood. I am ProposalAI Assistant operating with LangChain & LangGraph stateful workflow."}]})

    contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload = {
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1500}
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
    except Exception as e:
        print(f"Gemini LLM REST call note: {e}")
    return None

# LangGraph Node 1: Intent Classifier Node
def intent_classifier_node(state: AgentState) -> AgentState:
    text = (state.get("user_input") or "").lower()

    if any(g in text for g in ["hi", "hy", "hello", "hey", "good morning", "good afternoon", "yo", "greetings"]):
        intent = "GREETING"
    # SOW only if user explicitly says "generate sow/proposal"
    elif ("generate" in text and ("sow" in text or "proposal" in text)) or ("create" in text and "proposal" in text) or text.strip() in ["sow", "generate sow", "generate proposal"]:
        intent = "PROPOSAL_GENERATION"
    # Explicit cost/budget/money queries
    elif any(k in text for k in ["cost", "price", "budget", "budegt", "rate", "quote", "how much", "estimate", "dolar", "dollar", "cheap", "less", "affordable"]):
        intent = "COST_ESTIMATION"
    elif any(k in text for k in ["bench", "developer", "engineer", "who is available", "match developer"]):
        intent = "BENCH_MATCHING"
    elif any(k in text for k in ["architecture", "cloud", "database", "stack", "infrastructure"]):
        intent = "ARCHITECTURE"
    # Project description → discovery (suggest features)
    elif any(k in text for k in ["want", "need", "build", "website", "app", "platform", "portal", "system", "clinic", "store", "shop", "dashboard", "management", "booking", "appointment", "e-commerce"]) and len(text) > 8:
        intent = "PROJECT_DISCOVERY"
    else:
        intent = "GENERAL"

    state["intent"] = intent
    return state

# LangGraph Node 2: Entity & Context Memory Extractor Node
def entity_extractor_node(state: AgentState) -> AgentState:
    text = state.get("user_input") or ""
    lower = text.lower()
    memory = dict(state.get("memory_context") or {})
    tech_stack = list(memory.get("techStack") or [])

    # Low budget detection
    is_low_budget = any(k in lower for k in ["low budget", "budget is low", "small budget", "cheap", "less money", "under $", "wordpress", "cost effective"])
    if is_low_budget:
        memory["isLowBudget"] = True

    # Dynamic Complexity Scoring (1-10)
    complexity = 5
    if any(k in lower for k in ["movie", "face", "swap", "video", "voice", "generative", "deepfake"]): complexity += 4
    if any(k in lower for k in ["ai", "ml", "model", "pytorch", "llm", "rag"]): complexity += 2
    if any(k in lower for k in ["enterprise", "bank", "hipaa", "multi-tenant", "security"]): complexity += 2
    if any(k in lower for k in ["streaming", "real-time", "telemetry", "kafka"]): complexity += 2
    if is_low_budget or any(k in lower for k in ["wordpress", "elementor", "cms"]): complexity -= 3
    if any(k in lower for k in ["landing page", "static", "blog"]): complexity -= 3
    complexity = max(1, min(10, complexity))

    # Name extraction
    name_m = re.search(r"(?:my name is|i am|call me|this is)\s+([A-Za-z]+)", text, re.IGNORECASE)
    if name_m:
        candidate = name_m.group(1).capitalize()
        if candidate.lower() not in ["a", "an", "building", "looking", "trying"]:
            memory["userName"] = candidate

    # Dev Count & Duration
    dev_m = re.search(r"(\d+)\s*(?:developers|devs|engineers|people)", text, re.IGNORECASE)
    wk_m = re.search(r"(\d+)\s*(?:weeks|wks)", text, re.IGNORECASE)
    mn_m = re.search(r"(\d+)\s*(?:months|mths)", text, re.IGNORECASE)

    if dev_m:
        memory["devCount"] = int(dev_m.group(1))
    else:
        memory["devCount"] = 1 if is_low_budget else max(1, min(8, int(round(complexity * 0.75))))

    if wk_m:
        memory["durationWeeks"] = int(wk_m.group(1))
    elif mn_m:
        memory["durationWeeks"] = int(mn_m.group(1)) * 4
    else:
        memory["durationWeeks"] = 3 if is_low_budget else max(3, min(26, int(round(complexity * 2.4))))

    memory["avgHourlyRate"] = 35 if is_low_budget else (65 if complexity >= 8 else (55 if complexity >= 5 else 45))
    memory["cloudCost"] = 150 if is_low_budget else (4500 if complexity >= 8 else (1200 if complexity >= 5 else 400))

    # Tech Stack keywords
    tech_keywords = ["WordPress", "PHP", "Elementor", "WooCommerce", "Supabase", "Firebase", "React", "Node.js", "Python", "TypeScript", "AWS", "PostgreSQL", "Flutter", "LangChain", "LangGraph", "Docker", "Kubernetes", "Kafka", "FFmpeg"]
    for t in tech_keywords:
        if t.lower() in text.lower() and t not in tech_stack:
            tech_stack.append(t)
    memory["techStack"] = tech_stack

    # Dynamic Topic & Title Extraction
    old_title = memory.get("projectTitle")
    new_title = None
    new_ind = None

    if "wordpress" in lower or "elementor" in lower:
        new_title = "WordPress Custom Website"
        new_ind = "CMS & Business Web"
    elif any(k in lower for k in ["movie", "face", "video", "voice", "character", "comedy", "youtube", "laugh", "deepfake"]):
        new_title = "AI Movie & Face-Swap Video Platform"
        new_ind = "Media & Generative AI"
    elif any(k in lower for k in ["e-commerce", "store", "shopping", "bakery", "shop"]):
        new_title = "E-Commerce Platform & Online Store"
        new_ind = "Retail & E-Commerce"
    elif any(k in lower for k in ["fintech", "payment", "banking", "wallet", "fraud"]):
        new_title = "FinTech Payment Gateway Platform"
        new_ind = "FinTech & Payments"
    elif any(k in lower for k in ["telehealth", "health", "medical", "hipaa", "doctor", "clinic", "dental"]):
        new_title = "Dental Clinic Website" if "dental" in lower else "HIPAA Compliant Telehealth Portal"
        new_ind = "Healthcare & Medical"
    elif len(text.strip()) > 10 and not any(k in lower for k in ["remember", "how much"]):
        words = [w.capitalize() for w in text.split() if len(w) > 2 and w.lower() not in ["need", "want", "please", "generate", "create", "build", "for", "this", "app", "with", "my", "budget", "is", "low", "suggest", "nvp", "time", "months", "weeks", "developers"]]
        if len(words) >= 2:
            new_title = " ".join(words[:4]) + " Platform"
            new_ind = "Software & SaaS"

    if new_title and new_title != old_title:
        memory["projectTitle"] = new_title
        memory["industry"] = new_ind
        memory["suggestedFeatures"] = None  # Clear old features for new topic!
        memory["extractedRequirements"] = None
        memory["conversationPhase"] = None

    state["memory_context"] = memory
    return state

# LangGraph Node 3: RAG & Bench Candidates Matcher Node
def rag_retrieval_node(state: AgentState) -> AgentState:
    intent = state.get("intent")
    text = state.get("user_input", "").lower()
    memory = state.get("memory_context", {})
    req_stack = memory.get("techStack") or ["React", "Node.js", "AWS"]
    is_low = memory.get("isLowBudget", False)

    if intent == "BENCH_MATCHING" or any(k in text for k in ["dev", "bench", "react", "python", "engineer", "match"]):
        matched = []
        for dev in COMPANY_BENCH_DEVS:
            if any(s.lower() in text or any(st.lower() in [sk.lower() for sk in dev["skills"]] for st in req_stack) for s in dev["skills"]):
                matched.append(dev)
        devs_list = matched if matched else COMPANY_BENCH_DEVS
        if is_low:
            devs_list = sorted(devs_list, key=lambda d: d["hourlyRate"])
        state["dev_matches"] = devs_list[:3]
    else:
        state["dev_matches"] = None

    return state

# LangGraph Node 4: LangChain LLM Response Generator Node
def llm_generator_node(state: AgentState) -> AgentState:
    user_input = state.get("user_input")
    memory = state.get("memory_context", {})
    intent = state.get("intent")
    devs = state.get("dev_matches")

    # Upfront Calculation for Non-Hallucinated Costs & Allocations
    name_str = f" {memory.get('userName')}" if memory.get("userName") else ""
    stack_str = ", ".join(memory.get("techStack", ["React", "Node.js", "AWS"]))
    is_low = memory.get("isLowBudget", False) or "wordpress" in memory.get("projectTitle", "").lower() or "clinic" in (user_input or "").lower()
    
    text_low = (user_input or "").lower()
    parsed_features = [f.strip() for f in user_input.split(',') if len(f.strip()) > 2] if ',' in user_input else [user_input]
    
    if intent == "COST_ESTIMATION" and len(parsed_features) > 1:
        weeks_cnt = max(4, min(16, len(parsed_features) * 2))
        dev_cnt = max(1, min(4, int(round(len(parsed_features) * 0.8))))
    else:
        weeks_cnt = memory.get("durationWeeks", 3 if is_low else 12)
        dev_cnt = memory.get("devCount", 1 if is_low else 5)

    allocated_devs = (devs or COMPANY_BENCH_DEVS)[:dev_cnt]
    total_hours_per_dev = weeks_cnt * 40
    dev_cost = sum(d["hourlyRate"] * total_hours_per_dev for d in allocated_devs)

    # Cloud & API Domain Calculations
    if any(k in text_low for k in ["movie", "face", "video", "voice", "comedy", "laugh", "generative"]):
        cloud_cost = 4500
        api_cost = 2800
        cloud_desc = "AWS GPU Cluster (g5.xlarge), S3 Video Storage & CloudFront CDN"
        api_desc = "Gemini 1.5 Pro, ElevenLabs Audio & Pinecone Vector DB"
    elif any(k in text_low for k in ["wordpress", "elementor", "cms", "cheap", "clinic"]):
        cloud_cost = 250
        api_cost = 150
        cloud_desc = "Cloudflare Edge CDN, High-Performance WP Hosting & SSL"
        api_desc = "Elementor Pro & WooCommerce Extensions"
    elif any(k in text_low for k in ["telehealth", "health", "doctor", "hipaa"]):
        cloud_cost = 3500
        api_cost = 1800
        cloud_desc = "HIPAA-Compliant AWS Vault & Encrypted RDS Multi-AZ"
        api_desc = "WebRTC Video Suite & Twilio SMS Notifications"
    elif any(k in text_low for k in ["fintech", "fraud", "payment", "bank", "wallet"]):
        cloud_cost = 3800
        api_cost = 2200
        cloud_desc = "PCI-DSS Encrypted Microservices & Redis Cluster"
        api_desc = "Stripe Payment Vault & Fraud Rules Engine"
    else:
        cloud_cost = 1800
        api_cost = 800
        cloud_desc = "AWS ECS Fargate, RDS PostgreSQL Multi-AZ & Redis"
        api_desc = "Stripe, SendGrid, Auth0 & Sentry Telemetry"

    contingency = int(dev_cost * 0.10)
    grand_total = dev_cost + cloud_cost + api_cost + contingency
    low_budget_note = "\n\n💡 **Low-Budget Selection**: Matched our lowest-rate available bench developers starting at **$35/hr**." if is_low else ""
    dev_breakdown_str = "\n".join([f"- **{d['name']}** ({d['role']}) — ${d['hourlyRate']}/hr × {total_hours_per_dev} hrs = **${d['hourlyRate'] * total_hours_per_dev:,}**" for d in allocated_devs])

    calculated_breakdown = (
        f"Here is the realistic cost & developer allocation breakdown for your requirements:\n\n"
        f"### 👥 Allocated Bench Engineering Team ({weeks_cnt} Weeks / {total_hours_per_dev} Hours per Dev):\n"
        f"{dev_breakdown_str}\n\n"
        f"### 💰 Itemized Financial & Delivery Investment Summary:\n"
        f"- **Direct Engineering Allocation**: **${dev_cost:,}** ({len(allocated_devs)} Developer{'s' if len(allocated_devs) > 1 else ''})\n"
        f"- **Cloud Infrastructure Setup ({cloud_desc})**: **${cloud_cost:,}**\n"
        f"- **Third-Party APIs & AI Services ({api_desc})**: **${api_cost:,}**\n"
        f"- **10% Risk & Contingency Buffer**: **${contingency:,}**\n"
        f"- **Estimated Total Investment**: **${grand_total:,} USD**"
        f"{low_budget_note}\n\n"
        f"Click **Generate SOW Proposal Now** below to create your complete client SOW proposal document."
    )

    system_prompt = (
        "You are an Experienced Senior Enterprise Technology Consultant & Presales Solution Architect.\n\n"
        "YOUR ROLE & OBJECTIVES:\n"
        "1. COST ESTIMATION MANDATE: If the user provides a list of features or asks about cost/team/estimation, you MUST use the Calculated Estimate provided below exactly. Do NOT change developer names, rates, weeks, or totals. Present this data in a professional presales consultant tone, highlighting our bench capabilities and Cloud/API choices.\n"
        "2. CONSULTATIVE DISCOVERY: If the user does NOT provide features and just says hello or chat, engage them by asking targeted, insightful discovery questions to refine their requirements.\n"
        "3. FORMATTING: Format all responses cleanly using GitHub Markdown with clear sections, bullet points, and actionable next steps.\n\n"
        f"Active Session Context Memory:\n"
        f"- User Name: {memory.get('userName', 'Valued Client')}\n"
        f"- Target Project: {memory.get('projectTitle', 'Software Application')}\n"
        f"- Preferred Stack: {stack_str}\n"
        f"- Dev Team Size: {dev_cnt} Engineers\n"
        f"- Timeline: {weeks_cnt} Weeks\n\n"
        f"Calculated Estimate (Use this if intent is COST_ESTIMATION):\n"
        f"{calculated_breakdown}"
    )

    prompt = f"User Intent: {intent}\nUser Message: {user_input}"
    if devs:
        dev_summary = "\n".join([f"- **{d['name']}** ({d['role']}) @ ${d['hourlyRate']}/hr" for d in devs])
        prompt += f"\n\nAvailable Bench Developers:\n{dev_summary}"
    
    prompt += f"\n\nTarget calculated estimate data:\n{calculated_breakdown}"

    # Try live Gemini LLM API request
    llm_response = call_gemini_llm(prompt, system_prompt=system_prompt)

    # Synthesize rich Senior Tech Consultant response if external API returns None or templates
    if not llm_response or "top 3 non-negotiable" in llm_response and intent == "COST_ESTIMATION":
        proj_name = memory.get("projectTitle", "Custom Software Application")

        if intent == "GREETING":
            llm_response = (
                f"Hello{name_str}! 👋 I'm your **Senior Technology Consultant**.\n\n"
                f"I specialize in architecting custom software solutions and assembling high-performing engineering teams.\n\n"
                f"To help build an **effective, highly accurate SOW Proposal** for your project, could you share:\n"
                f"1. 🎯 **What core problem or goal does your application solve?**\n"
                f"2. 👥 **Who is your primary target audience / expected user volume?**\n"
                f"3. ⚙️ **Do you have specific tech stack or cloud infrastructure preferences?**\n"
                f"4. 📅 **What is your target launch deadline or budget range?**"
            )
            state["action_type"] = "chat"
        elif intent == "COST_ESTIMATION":
            llm_response = calculated_breakdown
            state["action_type"] = "cost"
        elif intent == "ARCHITECTURE":
            text_low = (user_input or "").lower()
            l1, l2, l3, l4, l5 = "React 18 + Next.js", "Node.js Express / Python FastAPI", "REST APIs", "PostgreSQL + Redis", "AWS ECS Fargate & CloudFront"
            if any(k in text_low for k in ["comedy", "stand-up", "movie", "face", "video", "voice", "laugh"]):
                l1 = "Next.js Web Portal & Mobile Studio UI (Script Editor, Audio/Laugh Track Mixer)"
                l2 = "Python FastAPI High-Performance Microservices Server"
                l3 = "PyTorch Deep Learning Pipeline + OpenAI GPT-4o Script Generator + ElevenLabs Audio Synthesis & FFmpeg Laugh-Track Sync"
                l4 = "PostgreSQL DB (User & Script Catalog) + Pinecone Vector DB + Redis Cache"
                l5 = "AWS GPU Compute Cluster (g5.xlarge Instances), S3 Video Bucket & CloudFront Global CDN"
            elif any(k in text_low for k in ["wordpress", "elementor", "cms"]):
                l1 = "WordPress 6.x Custom Theme & Elementor Pro Interactive Page Builder UI"
                l2 = "PHP 8.2 FastCGI Engine & Custom WordPress REST API Extensions"
                l3 = "WooCommerce E-Commerce Engine + Automated Anti-Spam & SEO Optimization Plugins"
                l4 = "MySQL 8.0 Primary Relational DB + Redis Object Cache & W3 Total Cache"
                l5 = "High-Performance Cloudflare Edge CDN & SSL Secured Web Hosting"

            llm_response = (
                f"### 🏗️ Technical Architecture & Cloud Topology for **{proj_name}**:\n\n"
                f"1. 💻 **Frontend Tier**: {l1}\n"
                f"2. ⚙️ **Backend API Gateway**: {l2}\n"
                f"3. 🤖 **AI / Specialty Pipeline**: {l3}\n"
                f"4. 🗄️ **Persistence & Vector DB**: {l4}\n"
                f"5. ☁️ **Cloud Infrastructure**: {l5}\n\n"
                f"💡 *Architected specifically for {proj_name} based on your requirement details.*"
            )
            state["action_type"] = "chat"
        elif intent == "PROPOSAL_GENERATION":
            llm_response = (
                f"I've structured your requirement analysis{name_str}:\n\n"
                f"- **Target Project**: {proj_name}\n"
                f"- **Recommended Tech Stack**: {stack_str}\n"
                f"- **Engineering Team**: {dev_cnt} Developer{'s' if dev_cnt > 1 else ''}\n"
                f"- **Execution Timeline**: {weeks_cnt} Weeks\n\n"
                f"Click **Generate SOW Proposal Now** below to execute the 7-Agent workflow and generate your complete client proposal document."
            )
            state["action_type"] = "proposal"
        else:
            llm_response = (
                f"I've updated the project context for **{proj_name}**{name_str}.\n\n"
                f"How would you like to proceed?\n"
                f"- 💰 Ask to **estimate cost & timeline** based on your target budget\n"
                f"- 👥 Ask to **match available bench developers**\n"
                f"- 📄 Say **'generate SOW'** to create your complete proposal"
            )
            state["action_type"] = "chat"
    else:
        state["action_type"] = "cost" if intent == "COST_ESTIMATION" else ("proposal" if intent == "PROPOSAL_GENERATION" else "chat")

    state["response"] = llm_response
    return state

# Build Formal LangGraph StateGraph Workflow
def build_langgraph_workflow():
    if not HAS_LANGGRAPH:
        return None

    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("classifier", intent_classifier_node)
    workflow.add_node("extractor", entity_extractor_node)
    workflow.add_node("rag_retriever", rag_retrieval_node)
    workflow.add_node("llm_generator", llm_generator_node)

    # Set Edges
    workflow.add_edge(START, "classifier")
    workflow.add_edge("classifier", "extractor")
    workflow.add_edge("extractor", "rag_retriever")
    workflow.add_edge("rag_retriever", "llm_generator")
    workflow.add_edge("llm_generator", END)

    return workflow.compile()

# Instantiated LangGraph App
langgraph_app = build_langgraph_workflow()

def execute_langgraph_pipeline(user_input: str, history: List[Dict[str, Any]] = [], memory_context: Dict[str, Any] = {}) -> Dict[str, Any]:
    """Executes the complete LangGraph & LangChain pipeline for a turn."""
    initial_state: AgentState = {
        "messages": history,
        "memory_context": memory_context or {},
        "user_input": user_input,
        "intent": "GENERAL",
        "response": "",
        "dev_matches": None,
        "proposal_data": None,
        "action_type": "chat"
    }

    if langgraph_app:
        try:
            final_state = langgraph_app.invoke(initial_state)
            return {
                "response": final_state.get("response"),
                "memory": final_state.get("memory_context"),
                "intent": final_state.get("intent"),
                "devMatches": final_state.get("dev_matches"),
                "actionType": final_state.get("action_type")
            }
        except Exception as e:
            print(f"LangGraph execution note: {e}")

    # Direct node chain fallback
    s1 = intent_classifier_node(initial_state)
    s2 = entity_extractor_node(s1)
    s3 = rag_retrieval_node(s2)
    s4 = llm_generator_node(s3)

    return {
        "response": s4.get("response"),
        "memory": s4.get("memory_context"),
        "intent": s4.get("intent"),
        "devMatches": s4.get("dev_matches"),
        "actionType": s4.get("action_type")
    }
