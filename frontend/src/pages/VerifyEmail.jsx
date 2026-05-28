import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Verification link is missing.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(err => { setStatus('error'); setMessage(err.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#F8F9FE] p-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <img src="/logo-karisma.png" alt="Karisma AI" className="h-8 w-auto" />
        </div>

        <div className="card-base p-8 flex flex-col items-center text-center gap-5">
          {status === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-full bg-[#EEEDFE] border border-[#C7D2FE] flex items-center justify-center">
                <span className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1226] mb-2">Verifying your email...</h2>
                <p className="text-sm text-[#9EA3BC]">Please wait a moment.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1226] mb-2">Email Verified!</h2>
                <p className="text-sm text-[#5A5F7D]">Your account is now active. You can log in to Karisma AI.</p>
              </div>
              <Link to="/login" className="btn-primary text-sm px-8 py-2.5">Login Now</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1226] mb-2">Verification Failed</h2>
                <p className="text-sm text-[#5A5F7D]">{message || 'This link may have expired. Please request a new one.'}</p>
              </div>
              <Link to="/login" className="btn-primary text-sm px-8 py-2.5">Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
