import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Sparkles, LogOut, User } from 'lucide-react';

export function Navigation() {
  const { 
    setActiveTab, 
    openAuthPage,
    isLoggedIn,
    currentUser,
    logoutPortal
  } = useApp();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
            P
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Proposal<span className="text-emerald-600">AI</span>
            </span>
          </div>
        </div>

        {/* Right Actions: Login & Sign Up Authentication Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openAuthPage('login')}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Login</span>
          </button>

          <button
            onClick={() => openAuthPage('signup')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Sign Up</span>
          </button>

          {isLoggedIn && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600" />
                {currentUser?.name?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={logoutPortal}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}



