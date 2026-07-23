import React from 'react';

export function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`
      rounded-xl bg-white border border-slate-200/90 p-5 
      shadow-sm shadow-emerald-950/5 text-slate-900 transition-all duration-200
      ${hover ? 'hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}
