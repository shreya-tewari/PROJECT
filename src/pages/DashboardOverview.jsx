import React from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Building2, 
  TrendingUp, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export function DashboardOverview() {
  const { proposals, benchDevs, clients, setActiveTab, setActiveProposal } = useApp();

  const availableCount = benchDevs.filter(d => d.status === "Available").length;
  const allocatedCount = benchDevs.filter(d => d.status === "Allocated").length;
  const noticeCount = benchDevs.filter(d => d.status === "On Notice").length;

  const totalWonValue = proposals.filter(p => p.status === "Won").reduce((acc, p) => acc + (p.financials?.grandTotal || p.estimatedCost || 0), 0);

  const revenueData = [
    { month: 'Jan', revenue: 420000 },
    { month: 'Feb', revenue: 510000 },
    { month: 'Mar', revenue: 680000 },
    { month: 'Apr', revenue: 620000 },
    { month: 'May', revenue: 840000 },
    { month: 'Jun', revenue: 950000 },
    { month: 'Jul (Est)', revenue: 1100000 },
    { month: 'Aug (Est)', revenue: 1300000 },
  ];

  const benchChartData = [
    { name: 'Available Developers', value: availableCount, color: '#10b981' },
    { name: 'Active Allocated', value: allocatedCount, color: '#6366f1' },
    { name: 'On Notice', value: noticeCount, color: '#f59e0b' },
  ];

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto">
      
      {/* Top Banner CTA */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Developer & Proposal Intelligence
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {availableCount} Available Developers Ready for Allocation
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            Generate SOW proposals with instant vector context and exact developer skill matching.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('bench')}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Users className="w-3.5 h-3.5" />
          <span>View Available Developers</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Proposals</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{proposals.length}</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> 94.6% Win Rate Score
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">${(totalWonValue / 1000000).toFixed(2)}M</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Won Contracts</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Developers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{availableCount} Devs</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Immediate Allocation</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Clients</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{clients.length} Enterprise</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Global Accounts</div>
        </GlassCard>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Revenue Forecast Area Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Revenue & Pipeline Forecast</h3>
              <p className="text-slate-500 text-[11px]">Actual vs forecasted proposal conversions (USD)</p>
            </div>
            <Badge variant="emerald">12-Month Projection</Badge>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bench Status Donut */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900">Developer Allocation Status</h3>
            <Badge variant="emerald">Live Roster</Badge>
          </div>

          <div className="h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={benchChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {benchChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            {benchChartData.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-[11px] font-medium">{b.name}</span>
                </div>
                <span className="font-bold text-slate-900 text-[11px]">{b.value} Devs</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Proposals History Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Proposals</h3>
            <p className="text-slate-500 text-[11px]">Latest client proposals & estimated project budgets</p>
          </div>

          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
          >
            <span>View All ({proposals.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Project & Client</th>
                <th className="p-2.5">Industry</th>
                <th className="p-2.5">Est. Budget</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {proposals.slice(0, 5).map((prop) => (
                <tr key={prop.proposalId || prop.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="p-2.5 font-mono text-emerald-800 font-bold">{prop.proposalId || prop.id}</td>
                  <td className="p-2.5">
                    <div className="font-bold text-slate-900">{prop.projectName}</div>
                    <div className="text-slate-500 text-[10px]">{prop.clientName}</div>
                  </td>
                  <td className="p-2.5 font-medium text-slate-700">{prop.industry}</td>
                  <td className="p-2.5 font-extrabold text-emerald-700">${(prop.financials?.grandTotal || prop.estimatedCost || 0).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-700 font-medium">{prop.timeline?.realisticWeeks || prop.durationWeeks || 12} Weeks</td>
                  <td className="p-2.5">
                    <Badge variant={prop.status === 'Won' ? 'emerald' : prop.status === 'Sent' ? 'indigo' : 'amber'}>
                      {prop.status}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => {
                        setActiveProposal(prop);
                        setActiveTab('preview');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white border border-slate-200 text-slate-700 font-semibold transition-colors"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
}
