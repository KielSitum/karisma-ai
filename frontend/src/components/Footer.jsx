import { Link } from 'react-router-dom';

const links = ['Features','Pricing','About Us','Privacy Policy','Terms of Service'];

export default function Footer() {
  return (
    <footer className="border-t border-[#E8EAF2] bg-white py-5 mt-auto">
      <div className="max-w-[1140px] mx-auto px-6 flex flex-wrap items-center gap-4">
        <div>
          <p className="font-display font-bold text-[15px] text-[#0F1226]">Karisma AI</p>
          <p className="text-xs text-[#9EA3BC] mt-0.5">© 2026 Karisma AI. Empowering Indonesian Students.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 ml-auto">
          {links.map(l => (
            <Link key={l} to="#" className="text-xs text-[#9EA3BC] hover:text-primary transition-colors duration-150">{l}</Link>
          ))}
        </nav>
        <div className="flex gap-2">
          {[
            <svg key="g" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>,
            <svg key="m" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>,
            <svg key="s" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"/></svg>
          ].map((icon, i) => (
            <button key={i} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9EA3BC] hover:bg-primary-light hover:text-primary transition-all duration-150 cursor-pointer bg-none border-none">
              {icon}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}