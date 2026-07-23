import React from 'react';
import { Badge } from '../ui/Badge';
import { 
  X, 
  Download, 
  Video, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Award, 
  Briefcase, 
  Clock, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export function DeveloperProfileModal({ developer, onClose, onTalkToDeveloper }) {
  if (!developer) return null;

  const handleDownloadResume = () => {
    // Generate simulated resume PDF file download
    const content = `
============================================================
EMPLOYEE PROFILE & RESUME: ${developer.name} (${developer.empCode})
============================================================
Role: ${developer.role}
Email: ${developer.email}
Phone: ${developer.phone}
Location: ${developer.location}
Experience: ${developer.experienceYears} Years
Hourly Rate: $${developer.hourlyRate} / hr
Monthly Cost: $${developer.monthlyCost.toLocaleString()}
Status: ${developer.status}

TECHNICAL SKILLS:
${developer.skills.map(s => `- ${s}`).join('\n')}

CERTIFICATIONS:
${developer.certifications ? developer.certifications.map(c => `- ${c}`).join('\n') : '- Certified Enterprise Developer'}

SUMMARY:
${developer.bio}

ProposalAI Bench Resource Intelligence Database
============================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${developer.empCode}_${developer.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-5">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-4">
              <img
                src={developer.avatar}
                alt={developer.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/40 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{developer.name}</h3>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {developer.empCode}
                  </span>
                </div>
                <div className="text-sm text-slate-600 font-semibold">{developer.role}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {developer.location}</span>
                  <span>•</span>
                  <span>{developer.experienceYears} Yrs Experience</span>
                </div>
              </div>
            </div>

            <Badge variant={developer.status === 'Available' ? 'emerald' : 'amber'}>
              {developer.status}
            </Badge>
          </div>

          {/* Contact Details Bar (Client requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-500">Email:</span>
              <a href={`mailto:${developer.email}`} className="text-slate-900 hover:underline font-semibold truncate">{developer.email}</a>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-500">Phone:</span>
              <a href={`tel:${developer.phone}`} className="text-slate-900 hover:underline font-semibold">{developer.phone}</a>
            </div>
          </div>

          {/* Action CTAs: Talk to Developer & Download Profile PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                if (onTalkToDeveloper) onTalkToDeveloper(developer);
              }}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Talk to Developer (Video / Chat)</span>
            </button>

            <button
              onClick={handleDownloadResume}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download Profile PDF Resume</span>
            </button>
          </div>

          {/* Bio */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">Professional Summary</h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {developer.bio}
            </p>
          </div>

          {/* Skill Matrix */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Technical Skill Matrix</h4>
            <div className="flex flex-wrap gap-1.5">
              {developer.skills.map((skill, i) => (
                <span key={i} className="text-xs bg-emerald-50 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-200 font-semibold">
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Rate Card & Project Stats */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[11px] font-medium">Hourly Billing Rate</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">${developer.hourlyRate} / hr</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[11px] font-medium">Monthly Cost</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">${developer.monthlyCost.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[11px] font-medium">Rating Score</div>
              <div className="text-base font-extrabold text-amber-600 mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {developer.rating}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
