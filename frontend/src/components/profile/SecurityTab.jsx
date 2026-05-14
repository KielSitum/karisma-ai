import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../InputField';

const IcoLock  = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoCheck = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

export default function SecurityTab({ showToast }) {
  const { changePassword } = useAuth();
  const [curPw,    setCurPw]    = useState('');
  const [newPw,    setNewPw]    = useState('');
  const [confPw,   setConfPw]   = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleChangePassword = async () => {
    if (!curPw || !newPw || !confPw) return showToast('Please fill in all password fields.', 'error');
    if (newPw.length < 8)            return showToast('New password must be at least 8 characters.', 'error');
    if (!/[A-Z]/.test(newPw))        return showToast('New password must contain an uppercase letter.', 'error');
    if (!/[0-9]/.test(newPw))        return showToast('New password must contain a number.', 'error');
    if (newPw !== confPw)            return showToast('New passwords do not match.', 'error');
    setSavingPw(true);
    try {
      await changePassword(curPw, newPw);
      showToast('Password changed successfully!');
      setCurPw(''); setNewPw(''); setConfPw('');
    } catch (e) {
      showToast(e.message || 'Failed to change password.', 'error');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="card-base p-6 md:p-8 animate-fade-in">
      <h3 className="font-display font-bold text-lg text-[#0F1226] mb-1">Change Password</h3>
      <p className="text-sm text-[#9EA3BC] mb-6">Keep your account safe with a strong password.</p>

      <div className="flex flex-col gap-5 max-w-[480px]">
        <InputField label="Current Password"     placeholder="••••••••" value={curPw}  onChange={setCurPw}  iconL={IcoLock} showToggle showPw={showCur}  onToggle={() => setShowCur(s => !s)} />
        <InputField label="New Password"         placeholder="••••••••" value={newPw}  onChange={setNewPw}  iconL={IcoLock} showToggle showPw={showNew}  onToggle={() => setShowNew(s => !s)} />
        <InputField label="Confirm New Password" placeholder="••••••••" value={confPw} onChange={setConfPw} iconL={IcoLock} showToggle showPw={showConf} onToggle={() => setShowConf(s => !s)} />

        {newPw && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: '8+ chars',  ok: newPw.length >= 8 },
              { label: 'Uppercase', ok: /[A-Z]/.test(newPw) },
              { label: 'Number',    ok: /[0-9]/.test(newPw) },
              { label: 'Match',     ok: newPw === confPw && confPw.length > 0 },
            ].map(r => (
              <span key={r.label} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${r.ok ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F8F9FE] text-[#9EA3BC]'}`}>
                {r.ok ? IcoCheck : <span className="w-3 h-3 rounded-full border-2 border-current" />}
                {r.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#E8EAF2]">
        <button onClick={handleChangePassword} disabled={savingPw}
          className="btn-primary px-7 py-3 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
          {savingPw
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
            : 'Update Password'}
        </button>
        <button onClick={() => { setCurPw(''); setNewPw(''); setConfPw(''); }}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-[#5A5F7D] hover:bg-[#F8F9FE] transition-colors cursor-pointer bg-none border-none font-display">
          Clear
        </button>
      </div>
    </div>
  );
}
