import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportProposalToPdf, exportProposalToWord, generateProposalEmailBody } from '../services/exportUtils';
import { Badge } from '../components/ui/Badge';
import { 
  Download, 
  FileSpreadsheet, 
  Mail, 
  ExternalLink
} from 'lucide-react';

export function ProposalPreviewPage() {
  const { activeProposal, showNotification, setSelectedDevForProfile, currentUser } = useApp();
  const [signed, setSigned] = useState(false);
  const [signerName, setSignerName] = useState("");

  if (!activeProposal) {
    return (
      <div className="p-10 text-center text-slate-400 text-xs">
        No proposal selected. Please generate a new proposal or select one from history.
      </div>
    );
  }

  const p = activeProposal;
  const effectiveClientName = (p?.clientName && !p.clientName.endsWith('Corp') && p.clientName !== 'Enterprise Account' && p.clientName !== 'FinTech Global Labs')
    ? p.clientName
    : (currentUser?.name || currentUser?.companyName || p.clientName);
  const effectiveClientEmail = (p.clientEmail && !p.clientEmail.endsWith('@client.com'))
    ? p.clientEmail
    : (currentUser?.email || p.clientEmail || 'contact@client.com');

  const handlePdfExport = () => {
    showNotification("Downloading PDF document...", "info");
    exportProposalToPdf(p, `${(p.projectName || 'Proposal').replace(/[^a-zA-Z0-9]/g, '_')}_Proposal.pdf`);
  };

  const handleWordExport = () => {
    exportProposalToWord(p, `${p.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Proposal.doc`);
    showNotification("Downloading Word document...", "info");
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-5xl mx-auto">
      
      {/* Export Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Badge variant="emerald">{p.proposalId}</Badge>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Consulting SOW Proposal Preview</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePdfExport}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleWordExport}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Word</span>
          </button>

          <a
            href={generateProposalEmailBody(p)}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-600" />
            <span>Email Client</span>
          </a>
        </div>
      </div>

      {/* Printable SOW Document */}
      <div 
        id="proposal-document-element"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl space-y-8 font-sans border border-slate-200"
      >
        
        {/* Header */}
        <div className="border-b-2 border-indigo-900 pb-6 flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-extrabold text-indigo-700 mb-1">
              Statement of Work & Proposal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {p.projectName}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white font-black text-lg flex items-center justify-center ml-auto mb-1">
              P
            </div>
            <div className="font-bold text-slate-900">{p.companyName}</div>
            <div>Date: {p.createdAt || new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Client Details Section */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">Client Contact Information:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <span className="text-slate-500 block">Client Name:</span>
              <span className="font-bold text-slate-900">{effectiveClientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Client Email:</span>
              <a href={`mailto:${effectiveClientEmail}`} className="font-bold text-indigo-700 hover:underline">
                {effectiveClientEmail}
              </a>
            </div>
            <div>
              <span className="text-slate-500 block">Client Phone No:</span>
              <a href={`tel:${p.clientPhone || '+1 (555) 019-2831'}`} className="font-bold text-slate-900 hover:underline">
                {p.clientPhone || '+1 (555) 019-2831'}
              </a>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1">1. Executive Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {p.executiveSummary}
          </p>
        </div>

        {/* Assigned Bench Resources Table (CLEAN & PROFESSIONAL - NO TALK BUTTONS) */}
        <div>
          <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-2 mb-3">2. Assigned Engineering Team</h2>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Employee Code</th>
                <th className="p-2.5">Role</th>
                <th className="p-2.5">Developer Name</th>
                <th className="p-2.5">Experience</th>
                <th className="p-2.5 text-right">Billing Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {p.teamStructure && p.teamStructure.map((dev) => (
                <tr key={dev.id}>
                  <td className="p-2.5 font-mono font-bold text-indigo-700">
                    <button
                      onClick={() => setSelectedDevForProfile(dev)}
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>{dev.empCode || dev.id}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="p-2.5 font-semibold text-slate-900">{dev.role}</td>
                  <td className="p-2.5">{dev.name}</td>
                  <td className="p-2.5">{dev.experienceYears} Yrs</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">${dev.hourlyRate || 60}/hr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Estimate Breakup Table */}
        <div>
          <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-2 mb-3">3. Detailed Estimate & Financial Breakup</h2>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2">Item Description</th>
                <th className="p-2">Employee Code</th>
                <th className="p-2 text-right">Est. Hours</th>
                <th className="p-2 text-right">Rate ($/hr)</th>
                <th className="p-2 text-right">Line Total (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {p.estimateBreakup ? p.estimateBreakup.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-medium">{row.item}</td>
                  <td className="p-2 font-mono font-bold text-indigo-700">{row.empCode}</td>
                  <td className="p-2 text-right">{row.hours} hrs</td>
                  <td className="p-2 text-right">${row.rate}</td>
                  <td className="p-2 text-right font-bold">${row.total.toLocaleString()}</td>
                </tr>
              )) : (
                <>
                  <tr>
                    <td className="p-2 font-medium">Core Full Stack & AI Engineering</td>
                    <td className="p-2 font-mono font-bold text-indigo-700">EMP-101</td>
                    <td className="p-2 text-right">480 hrs</td>
                    <td className="p-2 text-right">$60</td>
                    <td className="p-2 text-right font-bold">${(p.financials?.devCost || 65000).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Cloud Infrastructure & API Overhead</td>
                    <td className="p-2 font-mono font-bold text-slate-500">N/A</td>
                    <td className="p-2 text-right">1</td>
                    <td className="p-2 text-right">$3500</td>
                    <td className="p-2 text-right font-bold">$3,500</td>
                  </tr>
                </>
              )}
              <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={4} className="p-2.5 text-right font-extrabold text-xs">Grand Final Quotation:</td>
                <td className="p-2.5 text-right font-extrabold text-sm text-indigo-900">
                  ${(p.financials?.grandTotal || p.estimatedCost || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Recommended Tech Stack & System Architecture */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1">4. Recommended Tech Stack & System Architecture</h2>
          <div className="flex flex-wrap gap-1.5 pb-1">
            {p.techStack && p.techStack.map((tech, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200">
                {tech}
              </span>
            ))}
          </div>

          {p.architecture && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><span className="font-bold text-slate-900">Frontend:</span> <span className="text-slate-700">{p.architecture.frontend}</span></div>
              <div><span className="font-bold text-slate-900">Backend API:</span> <span className="text-slate-700">{p.architecture.backend}</span></div>
              <div><span className="font-bold text-slate-900">Database & Cache:</span> <span className="text-slate-700">{p.architecture.database}</span></div>
              <div><span className="font-bold text-slate-900">Cloud & DevOps:</span> <span className="text-slate-700">{p.architecture.cloudInfra}</span></div>
            </div>
          )}
        </div>

        {/* Section 5: Sprint Timeline & Milestone Deliverables */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1">
            5. Sprint Timeline & Delivery Milestones ({p.timeline?.realisticWeeks || p.durationWeeks || 12} Weeks Total)
          </h2>
          {p.timeline?.sprints && (
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 w-28">Sprint</th>
                  <th className="p-2 w-48">Core Focus Area</th>
                  <th className="p-2">Milestone Deliverables</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {p.timeline.sprints.map((s, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold text-indigo-900">{s.sprint}</td>
                    <td className="p-2 font-medium text-slate-900">{s.focus}</td>
                    <td className="p-2 text-slate-700">{s.deliverables}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t-2 border-slate-200">
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <div className="text-slate-500 font-medium">Provider Signature ({p.companyName}):</div>
              <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-serif text-sm italic text-indigo-900 font-bold">
                Alex Vance (Director of Presales)
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-slate-500 font-medium">Client Acceptance ({p.clientName}):</div>
              {signed ? (
                <div className="h-10 border-b border-emerald-600 flex items-end pb-1 font-serif text-sm italic text-emerald-700 font-bold">
                  {signerName || "Client Executive Signer"} (Verified Signature)
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Type Name to Sign..."
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded text-xs text-slate-900 w-full"
                  />
                  <button
                    onClick={() => setSigned(true)}
                    className="px-3 py-1.5 bg-indigo-900 text-white rounded font-bold text-xs shrink-0"
                  >
                    Sign Contract
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
