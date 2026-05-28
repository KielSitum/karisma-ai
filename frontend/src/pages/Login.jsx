import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const IcoMail = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const IcoLock = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoUser = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IcoEyeOn = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoGoogle = <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;

function InputField({ label, type = 'text', placeholder, value, onChange, iconL, showToggle, onToggle, showPw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1226]">
        <span className="text-[#9EA3BC]">{iconL}</span>
        {label}
      </label>
      <div className="relative">
        <input
          type={showToggle ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
          className="w-full rounded-xl border border-[#E8EAF2] bg-white px-4 py-3 pr-11 text-sm text-[#0F1226] outline-none transition-all duration-200 placeholder:text-[#9EA3BC] focus:border-[#5B4FE8] focus:ring-4 focus:ring-[#5B4FE8]/10"
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA3BC] hover:text-[#5B4FE8] transition-colors">
            {showPw ? IcoEyeOn : IcoEyeOff}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email) return setError('Please enter your email.');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,18,38,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[420px] card-base p-8 animate-fade-up">
        {sent ? (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-[#F0EFFE] border border-[#E4E1FD] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#0F1226] mb-2">Email sent!</h3>
              <p className="text-sm text-[#5A5F7D] leading-relaxed">
                Check your inbox at <strong>{email}</strong>. The reset link is valid for <strong>1 hour</strong>.
              </p>
            </div>
            <button onClick={onClose} className="btn-primary text-sm px-6 py-2.5 mt-1">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-[#0F1226] mb-1">Forgot Password?</h3>
                <p className="text-sm text-[#9EA3BC]">Enter your email to receive a reset link.</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F8F9FE] flex items-center justify-center text-[#9EA3BC] hover:text-[#0F1226] hover:bg-[#E8EAF2] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1226]">
                <span className="text-[#9EA3BC]">{IcoMail}</span>
                Email Address
              </label>
              <input
                type="email"
                placeholder="youremail@mail.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full rounded-xl border border-[#E8EAF2] bg-white px-4 py-3 text-sm text-[#0F1226] outline-none transition-all duration-200 placeholder:text-[#9EA3BC] focus:border-[#5B4FE8] focus:ring-4 focus:ring-[#5B4FE8]/10"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : 'Send Reset Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]               = useState('login');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [pw, setPw]                 = useState('');
  const [cpw, setCpw]               = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showCpw, setShowCpw]       = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]           = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const isRegister = tab === 'register';
  const clear = () => setError('');
  const switchTab = (t) => { setTab(t); clear(); };

  const handleSubmit = async () => {
    setError('');
    if (tab === 'login') {
      if (!email || !pw) return setError('Please enter your email and password.');
      setLoading(true);
      try { await login(email, pw); navigate('/dashboard'); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    } else {
      if (!name || !email || !pw || !cpw) return setError('Please fill in all fields.');
      if (pw.length < 8) return setError('Password must be at least 8 characters.');
      if (!/[A-Z]/.test(pw)) return setError('Password must contain an uppercase letter.');
      if (!/[0-9]/.test(pw)) return setError('Password must contain a number.');
      if (pw !== cpw) return setError('Passwords do not match.');
      setLoading(true);
      try { await register(name, email, pw); navigate('/dashboard'); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'USER_NOT_REGISTERED') {
        switchTab('register');
        setName(err.googleName || '');
        setEmail(err.googleEmail || '');
        setError('Your Google account is not registered. Please complete registration below.');
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#F8F9FE] p-4 sm:p-6">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <Link
        to="/"
        className="absolute left-4 top-4 sm:left-6 sm:top-6 flex items-center gap-2 rounded-full border border-[#E8EAF2] bg-white px-4 py-2 text-sm font-medium text-[#5A5F7D] shadow-sm transition-all duration-200 hover:border-[#5B4FE8] hover:text-[#5B4FE8]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Home
      </Link>

      <div className="relative w-full max-w-[900px] min-h-[680px] overflow-hidden rounded-[32px] bg-white shadow-[0_10px_50px_rgba(0,0,0,0.08)]">

        {/* Image panel */}
        <div className={`absolute inset-y-0 hidden md:flex w-[42%] z-20 overflow-hidden transition-all duration-700 ease-in-out ${isRegister ? 'left-[58%] rounded-r-[32px]' : 'left-0 rounded-l-[32px]'}`}>
          <img src="/students-login.png" alt="Students" className="absolute inset-0 h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c28]/90 via-[#0d0c28]/30 to-transparent"/>
          <div className="relative z-10 mt-auto p-10">
            <img src="/logo-karisma.png" alt="Karisma AI" className="mb-6 h-8 w-auto brightness-0 invert"/>
            <h2 className="text-lg font-semibold leading-relaxed text-white/90">
              {isRegister ? 'Start your journey. Your dream career is one step closer.' : 'Bridging the gap between your education and your dream career with precision and intelligence.'}
            </h2>
          </div>
        </div>

        {/* Form panel */}
        <div className={`relative z-10 flex min-h-[680px] w-full items-center justify-center px-5 py-8 sm:px-8 md:w-[58%] md:px-10 transition-all duration-700 ease-in-out ${isRegister ? 'md:ml-0' : 'md:ml-[42%]'}`}>
          <div className="w-full max-w-[420px]">

            <h1 className="mb-1 text-2xl font-bold text-[#0F1226]">
              {isRegister ? 'Create your account' : 'Welcome to Karisma AI'}
            </h1>
            <p className="mb-5 text-sm text-[#9EA3BC]">
              {isRegister ? 'Fill in your details to get started.' : 'Join thousands of students accelerating their careers.'}
            </p>

            {/* Tabs */}
            <div className="mb-5 flex rounded-full border border-[#E8EAF2] bg-[#F8F9FE] p-1">
              {['login', 'register'].map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                    tab === t ? 'bg-white text-[#5B4FE8] shadow-sm' : 'text-[#9EA3BC]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="mb-4 flex flex-col gap-4">
              {isRegister && (
                <InputField label="Your Name" placeholder="Your full name" value={name} onChange={v => { setName(v); clear(); }} iconL={IcoUser}/>
              )}
              <InputField label="Email Address" type="email" placeholder="youremail@mail.com" value={email} onChange={v => { setEmail(v); clear(); }} iconL={IcoMail}/>
              <InputField label="Password" placeholder="••••••••" value={pw} onChange={v => { setPw(v); clear(); }} iconL={IcoLock} showToggle showPw={showPw} onToggle={() => setShowPw(s => !s)}/>
              {isRegister && (
                <InputField label="Confirm Password" placeholder="••••••••" value={cpw} onChange={v => { setCpw(v); clear(); }} iconL={IcoLock} showToggle showPw={showCpw} onToggle={() => setShowCpw(s => !s)}/>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#5A5F7D] cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 accent-[#5B4FE8]"/>
                  Stay Signed In
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm font-semibold text-[#5B4FE8] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">{error}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mb-5 flex w-full items-center justify-center rounded-xl bg-[#5B4FE8] py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#4a3fd1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
                : <>{isRegister ? 'Register' : 'Login'}</>}
            </button>

            <div className="mb-4 flex items-center gap-3 text-xs font-medium tracking-wider text-[#9EA3BC]">
              <div className="h-px flex-1 bg-[#E8EAF2]"/>
              OR CONTINUE WITH
              <div className="h-px flex-1 bg-[#E8EAF2]"/>
            </div>

            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E8EAF2] bg-white py-3 text-sm font-semibold text-[#0F1226] transition-all duration-200 hover:border-[#5B4FE8] hover:bg-[#F0EFFE] hover:text-[#5B4FE8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {googleLoading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9EA3BC]/30 border-t-[#9EA3BC]"/>
                : IcoGoogle}
              {googleLoading ? 'Connecting...' : 'Google'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}