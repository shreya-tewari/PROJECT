import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { exportProposalToPdf } from '../services/exportUtils';
import { FileText, Search, Sparkles, Download, ArrowRight, Building2 } from 'lucide-react';

export function ProposalHistoryPage() {
  const { proposals, setActiveProposal, setActiveTab, showNotification, currentClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Proposals for current client account
  const roleProposals = currentClient?.name
    ? proposals.filter(p => {
        const clientNameLower = (currentClient.name || '').toLowerCase().trim();
        const propClientLower = (p.clientName || '').toLowerCase().trim();
        return propClientLower.includes(clientNameLower) || clientNameLower.includes(propClientLower) || p.isClientCreated;
      })
    : proposals;

  const filteredProposals = roleProposals.filter(p => {
    return p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.proposalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.industry.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectProposal = (prop) => {
    setActiveProposal(prop);
    setActiveTab('preview');
  };

  const handleQuickPdfDownload = (e, prop) => {
    e.stopPropagation();
    showNotification(`Downloading PDF document for ${prop.projectName}...`, "info");
    exportProposalToPdf(prop, `${(prop.projectName || 'Proposal').replace(/[^a-zA-Z0-9]/g, '_')}_Proposal.pdf`);
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            My Proposals & SOW Contracts ({roleProposals.length})
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Displaying proposals & contracts generated for {currentClient?.name || 'your enterprise account'}. Click any record to inspect or download PDF.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('generator')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 shrink-0 transition-all"
        >
          <Sparkles className="w-4 h-4 text-emerald-100" />
          <span>Create New SOW Proposal</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Proposal ID, project title, client, industry..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
          />
        </div>
      </div>

      {/* Proposal Records Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="p-3.5">Proposal ID</th>
                <th className="p-3.5">Project Title & Client</th>
                <th className="p-3.5">Industry</th>
                <th className="p-3.5">Est. Investment</th>
                <th className="p-3.5">Timeline</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No matching proposal records found for this view.
                  </td>
                </tr>
              ) : (
                filteredProposals.slice(0, 30).map((prop) => (
                  <tr 
                    key={prop.proposalId || prop.id} 
                    onClick={() => handleSelectProposal(prop)}
                    className="hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 font-mono text-emerald-800 font-extrabold">{prop.proposalId || prop.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-xs">{prop.projectName}</div>
                      <div className="text-slate-500 text-[10px] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{prop.clientName}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600">{prop.industry}</td>
                    <td className="p-3.5 font-black text-emerald-700 text-xs">${(prop.financials?.grandTotal || prop.estimatedCost || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{prop.timeline?.realisticWeeks || prop.durationWeeks || 12} Weeks</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleQuickPdfDownload(e, prop)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          title="Download PDF Contract"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProposal(prop);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <span>View SOW</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredProposals.length > 30 && (
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
            Showing 30 of {filteredProposals.length} proposal records.
          </div>
        )}
      </GlassCard>

    </div>
  );
}
