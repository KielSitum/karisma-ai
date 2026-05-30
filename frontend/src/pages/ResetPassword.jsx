import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

const IcoLock = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IcoEyeOn = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoEyeOff = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [pw, setPw]           = useState('');
  const [cpw, setCpw]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate])

  const handleSubmit = async () => {
    setError('');
    if (!pw || !cpw) return setError('Please fill in all fields.');
    if (pw.length < 8) return setError('Password must be at least 8 characters.');
    if (!/[A-Z]/.test(pw)) return setError('Password must contain an uppercase letter.');
    if (!/[0-9]/.test(pw)) return setError('Password must contain a number.');
    if (pw !== cpw) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: pw });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#F4F5FB] p-4 sm:p-6">
      <Link
        to="/login"
        className="absolute left-4 top-4 sm:left-6 sm:top-6 flex items-center gap-2 rounded-full border border-[#E8EAF2] bg-white px-4 py-2 text-sm font-medium text-[#5A5F7D] shadow-sm transition-all duration-200 hover:border-primary hover:text-primary"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Login
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <img src="/logo-karisma.png" alt="Karisma AI" className="h-8 w-auto" />
        </div>

        <div className="card-base p-8">
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1226] mb-2">Password updated!</h2>
                <p className="text-sm text-[#5A5F7D]">You will be redirected to the login page in 3 seconds...</p>
              </div>
              <Link to="/login" className="btn-primary text-sm px-6 py-2.5 mt-2">Login Now</Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl text-[#0F1226] mb-1">Create New Password</h1>
                <p className="text-sm text-[#9EA3BC]">Enter your new password below.</p>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1226]">
                    <span className="text-[#9EA3BC]">{IcoLock}</span>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pw}
                      onChange={e => { setPw(e.target.value); setError(''); }}
                      className="w-full rounded-xl border border-[#E8EAF2] bg-white px-4 py-3 pr-11 text-sm text-[#0F1226] outline-none transition-all duration-200 placeholder:text-[#9EA3BC] focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA3BC] hover:text-primary transition-colors">
                      {showPw ? IcoEyeOn : IcoEyeOff}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1226]">
                    <span className="text-[#9EA3BC]">{IcoLock}</span>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCpw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={cpw}
                      onChange={e => { setCpw(e.target.value); setError(''); }}
                      className="w-full rounded-xl border border-[#E8EAF2] bg-white px-4 py-3 pr-11 text-sm text-[#0F1226] outline-none transition-all duration-200 placeholder:text-[#9EA3BC] focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <button type="button" onClick={() => setShowCpw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA3BC] hover:text-primary transition-colors">
                      {showCpw ? IcoEyeOn : IcoEyeOff}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {[
                    { ok: pw.length >= 8,    label: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(pw),  label: 'Contains an uppercase letter' },
                    { ok: /[0-9]/.test(pw),  label: 'Contains a number' },
                  ].map((hint, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${hint.ok && pw ? 'bg-[#5B4FE8]' : 'bg-[#E8EAF2]'}`}>
                        {hint.ok && pw && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className={`text-xs transition-colors ${hint.ok && pw ? 'text-[#5B4FE8]' : 'text-[#9EA3BC]'}`}>{hint.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">{error}</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : 'Reset Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
