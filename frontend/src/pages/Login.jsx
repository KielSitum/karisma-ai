import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const IcoMail = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const IcoLock = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoUser = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IcoEyeOn  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

function InputField({ label, type='text', placeholder, value, onChange, iconL, showToggle, onToggle, showPw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold font-display text-[#0F1226] flex items-center gap-1.5">
        <span className="text-[#9EA3BC]">{iconL}</span>{label}
      </label>
      <div className="relative">
        <input
          type={showToggle ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="input-base pr-10"
          autoComplete="off"
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA3BC] hover:text-primary transition-colors cursor-pointer bg-none border-none p-0">
            {showPw ? IcoEyeOn : IcoEyeOff}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [pw, setPw]           = useState('');
  const [cpw, setCpw]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const clear = () => setError('');

  const handleSubmit = async () => {
    setError('');
    if (tab === 'login') {
      if (!email || !pw) return setError('Mohon isi email dan password.');
      setLoading(true);
      try { await login(email, pw); navigate('/dashboard'); }
      catch(e) { setError(e.message); }
      finally { setLoading(false); }
    } else {
      if (!name || !email || !pw || !cpw) return setError('Mohon isi semua field.');
      if (pw.length < 8) return setError('Password minimal 8 karakter.');
      if (pw !== cpw) return setError('Password tidak cocok.');
      setLoading(true);
      try { await register(name, email, pw); navigate('/dashboard'); }
      catch(e) { setError(e.message); }
      finally { setLoading(false); }
    }
  };

  const onEnter = e => { if (e.key === 'Enter') handleSubmit(); };
  const switchTab = t => { setTab(t); setError(''); };

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col items-center justify-center p-6 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-[#5A5F7D] bg-white border border-[#E8EAF2] px-4 py-2 rounded-full shadow-card hover:text-primary hover:border-primary transition-all duration-200 -translate-x-0 hover:-translate-x-0.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Home
      </Link>

      <div className="flex w-full max-w-[780px] min-h-[540px] rounded-3xl shadow-lg overflow-hidden animate-fade-up">
        <div className="w-[42%] flex-shrink-0 relative hidden sm:flex flex-col justify-end overflow-hidden rounded-l-3xl">
          <img src="/students-login.png" alt="Students" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c28]/90 via-[#0d0c28]/30 to-transparent"/>
          <div className="relative z-10 p-9">
            <div className="flex items-center gap-2 mb-5">
              <img src="/logo-karisma.png" alt="Karisma AI" className="h-8 w-auto object-contain brightness-0 invert" />
            </div>
            <h2 className="font-display font-semibold text-white/90 text-lg leading-snug mb-7">
              Bridging the gap between your education and your dream career with precision and intelligence.
            </h2>
            <div className="flex gap-6">
              {[['10k+','Students'],['95%','Match Rate'],['Free','Forever']].map(([v,l]) => (
                <div key={l}>
                  <p className="font-display font-extrabold text-white text-xl">{v}</p>
                  <p className="text-white/40 text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white flex items-center px-9 py-10 overflow-y-auto">
          <div className="w-full">
            <h3 className="font-display font-bold text-xl text-[#0F1226] mb-1">Welcome to Karisma AI</h3>
            <p className="text-sm text-[#9EA3BC] mb-6">Join thousands of students accelerating their careers.</p>

            <div className="flex bg-[#F8F9FE] border-[1.5px] border-[#E8EAF2] rounded-full p-1 mb-6">
              {['login','register'].map(t => (
                <button key={t} onClick={() => switchTab(t)}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold font-display transition-all duration-200 cursor-pointer border-none capitalize
                    ${tab === t ? 'bg-white text-primary shadow-card' : 'text-[#9EA3BC] bg-transparent'}`}>
                  {t === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 mb-4" onKeyDown={onEnter}>
              {tab === 'register' && (
                <InputField label="Your Name" placeholder="Your full name" value={name} onChange={v=>{setName(v);clear()}} iconL={IcoUser} />
              )}
              <InputField label="Email Address" type="email" placeholder="youremail@mail.com" value={email} onChange={v=>{setEmail(v);clear()}} iconL={IcoMail} />
              <InputField label="Password" placeholder="••••••••" value={pw} onChange={v=>{setPw(v);clear()}} iconL={IcoLock} showToggle showPw={showPw} onToggle={() => setShowPw(s=>!s)} />
              {tab === 'register' && (
                <InputField label="Confirm Password" placeholder="••••••••" value={cpw} onChange={v=>{setCpw(v);clear()}} iconL={IcoLock} showToggle showPw={showCpw} onToggle={() => setShowCpw(s=>!s)} />
              )}
              <label className="flex items-center gap-2 text-sm text-[#5A5F7D] cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="accent-primary w-4 h-4 rounded"/>
                Keep me logged in for 30 days
              </label>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full py-3.5 text-[15px] rounded-xl mb-5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{animation:'spin 0.7s linear infinite'}}/>
                : (tab === 'login' ? 'Login →' : 'Register →')}
            </button>

            <div className="flex items-center gap-3 text-xs text-[#9EA3BC] font-medium tracking-wider mb-4">
              <div className="flex-1 h-px bg-[#E8EAF2]"/>OR CONTINUE WITH<div className="flex-1 h-px bg-[#E8EAF2]"/>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Google', icon: <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                { label: 'LinkedIn', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="#0077B5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> }
              ].map(({ label, icon }) => (
                <button key={label}
                  className="flex items-center justify-center gap-2 py-2.5 border-[1.5px] border-[#E8EAF2] rounded-xl text-sm font-semibold font-display text-[#0F1226] bg-white hover:border-primary hover:bg-primary-light hover:text-primary transition-all duration-200 cursor-pointer">
                  {icon}{label}
                </button>
              ))}
            </div>

            <p className="text-xs text-[#9EA3BC] text-center leading-relaxed">
              By {tab === 'login' ? 'logging in' : 'registering'}, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}