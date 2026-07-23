import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { matchBenchDevelopers } from '../services/ragEngine';
import { 
  Users, 
  Search, 
  Sparkles, 
  Star, 
  Video, 
  FileText, 
  Download, 
  Phone, 
  Mail, 
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';

export function BenchDevelopersPage() {
  const { benchDevs, updateDevStatus, setSelectedDevForProfile, setSelectedDevForVideoCall } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Available');
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [optimizerTech, setOptimizerTech] = useState(['React', 'Node.js', 'AWS', 'PostgreSQL']);
  const [optimizedTeam, setOptimizedTeam] = useState(null);

  const rolesList = ['All', 'Full Stack Developer', 'AI/ML Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Backend Developer', 'Mobile Developer', 'Solution Architect', 'QA Engineer', 'React Developer', 'Node Developer', 'Python Developer'];

  const filteredDevs = benchDevs.filter(dev => {
    const matchesSearch = dev.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dev.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'All' || dev.role.includes(selectedRole);
    const matchesStatus = selectedStatus === 'All' || dev.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRunOptimizer = () => {
    const team = matchBenchDevelopers(optimizerTech, 5);
    setOptimizedTeam(team);
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Available Developers Intelligence ({benchDevs.length} Engineers)
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Click any <span className="font-mono text-emerald-700 font-bold">Employee Code (e.g. EMP-101)</span> to view full profile details & download resume PDF, or click <span className="font-bold text-emerald-700">Talk to Developer</span> for instant video call & chat.
          </p>
        </div>

        <button
          onClick={() => {
            setShowOptimizerModal(true);
            handleRunOptimizer();
          }}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shrink-0 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Team Optimizer</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee Code (EMP-101), dev name, skill..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {rolesList.map(r => <option key={r} value={r}>Role: {r}</option>)}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available For Allocation</option>
            <option value="Allocated">Currently Allocated</option>
            <option value="On Notice">On Notice</option>
          </select>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevs.slice(0, 30).map((dev) => (
          <GlassCard key={dev.id} className="flex flex-col justify-between">
            <div>
              {/* Header with Employee Code Link */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 cursor-pointer shadow-sm"
                    onClick={() => setSelectedDevForProfile(dev)}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 
                        onClick={() => setSelectedDevForProfile(dev)}
                        className="font-bold text-slate-900 text-sm hover:text-emerald-600 cursor-pointer transition-colors"
                      >
                        {dev.name}
                      </h4>
                    </div>
                    {/* Clickable Employee Code Link */}
                    <button
                      onClick={() => setSelectedDevForProfile(dev)}
                      className="font-mono text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{dev.empCode}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </button>
                  </div>
                </div>

                <Badge variant={dev.status === 'Available' ? 'emerald' : dev.status === 'Allocated' ? 'indigo' : 'amber'}>
                  {dev.status}
                </Badge>
              </div>

              {/* Role & Contact Info */}
              <div className="text-slate-500 text-xs font-semibold mb-2">{dev.role} • {dev.experienceYears} Yrs Exp</div>

              <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <a href={`mailto:${dev.email}`} className="text-slate-900 hover:underline font-medium truncate max-w-[160px]">{dev.email}</a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone:</span>
                  <a href={`tel:${dev.phone}`} className="text-slate-900 hover:underline font-medium">{dev.phone}</a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hourly Rate:</span>
                  <span className="text-emerald-700 font-extrabold">${dev.hourlyRate}/hr</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {dev.skills.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action CTAs: Talk to Dev & View Profile */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedDevForVideoCall(dev)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Talk to Dev</span>
              </button>

              <button
                onClick={() => setSelectedDevForProfile(dev)}
                className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                title="View Details & Resume PDF"
              >
                Profile & PDF
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Bench Optimizer Modal */}
      {showOptimizerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 text-slate-900 shadow-2xl relative">
            <button onClick={() => setShowOptimizerModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-4">AI Team Recommendation</h3>

            <div className="space-y-3 text-xs mb-4">
              <div className="font-semibold text-slate-600">Target Tech Stack:</div>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'Flutter'].map(t => (
                  <button
                    key={t}
                    onClick={() => setOptimizerTech(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                    className={`px-2.5 py-1 rounded border font-semibold ${optimizerTech.includes(t) ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {optimizedTeam && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {optimizedTeam.map(dev => (
                  <div key={dev.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={dev.avatar} alt={dev.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{dev.name}</span>
                          <span className="font-mono text-emerald-700 text-[10px]">({dev.empCode})</span>
                        </div>
                        <div className="text-slate-500 text-[10px]">{dev.role} • ${dev.hourlyRate}/hr</div>
                      </div>
                    </div>
                    <Badge variant="emerald">{dev.matchPercentage}% Match</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
