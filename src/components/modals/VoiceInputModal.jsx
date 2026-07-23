import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2, Check, ArrowRight } from 'lucide-react';

export function VoiceInputModal({ isOpen, onClose, onTranscriptComplete, initialText = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialText);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'error' | 'stopped'
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript(initialText || '');
      setErrorMessage('');
      startVoiceSession();
    } else {
      stopVoiceSession();
    }

    return () => {
      stopVoiceSession();
    };
  }, [isOpen]);

  const startVoiceSession = async () => {
    setMicStatus('listening');
    setIsListening(true);
    setErrorMessage('');

    // 1. Request real Web Audio Stream to measure decibels and visualize mic waves
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
    } catch (err) {
      console.warn("MediaDevices audio access note:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage("Microphone permission was denied by your browser. Please allow microphone access in browser settings.");
      }
    }

    // 2. Start Web Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentStr = '';
          for (let i = 0; i < event.results.length; i++) {
            currentStr += event.results[i][0].transcript;
          }
          if (currentStr.trim()) {
            setTranscript(currentStr.trim());
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition event error:", event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage("Microphone permission blocked. Click a quick voice preset below or allow mic in browser address bar.");
          } else if (event.error === 'network' || event.error === 'service-not-allowed') {
            setErrorMessage("Cloud speech service unreachable. You can use the quick voice presets below or type directly.");
          }
        };

        recognition.onend = () => {
          // Keep listening state active unless stopped explicitly
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn("SpeechRecognition start exception:", e);
      }
    } else {
      setErrorMessage("Direct speech API is restricted in this browser window. Select a voice prompt preset below or type your brief.");
    }
  };

  const stopVoiceSession = () => {
    setIsListening(false);
    setMicStatus('stopped');

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  const handleApplyTranscript = () => {
    if (transcript && transcript.trim()) {
      onTranscriptComplete(transcript.trim());
    }
    onClose();
  };

  const voicePresets = [
    "I need an AI face-swap video platform with 4 developers for 12 weeks",
    "Estimate cost for a fintech payment gateway app with 5 developers",
    "Generate SOW proposal for a HIPAA compliant telehealth portal",
    "Create a custom e-commerce web platform with AI recommendation engine",
    "Match bench developers for React, Node.js, and AWS tech stack"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white transition-all ${
              isListening ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-200 animate-pulse' : 'bg-slate-700'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                Voice Input Assistant
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isListening ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isListening ? '🎙️ Mic Active' : 'Stopped'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Speak into your microphone or choose a voice prompt preset</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Audio Visualizer Equalizer */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center space-y-3 relative">
          <div className="flex items-center gap-1.5 h-12">
            {[40, 75, 100, 60, 90, 50, 80, 30, 95, 65, 85, 45].map((heightPct, idx) => {
              const activeHeight = isListening ? Math.max(12, (audioLevel * heightPct) / 100) : 8;
              return (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isListening ? 'bg-gradient-to-t from-emerald-400 to-teal-300' : 'bg-slate-700'
                  }`}
                  style={{ height: `${activeHeight}px` }}
                />
              );
            })}
          </div>

          <div className="text-xs font-semibold flex items-center gap-2 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isListening ? "Listening to your voice..." : "Click Start Mic to resume"}</span>
          </div>

          {/* Toggle Mic Button */}
          <button
            onClick={() => isListening ? stopVoiceSession() : startVoiceSession()}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? "Pause Microphone" : "Start Microphone"}</span>
          </button>
        </div>

        {/* Error / Permission Notice if Mic is Blocked */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Live Spoken Transcript Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Captured Spoken Text:</span>
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </label>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken requirement will appear here live as you talk..."
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
          />
        </div>

        {/* Quick Voice Prompt Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Or Click a Preset Voice Requirement:
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {voicePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setTranscript(preset)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs text-slate-700 font-medium transition-all flex items-center justify-between group"
              >
                <span className="line-clamp-1 group-hover:text-emerald-800">{preset}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyTranscript}
            disabled={!transcript.trim()}
            className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all ${
              transcript.trim()
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Use Spoken Text</span>
          </button>
        </div>

      </div>
    </div>
  );
}
