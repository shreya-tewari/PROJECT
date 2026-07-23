import React, { useState } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Send, 
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function DeveloperVideoCallModal({ developer, onClose }) {
  if (!developer) return null;

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'dev', text: `Hi! I'm ${developer.name} (${developer.empCode}). Thanks for connecting! How can I assist with your project architecture?`, time: 'Just now' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = { sender: 'user', text: inputText, time: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMsg]);
    const userQuery = inputText;
    setInputText('');

    setTimeout(() => {
      let reply = `Great question! In my ${developer.experienceYears} years as a ${developer.role}, I've worked extensively with ${developer.skills.slice(0, 3).join(', ')}. I'm available immediately to start on your project!`;
      if (userQuery.toLowerCase().includes("rate") || userQuery.toLowerCase().includes("cost")) {
        reply = `My hourly billing rate is $${developer.hourlyRate}/hr ($${developer.monthlyCost.toLocaleString()}/month).`;
      }
      setChatMessages(prev => [...prev, { sender: 'dev', text: reply, time: new Date().toLocaleTimeString() }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full h-[600px] text-slate-900 shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-1.5 rounded-lg bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-900 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Video Call Stream Container (7 cols) */}
        <div className="flex-1 bg-slate-900 p-4 flex flex-col justify-between relative">
          
          {/* Top Status */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-white">Live Call: {developer.name}</span>
              <span className="font-mono text-emerald-400 text-[10px]">({developer.empCode})</span>
            </div>

            <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              HD 1080p • 60 FPS
            </div>
          </div>

          {/* Developer Video Stream Canvas */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {cameraOff ? (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2">
                  {developer.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="text-xs text-slate-400">Camera turned off</div>
              </div>
            ) : (
              <img
                src={developer.avatar}
                alt={developer.name}
                className="w-full h-full object-cover filter contrast-105"
              />
            )}

            {/* Self Video PIP (Bottom Right) */}
            <div className="absolute bottom-16 right-4 w-32 h-24 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center text-[10px] text-slate-300">
              <div className="text-center">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold mx-auto mb-1 flex items-center justify-center">You</div>
                <span>Your Camera</span>
              </div>
            </div>
          </div>

          {/* Bottom Video Controls Bar */}
          <div className="z-10 flex items-center justify-center gap-3 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 max-w-md mx-auto w-full">
            <button
              onClick={() => setMicMuted(!micMuted)}
              className={`p-3 rounded-xl border transition-colors ${
                micMuted ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
              }`}
              title={micMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCameraOff(!cameraOff)}
              className={`p-3 rounded-xl border transition-colors ${
                cameraOff ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
              }`}
              title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              className="p-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
              title="Share Screen"
            >
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5 px-5"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>

        </div>

        {/* Right Side: Direct Live Chat Window */}
        <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h4 className="font-extrabold text-xs text-slate-900">Direct Chat with Developer</h4>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none font-medium' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type message to dev..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
