import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import ProfileInfoTab from '../components/profile/ProfileInfoTab';
import SecurityTab from '../components/profile/SecurityTab';
import AccountTab from '../components/profile/AccountTab';
import { api } from '../utils/api';

const IcoUser   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IcoLock   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoAlert  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoCamera = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoSpin   = <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block" style={{ animation: 'spin 0.7s linear infinite' }} />;

function ProfileAvatar({ name = '', avatarUrl = '', size = 96 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const colors = ['#5B4FE8', '#7C3AED', '#2563EB', '#0891B2', '#059669'];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 select-none"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
      className="inline-flex items-center justify-center rounded-full text-white font-display font-bold flex-shrink-0 select-none"
    >
      {initials}
    </span>
  );
}

const TABS = [
  { id: 'profile',  label: 'Personal Info', icon: IcoUser },
  { id: 'security', label: 'Security',      icon: IcoLock },
  { id: 'account',  label: 'Account',       icon: IcoAlert },
];

export default function ProfileSettings() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab,     setActiveTab]     = useState('profile');
  const [toast,         setToast]         = useState({ message: '', type: 'success' });
  const [modal,         setModal]         = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleDeleteAccount = async () => {
    try { await deleteAccount(); }
    catch (_) { logout(); }
    navigate('/');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const memberSince = user?.created_at
    ? new Date(user.created_at).getFullYear()
    : new Date().getFullYear();

  // ── Upload Avatar ─────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (!uploadingAvatar) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    return showToast('File harus berupa gambar (JPG, PNG, WebP).', 'error');
  }
  if (file.size > 2 * 1024 * 1024) {
    return showToast('Ukuran foto maksimal 2MB.', 'error');
  }

  setUploadingAvatar(true);
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const { avatar_url } = await api.upload('/auth/avatar', formData);

    // ✅ Simpan URL bersih ke DB (tanpa ?t=...)
    await updateProfile({ avatar_url });

    // ✅ Cache-busting hanya untuk update tampilan lokal saja
    showToast('Foto profil berhasil diperbarui!');
  } catch (err) {
    showToast(err.message || 'Gagal upload foto.', 'error');
  } finally {
    setUploadingAvatar(false);
    e.target.value = '';
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
      <Navbar />

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <ConfirmModal
        open={modal}
        title="Delete Account?"
        message="This action is permanent and cannot be undone. All your data, CVs, and analysis results will be permanently deleted."
        confirmLabel="Delete My Account"
        onConfirm={handleDeleteAccount}
        onCancel={() => setModal(false)}
        danger
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <main className="flex-1 pt-24">
        <div className="max-w-[860px] mx-auto px-6 py-10">

          <div className="mb-8 animate-fade-up">
            <h1 className="font-display font-extrabold text-[clamp(26px,3.5vw,38px)] text-[#0F1226] mb-2">Profile Settings</h1>
            <p className="text-[#5A5F7D] text-sm">Manage your personal information, security, and account preferences.</p>
          </div>

          <div className="card-base p-6 md:p-8 mb-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row items-center gap-5">

              {/* Avatar dengan tombol ganti */}
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <ProfileAvatar name={user?.full_name || ''} avatarUrl={user?.avatar_url || ''} size={88} />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar
                    ? IcoSpin
                    : <span className="text-white">{IcoCamera}</span>}
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="font-display font-bold text-xl text-[#0F1226] mb-0.5">{user?.full_name}</h2>
                <p className="text-sm text-[#9EA3BC] mb-2">{user?.email}</p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer bg-none border-none p-0 disabled:opacity-50"
                  >
                    {uploadingAvatar ? 'Mengupload...' : 'Ganti foto'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex bg-white border border-[#E8EAF2] rounded-2xl p-1.5 mb-6 animate-fade-up">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold font-display transition-all duration-200 cursor-pointer border-none
                  ${activeTab === tab.id ? 'bg-primary text-white shadow-glow' : 'text-[#9EA3BC] bg-transparent hover:text-[#5A5F7D] hover:bg-[#F8F9FE]'}`}>
                <span className={activeTab === tab.id ? 'text-white' : 'text-[#9EA3BC]'}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'profile'  && <ProfileInfoTab user={user} updateProfile={updateProfile} showToast={showToast} />}
          {activeTab === 'security' && <SecurityTab showToast={showToast} />}
          {activeTab === 'account'  && <AccountTab onLogout={handleLogout} onDeleteAccount={() => setModal(true)} />}

        </div>
      </main>
      <Footer />
    </div>
  );
}
