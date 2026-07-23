import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Building2, Search, Globe, Mail, DollarSign } from 'lucide-react';

export function ClientsPage() {
  const { clients } = useApp();
  const [search, setSearch] = useState('');

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Enterprise Clients Directory ({clients.length} Accounts)
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Global account management database tracking client spending, active projects, and proposal histories.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, industry..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.slice(0, 18).map((client) => (
          <GlassCard key={client.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  {client.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{client.name}</h4>
                  <div className="text-slate-500 text-xs font-medium">{client.industry}</div>
                </div>
              </div>

              <Badge variant={client.status === 'Active' ? 'emerald' : 'indigo'}>
                {client.status}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-semibold text-slate-900">{client.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900">{client.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active SOW Projects:</span>
                <span className="font-bold text-emerald-700">{client.activeProjects} Projects</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Spend:</span>
                <span className="font-extrabold text-emerald-700">${client.totalBudgetSpent.toLocaleString()}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

    </div>
  );
}
