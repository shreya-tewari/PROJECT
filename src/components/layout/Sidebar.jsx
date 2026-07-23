import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  BotMessageSquare, 
  FileText, 
  LogOut,
  Globe,
  Menu,
  X
} from 'lucide-react';

export function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    proposals, 
    currentUser,
    currentClient, 
    logoutPortal 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clientProposals = proposals.filter(p => {
    const cName = (currentClient?.name || '').toLowerCase();
    const pClient = (p.clientName || '').toLowerCase();
    return pClient.includes(cName) || cName.includes(pClient) || p.isClientCreated;
  });

  const clientNavItems = [
    { id: 'aichat', label: 'AI Chat', fullLabel: 'AI Requirement Assistant', icon: BotMessageSquare, highlight: true },
    { id: 'generator', label: 'Proposal AI', fullLabel: 'Create AI Proposal', icon: Sparkles },
    { id: 'history', label: 'My Proposals', fullLabel: 'My Proposals', icon: FileText, badge: clientProposals.length },
  ];

  return (
    <>
      {/* 1. Mobile Top Header Bar (< md screens) */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            P
          </div>
          <span className="font-extrabold text-sm text-slate-900">
            Proposal<span className="text-emerald-600">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('landing')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1"
          >
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>Site</span>
          </button>

          <button
            onClick={logoutPortal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Desktop Sidebar (>= md screens) */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 text-slate-700 flex-col justify-between h-screen sticky top-0 shrink-0 shadow-sm">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div 
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                P
              </div>
              <span className="font-extrabold text-sm text-slate-900">
                Proposal<span className="text-emerald-600">AI</span>
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-2 py-3 space-y-0.5">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Client Navigation
            </div>

            {clientNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.fullLabel}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Profile Section */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md font-bold flex items-center justify-center border text-[11px] shrink-0 bg-emerald-100 text-emerald-800 border-emerald-200">
                CL
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-[11px] truncate">
                  {currentUser?.name || currentClient?.name || 'Enterprise Client'}
                </div>
                <div className="text-slate-500 text-[10px] truncate">
                  {currentUser?.email || currentClient?.name || 'Client Access Portal'}
                </div>
              </div>
            </div>

            <button
              onClick={logoutPortal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Log out to Portal Entry Gate"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Mobile Bottom Navigation Bar (< md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around shadow-lg">
        {clientNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
