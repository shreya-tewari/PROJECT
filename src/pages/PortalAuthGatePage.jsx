import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { verifyOtp } from '../services/authService';
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Globe, 
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Zap,
  Clock,
  BotMessageSquare,
  FileText
} from 'lucide-react';

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak', color: '#ef4444' };
  if (s <= 2) return { score: s, label: 'Fair', color: '#f59e0b' };
  if (s <= 3) return { score: s, label: 'Good', color: '#3b82f6' };
  return { score: s, label: 'Strong', color: '#10b981' };
}

function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = ((value || '') + '      ').slice(0, 6).split('');

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const d = [...digits]; d[i] = ' ';
      onChange(d.join('').trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const d = [...digits]; d[i] = e.key;
      onChange(d.join('').trimEnd());
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(p); refs.current[Math.min(p.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} ref={el => refs.current[i] = el} type="text" inputMode="numeric"
          maxLength={1} value={d.trim()} onKeyDown={e => handleKey(e, i)} onChange={() => {}}
          className="w-11 text-center text-lg font-bold rounded-xl border-2 bg-slate-50 text-slate-900 outline-none transition-all"
          style={{
            borderColor: d.trim() ? '#059669' : '#cbd5e1',
            color: d.trim() ? '#059669' : '#334155',
            caretColor: 'transparent',
            height: '52px'
          }}
        />
      ))}
    </div>
  );
}

function Countdown({ secs, onExpire }) {
  const [rem, setRem] = useState(secs);
  useEffect(() => {
    if (rem <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRem(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rem]);
  const m = String(Math.floor(rem / 60)).padStart(2, '0');
  const s = String(rem % 60).padStart(2, '0');
  return <span className={`font-mono text-xs ${rem < 60 ? 'text-red-500 font-bold' : 'text-slate-600'}`}>{m}:{s}</span>;
}

export function PortalAuthGatePage() {
  const {
    loginWithEmail, registerWithEmail, completeRegistration,
    pendingOtpData, setPendingOtpData, setActiveTab,
    generateOtp, storeOtp, sendOtpEmail,
    authMode: contextAuthMode, setAuthMode: setContextAuthMode
  } = useApp();
  
  const [authMode, setAuthModeState] = useState(() => contextAuthMode || 'login');

  useEffect(() => {
    if (contextAuthMode) {
      setAuthModeState(contextAuthMode);
    }
  }, [contextAuthMode]);

  const setAuthMode = (mode) => {
    setAuthModeState(mode);
    if (setContextAuthMode) setContextAuthMode(mode);
  };
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In State
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [regName, setRegName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);

  const pwStrength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const res = loginWithEmail({ email: loginEmail, password: loginPassword });
    setIsLoading(false);

    if (!res?.success) {
      if (res?.requiresVerification) {
        const code = generateOtp();
        storeOtp(res.userEmail || loginEmail, code);
        const emailRes = await sendOtpEmail(res.userEmail || loginEmail, loginEmail.split('@')[0], code);
        setPendingOtpData({
          email: res.userEmail || loginEmail,
          name: loginEmail.split('@')[0],
          demoOtp: emailRes.demoMode ? emailRes.demoOtp : null,
          demoMode: emailRes.demoMode
        });
        return;
      }
      setErrorMsg(res?.error || 'Sign in failed. Please check credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await registerWithEmail({
      name: regName,
      companyName: regCompanyName,
      email: regEmail,
      password: regPassword
    });
    setIsLoading(false);

    if (!res?.success) {
      setErrorMsg(res?.error || 'Registration failed.');
    }
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanOtp = (otpValue || '').replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }
    if (otpExpired) {
      setErrorMsg('OTP code has expired. Please request a new one.');
      return;
    }

    const vr = verifyOtp(pendingOtpData.email, cleanOtp);
    if (!vr.valid) {
      setErrorMsg(vr.error);
      return;
    }

    const fr = completeRegistration({ email: pendingOtpData.email });
    if (!fr?.success) {
      setErrorMsg(fr?.error || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!pendingOtpData) return;
    setErrorMsg('');
    setOtpExpired(false);
    setOtpValue('');

    const code = generateOtp();
    storeOtp(pendingOtpData.email, code);
    const emailRes = await sendOtpEmail(pendingOtpData.email, pendingOtpData.name, code);
    setPendingOtpData(prev => ({
      ...prev,
      demoOtp: emailRes.demoMode ? emailRes.demoOtp : null,
      demoMode: emailRes.demoMode
    }));
    setSuccessMsg('A fresh OTP code has been sent to your email.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  /* OTP Verification Screen */
  if (pendingOtpData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="max-w-md w-full z-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Check Your Email</h2>
              <p className="text-slate-600 text-xs">
                We sent a 6-digit verification OTP code to <strong className="text-emerald-700 font-semibold">{pendingOtpData.email}</strong>
              </p>
            </div>

            {pendingOtpData.demoMode && pendingOtpData.demoOtp && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <Zap className="w-4 h-4 text-amber-600" /> Demo Mode Active (EmailJS Pending)
                </div>
                <p className="text-slate-700 text-xs">
                  Your verification code is: <strong className="text-emerald-700 font-mono text-lg tracking-widest">{pendingOtpData.demoOtp}</strong>
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleOtpVerify} className="space-y-6">
              <OtpInput value={otpValue} onChange={setOtpValue} />

              <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Code expires in</span>
                <Countdown secs={600} onExpire={() => setOtpExpired(true)} />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Activate Account</span>
              </button>
            </form>

            <div className="flex flex-col items-center gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition-colors font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
              </button>
              <button
                type="button"
                onClick={() => { setPendingOtpData(null); setAuthMode('signup'); }}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Back to Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Top Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
            P
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              Proposal<span className="text-emerald-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Client Portal Authentication</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>Explore Public Landing Page</span>
        </button>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-xl w-full mx-auto my-auto z-10 py-10 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2 max-w-md mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Portal Gateway
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {authMode === 'login' ? 'Sign In to Client Portal' : 'Create Client Account'}
          </h2>
          <p className="text-slate-600 text-xs font-medium">
            {authMode === 'login' 
              ? 'Access AI Requirement Assistant, draft SOW proposals & view history' 
              : 'Sign up with email and password to start generating proposals'}
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-slate-200/60 transition-all">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                authMode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                authMode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORM 1: SIGN IN */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Full Name / Client Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Stwork0203 or Alex Rivera"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alex@fintech.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Client Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-slate-500 text-xs font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* FORM 2: SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">Company / Enterprise Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    placeholder="e.g. Acme Innovations Inc"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sarah@acme.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      required
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {regPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= pwStrength.score ? pwStrength.color : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold" style={{ color: pwStrength.color }}>
                    Password Strength: {pwStrength.label}
                  </p>
                </div>
              )}

              {regConfirmPassword && regConfirmPassword !== regPassword && (
                <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Passwords do not match
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all mt-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Create Account & Verify Email</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-slate-500 text-xs font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Sign In Instead
                </button>
              </div>
            </form>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-slate-500 z-10 py-3 border-t border-slate-200 font-medium flex items-center justify-center">
        <span>ProposalAI Presales Platform • Secure Email & Password Authentication</span>
      </footer>
    </div>
  );
}
