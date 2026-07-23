import React from 'react';

export function Badge({ children, variant = 'default', size = 'md' }) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    purple: 'bg-teal-50 text-teal-800 border-teal-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-sm px-3 py-1 font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
