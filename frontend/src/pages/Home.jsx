import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ─── Hero dashboard preview card ─── */
function DashboardPreview() {
  const bars = [30,50,40,75,55,88,65];
  return (
    <div className="relative flex justify-center lg:justify-end animate-float">
      <div className="absolute -top-4 right-2 bg-white border border-[#E8EAF2] shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold z-10 animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/>92% match found!
      </div>
      <div className="absolute -bottom-4 left-0 bg-white border border-[#E8EAF2] shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold z-10 animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"/>+4 new careers
      </div>

      <div className="bg-white border border-[#E8EAF2] rounded-2xl shadow-md p-6 w-full max-w-[340px]">
        <div className="flex items-center gap-1.5 mb-5">
          <span className="w-2 h-2 rounded-full bg-[#D0D3E8]"/>
          <span className="w-2 h-2 rounded-full bg-[#D0D3E8]"/>
          <span className="w-2 h-2 rounded-full bg-primary"/>
          <span className="ml-auto text-[10px] text-[#9EA3BC] font-display font-semibold tracking-wider">KARISMA AI DASHBOARD</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[['94%','Skill Match'],['12','Career Paths']].map(([v,l]) => (
            <div key={l} className="bg-[#F8F9FE] border border-[#E8EAF2] rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center mb-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <p className="font-display font-bold text-xl text-primary leading-none">{v}</p>
              <p className="text-xs text-[#9EA3BC] mt-1">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#5A5F7D]">Career Trajectory</p>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">OPTIMIZED</span>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {bars.map((h, i) => (
            <div key={i} className={`flex-1 rounded-t transition-all ${i === 5 ? 'bg-primary' : 'bg-[#E8EAF2]'}`} style={{height:`${h}%`}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Feature section cards ─── */
function FeatureCard({ icon, title, desc, purple = false }) {
  return (
    <div className={`rounded-2xl p-7 border ${purple ? 'bg-primary border-primary' : 'bg-white border-[#E8EAF2]'} shadow-card`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${purple ? 'bg-white/20 text-white' : 'bg-primary-light text-primary'}`}>
        {icon}
      </div>
      <h3 className={`font-display font-bold text-base mb-2 ${purple ? 'text-white' : 'text-[#0F1226]'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${purple ? 'text-white/80' : 'text-[#5A5F7D]'}`}>{desc}</p>
    </div>
  );
}

/* ─── About point ─── */
function AboutPoint({ icon, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-semibold text-sm text-[#0F1226] mb-0.5">{title}</p>
        <p className="text-sm text-[#5A5F7D]">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-[1140px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 bg-primary-light text-primary text-xs font-bold font-display px-4 py-1.5 rounded-full mb-6 tracking-wide">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              AI-POWERED CAREER GUIDANCE
            </span>
            <h1 className="font-display font-extrabold text-[clamp(30px,4vw,50px)] leading-[1.15] text-[#0F1226] mb-5">
              Navigate Your Career with{' '}
              <span className="text-primary">Artificial Intelligence</span>
            </h1>
            <p className="text-[16px] text-[#5A5F7D] leading-[1.75] mb-8 max-w-[460px]">
              Empowering students and professionals worldwide to bridge the gap between education and the professional world. Our AI analyzes your skills and charts a personalized path to your dream job.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-primary px-8 py-3 text-[15px]">Go to Dashboard →</Link>
                  <Link to="/upload-cv" className="btn-outline px-8 py-3 text-[15px]">Upload CV</Link>
                </>
              ) : (
                <Link to="/login" className="btn-primary px-8 py-3 text-[15px]">Get Started Free</Link>
              )}
            </div>
            {!user && <p className="text-sm text-[#9EA3BC] mt-4">✓ Free forever for students · ✓ No credit card required</p>}
          </div>

          <DashboardPreview />
        </div>
      </section>

      <section className="py-20 bg-white px-6">
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center max-w-[520px] mx-auto mb-14">
            <h2 className="font-display font-bold text-[clamp(22px,3vw,34px)] text-[#0F1226] mb-3">Master Your Career Journey</h2>
            <p className="text-[#5A5F7D] text-[15px] leading-relaxed">Sophisticated AI tools designed to translate your education into a competitive professional profile.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <FeatureCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} title="CV Skill Extraction" desc="Our neural networks scan your CV to identify hidden strengths and professional competencies you didn't know you had." />
            <FeatureCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} title="Career Prediction" desc="AI-driven forecasting based on current global market trends and your unique professional profile." purple />
            <FeatureCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>} title="Gap Analysis" desc="Identify the exact skills required for your dream role and get curated learning paths." />
          </div>

          <div className="bg-[#12111F] rounded-2xl p-8 relative overflow-hidden">
            <p className="text-[11px] font-bold text-[#8B85F0] tracking-widest mb-1 flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 010 20"/></svg>
              GLOBAL MARKET INTELLIGENCE
            </p>
            <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
              <div className="max-w-[340px]">
                <h3 className="font-display font-bold text-xl text-white mb-2">Global Success Path</h3>
                <p className="text-sm text-white/50 leading-relaxed">A central hub to manage your career trajectory, track progress, and refine your strategy with real-time global industry insights.</p>
              </div>
              <div className="flex-1 flex items-center gap-0 relative">
                {[
                  { label: 'Entry', filled: true, active: false, target: false },
                  { label: 'Mid-Level', filled: true, active: false, target: false },
                  { label: 'Senior', filled: false, active: true, target: true },
                  { label: 'Lead', filled: false, active: false, target: false },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2 relative">
                      {step.target && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          Target Achievement
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                        step.active
                          ? 'bg-white border-white shadow-glow'
                          : step.filled
                          ? 'bg-primary border-primary'
                          : 'bg-transparent border-white/20'
                      }`}/>
                      <span className={`text-[11px] font-semibold whitespace-nowrap ${
                        step.active ? 'text-white' : step.filled ? 'text-primary-mid' : 'text-white/30'
                      }`}>{step.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 mb-4" style={{
                        background: i < 2 ? 'linear-gradient(to right, #5B4FE8, #5B4FE8)' : 'rgba(255,255,255,0.1)'
                      }}/>
                    )}
                  </div>
                ))}
                <div className="ml-6 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B85F0" strokeWidth="2">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-bg">
        <div className="max-w-[1140px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,34px)] text-[#0F1226] mb-4">Designed for the Future of Global Industry</h2>
            <p className="text-[15px] text-[#5A5F7D] leading-[1.75] mb-8">We believe every student deserves a clear path to success. Karisma AI leverages cutting-edge technology to level the playing field, providing world-class career tools for the next generation of international organizations and leaders.</p>
            <div className="flex flex-col gap-5">
              <AboutPoint icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>} title="AI-Powered Insights" desc="Deep analysis of market trends to guide your unique professional journey." />
              <AboutPoint icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} title="Data-Driven Career Navigation" desc="Strategic planning based on real-time global industry requirements and competency gaps." />
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-[460px]">
              <div className="w-full rounded-2xl overflow-hidden bg-[#1E1B4B] p-3 shadow-lg">
                <img
                  src="/students-about.png"
                  alt="Indonesian students collaborating"
                  className="w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-[1140px] mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#12111F] to-[#1E1B4B] rounded-3xl py-16 px-10 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"/>
            <h2 className="font-display font-bold text-[clamp(22px,3vw,36px)] text-white mb-3 relative">Ready to transform your career?</h2>
            <p className="text-white/50 text-[15px] leading-relaxed mb-8 relative">Join thousands of students and start your journey with Karisma AI today.<br/>Free forever for students.</p>
            {user ? (
              <Link to="/upload-cv" className="btn-primary px-10 py-3.5 text-[15px] relative">Upload Your CV →</Link>
            ) : (
              <Link to="/login" className="btn-primary px-10 py-3.5 text-[15px] relative">Get Started Now</Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}