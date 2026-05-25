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
      </div>
    </footer>
  );
}