import os
import json
import re
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import urllib.request
import urllib.error

# Import LangChain & LangGraph Stateful Pipeline
from graph import execute_langgraph_pipeline, call_gemini_llm

# Read Gemini API Key exclusively from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

app = FastAPI(
    title="ProposalAI LangChain + LangGraph FastAPI Backend",
    description="Enterprise Presales AI Backend powered by LangChain, LangGraph StateGraph, FastAPI, and Google Gemini LLM API",
    version="2.0.0"
)

# Enable CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Data Models
class ChatTurnRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []
    memory: Optional[Dict[str, Any]] = None
    apiKey: Optional[str] = None

class ProposalGenRequest(BaseModel):
    companyName: Optional[str] = "ProposalAI Solutions"
    clientName: Optional[str] = "Enterprise Account"
    projectName: str
    industry: Optional[str] = "Software & SaaS"
    promptText: Optional[str] = ""
    selectedTech: Optional[List[str]] = []
    devCount: Optional[int] = 5
    durationWeeks: Optional[int] = 12

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ProposalAI LangChain + LangGraph FastAPI Backend",
        "frameworks": ["FastAPI", "LangChain", "LangGraph", "Google Gemini API"],
        "version": "2.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "gemini_key_configured": bool(GEMINI_API_KEY),
        "langgraph_active": True,
        "langchain_active": True
    }

TECH_CONSULTANT_SYSTEM_PROMPT = """You are an Experienced Senior Enterprise Technology Consultant & Presales Solution Architect.

YOUR ROLE & OBJECTIVES:
1. CONSULTATIVE DISCOVERY: Act as an experienced, consultative Tech Consultant. Engage the user proactively by asking targeted, insightful, and highly useful discovery questions. Your primary goal is to gather the maximum amount of information regarding their requirements, including:
   - Core Business Objectives & Problem Statement
   - Target Audience, Expected User Volume & Scale Requirements
   - Non-negotiable MVP Features & Key Functionalities
   - Preferred Tech Stack, Frameworks & Cloud Infrastructure
   - Security, Compliance Standards (e.g., HIPAA, GDPR, SOC2) & Third-Party API Integrations
   - Target Launch Deadlines, Delivery Milestones & Budget Constraints

2. REQUIREMENT ANALYSIS: Thoroughly analyze all gathered information, user inputs, and session context to identify technical constraints, architectural risks, feasibility, and optimal design patterns.

3. EFFECTIVE PROPOSAL GENERATION: Synthesize and transform analyzed requirements into a comprehensive, highly persuasive, and effective Scope of Work (SOW) Proposal containing:
   - Executive Summary & Project Vision
   - Technical Architecture & Infrastructure Blueprint
   - Development Roadmap, Sprint Breakdown & Milestones
   - Dedicated Engineering Team Structure & Skill Allocation
   - Realistic Cost Quotation & Investment Schedule

COMMUNICATION & FORMATTING STANDARDS:
- Maintain a highly professional, consultative, articulate, and empathetic tone.
- Always format responses cleanly using GitHub Markdown with bullet points, bold key terms, clear sections, and structured callouts.
- Ask precise, high-value questions whenever details are missing or underspecified.
- Provide actionable next steps to guide the user seamlessly from initial discovery to a finalized proposal."""

@app.post("/api/chat")
def chat_turn(req: ChatTurnRequest):
    """Executes a LangGraph + LangChain stateful conversation turn."""
    user_input = req.message
    history = req.history or []
    memory = req.memory or {}

    try:
        # Run stateful LangGraph graph pipeline
        result = execute_langgraph_pipeline(
            user_input=user_input,
            history=history,
            memory_context=memory
        )

        return {
            "response": result.get("response"),
            "memory": result.get("memory"),
            "intent": result.get("intent"),
            "devMatches": result.get("devMatches"),
            "actionType": result.get("actionType", "chat")
        }
    except Exception as e:
        print(f"Error in LangGraph chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-proposal")
def generate_proposal(req: ProposalGenRequest):
    """Executes multi-agent proposal generation using Senior Tech Consultant prompt & Gemini API."""
    key = GEMINI_API_KEY
    system_prompt = (
        f"{TECH_CONSULTANT_SYSTEM_PROMPT}\n\n"
        "Task: Analyze the client's requirements and draft a comprehensive, high-impact Scope of Work (SOW) Executive Summary and Technical Architecture."
    )

    prompt = (
        f"Generate SOW proposal for:\n"
        f"- Project: {req.projectName}\n"
        f"- Client: {req.clientName}\n"
        f"- Industry: {req.industry}\n"
        f"- Tech Stack: {', '.join(req.selectedTech) if req.selectedTech else 'React, Node.js, AWS'}\n"
        f"- Team Size: {req.devCount} Developers\n"
        f"- Timeline: {req.durationWeeks} Weeks\n"
        f"- Prompt Brief: {req.promptText}"
    )

    summary_text = call_gemini_llm(prompt, system_prompt=system_prompt, api_key=key)
    total_cost = req.devCount * 40 * req.durationWeeks * 65 + 3500

    return {
        "proposalId": f"PROP-{os.urandom(2).hex().upper()}",
        "companyName": req.companyName,
        "clientName": req.clientName,
        "projectName": req.projectName,
        "industry": req.industry,
        "createdAt": "2026-07-21",
        "techStack": req.selectedTech or ["React", "Node.js", "AWS", "PostgreSQL"],
        "executiveSummary": summary_text,
        "estimatedCost": total_cost,
        "durationWeeks": req.durationWeeks,
        "assignedDevsCount": req.devCount,
        "status": "Won"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
