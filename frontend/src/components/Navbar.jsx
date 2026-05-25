import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Logo() {
  return (
    <Link to="/" className="flex items-center flex-shrink-0">
      <img src="/logo-karisma.png" alt="Karisma AI" className="h-8 w-auto object-contain" />
    </Link>
  );
}

function Avatar({ name = '', avatarUrl = '', size = 34 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const colors   = ['#5B4FE8', '#7C3AED', '#2563EB', '#0891B2', '#059669'];
  const bg       = colors[(name.charCodeAt(0) || 0) % colors.length];

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
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
      className="inline-flex items-center justify-center rounded-full text-white font-display font-bold flex-shrink-0 select-none"
    >
      {initials}
    </span>
  );
}

function DropdownMenu({ user, onNavigate, onLogout, onClose }) {
  return (
    <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-[#E8EAF2] rounded-2xl min-w-[220px] p-2 z-[9999] origin-top-right"
      style={{ boxShadow: '0 8px 32px rgba(91,79,232,0.14), 0 4px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-3 px-3 py-2 mb-1">
        <Avatar name={user.full_name} avatarUrl={user.avatar_url || ''} size={38} />
        <div>
          <p className="text-sm font-semibold text-[#0F1226] leading-tight">{user.full_name}</p>
          <p className="text-xs text-[#9EA3BC]">{user.email}</p>
        </div>
      </div>

      <div style={{ height: 1, background: '#E8EAF2', margin: '4px 0' }} />

      <a
        href="/profile"
        onClick={e => { e.preventDefault(); onNavigate('/profile'); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[#5A5F7D] hover:bg-[#F8F9FE] hover:text-[#0F1226] transition-all duration-150 cursor-pointer"
        style={{ textDecoration: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        Profile Settings
      </a>

      <a
        href="#logout"
        onClick={e => { e.preventDefault(); onLogout(); }}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer"
        style={{ textDecoration: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        Logout
      </a>
    </div>
  );
}

export default function Navbar() {
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [menuOpen, setMenu]     = useState(false);
  const [dropOpen, setDrop]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef                 = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!dropOpen) return;
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDrop(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('click', fn);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', fn);
    };
  }, [dropOpen]);

  const handleLogout = () => {
    setDrop(false);
    setMenu(false);
    logout();
    navigate('/');
  };

  const handleNavigate = (path) => {
    setDrop(false);
    navigate(path);
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-[6px] rounded-full text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-primary font-semibold bg-primary-light'
        : 'text-[#5A5F7D] hover:text-[#0F1226] hover:bg-[rgba(91,79,232,0.06)]'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 border-b border-[#E8EAF2] shadow-card'
          : 'bg-[rgba(244,245,251,0.8)] backdrop-blur-xl'
      }`}
      style={{ zIndex: 200 }}
    >
      <div className="max-w-[1140px] mx-auto px-6 h-full flex items-center">
        <Logo />

        {user ? (
          <>
            <div className="ml-auto hidden md:flex items-center gap-1">
              {[
                { to: '/dashboard',  label: 'Dashboard'  },
                { to: '/upload-cv',  label: 'Upload CV'  },
                { to: '/cv-history', label: 'CV History' },
              ].map(({ to, label }) => (
                <NavLink key={to} to={to} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}

              <div ref={dropRef} className="relative ml-3">
                <button
                  type="button"
                  onClick={() => setDrop(o => !o)}
                  className="p-[2px] rounded-full border-2 border-transparent hover:border-primary transition-colors duration-200 cursor-pointer"
                  style={{ background: 'transparent' }}
                >
                  <Avatar name={user.full_name} avatarUrl={user.avatar_url || ''} />
                </button>

                {dropOpen && (
                  <DropdownMenu
                    user={user}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    onClose={() => setDrop(false)}
                  />
                )}
              </div>
            </div>

            <div className="ml-auto flex md:hidden items-center gap-2">
              <div className="relative" ref={dropRef}>
                <button
                  type="button"
                  onClick={() => setDrop(o => !o)}
                  className="p-[2px] rounded-full border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                  style={{ background: 'transparent' }}
                >
                  <Avatar name={user.full_name} avatarUrl={user.avatar_url || ''} />
                </button>

                {dropOpen && (
                  <DropdownMenu
                    user={user}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    onClose={() => setDrop(false)}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => setMenu(o => !o)}
                className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-xl hover:bg-[#F8F9FE] transition-colors cursor-pointer"
                style={{ background: 'transparent' }}
              >
                <span className={`block w-[18px] h-[2px] bg-[#0F1226] rounded transition-all duration-200 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}/>
                <span className={`block w-[18px] h-[2px] bg-[#0F1226] rounded transition-all duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}/>
                <span className={`block w-[18px] h-[2px] bg-[#0F1226] rounded transition-all duration-200 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}/>
              </button>
            </div>

            {menuOpen && (
              <div
                className="fixed left-0 right-0 bg-white border-b border-[#E8EAF2] flex flex-col p-3 shadow-md md:hidden"
                style={{ top: 64, zIndex: 199 }}
              >
                {[
                  { to: '/dashboard',  label: 'Dashboard'  },
                  { to: '/upload-cv',  label: 'Upload CV'  },
                  { to: '/cv-history', label: 'CV History' },
                ].map(({ to, label }) => (
                  <NavLink key={to} to={to} className={navLinkClass} onClick={() => setMenu(false)}>
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="ml-auto">
            <Link to="/login" className="btn-primary text-sm px-5 py-2">Login</Link>
          </div>
        )}
      </div>
    </header>
  );
}
