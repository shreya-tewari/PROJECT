import React from 'react';
import { useApp } from '../context/AppContext';
import { Navigation } from '../components/layout/Navigation';
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  BotMessageSquare, 
  Layers, 
  FileText
} from 'lucide-react';

export function LandingPage() {
  const { setActiveTab, loginAsClient, clients } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Enterprise SOW & Available Developer Intelligence Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-5">
          AI Proposal Generation & Developer Optimization
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Automate client requirement parsing, past proposal matching, developer allocation, and proposal generation in under 3 minutes.
        </p>
      </section>

      {/* KPI Stats Bar */}
      <section className="border-y border-slate-200 bg-white py-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">$12.8M</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Proposals Won</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">94.6%</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Win Rate Score</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100+</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Available Devs</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-700">&lt; 3 Mins</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Generation Time</div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Platform Workflow</h2>
          <p className="text-slate-500 text-xs font-medium">AI agents orchestrate requirement extraction, developer matching, and proposal generation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Natural Prompt Input", desc: "Type project requirements or upload brief summary.", icon: BotMessageSquare },
            { step: "02", title: "Requirement Parsing", desc: "Extracts scope, architecture, and deliverables.", icon: Layers },
            { step: "03", title: "Dev Team Matching", desc: "Scans available developers for skill fit.", icon: Users },
            { step: "04", title: "Export Proposal SOW", desc: "Generates consulting PDF, Word document & quote.", icon: FileText }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm shadow-emerald-950/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Step {s.step}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-slate-100/60 border-t border-slate-200 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <Users className="w-6 h-6 text-emerald-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Available Developer Intelligence</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Maintain a real-time roster of 100+ developers. Automatically match skill profiles, hourly rates, and availability.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <BotMessageSquare className="w-6 h-6 text-emerald-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">AI Requirement Assistant</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Interactive chatbot to clarify complex software requirements and generate complete SOW proposals directly.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <FileText className="w-6 h-6 text-emerald-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Instant Proposal Export</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Generate formatted PDF/Word proposal documents with milestone breakdowns and transparent pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-slate-500 text-xs text-center">
        <div>© 2026 ProposalAI Enterprise Platform. Built for IT services & software development companies.</div>
      </footer>
    </div>
  );
}
