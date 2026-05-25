import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuroraBackground } from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function CvCard({ name, contact, summary, org, period, role, bullets, skillRows, score }) {
  return (
    <div className="bg-white border border-[#D1D5DB] rounded-md p-3 flex-shrink-0"
      style={{ fontFamily: '"Times New Roman", serif' }}>

      {/* Header */}
      <p className="text-center text-[11px] font-bold text-[#0F1226] mb-0.5">{name}</p>
      <p className="text-center text-[8px] text-[#374151] mb-2 leading-relaxed">
        {contact.split('|').map((c, i) => (
          <span key={i}>{i > 0 && ' | '}<span className={i === 2 ? 'text-[#0F1226] font-semibold' : ''}>{c.trim()}</span></span>
        ))}
      </p>

      {/* Summary */}
      {summary && (
        <div className="mt-1.5">
          <div className="text-[8px] font-bold text-[#0F1226] uppercase tracking-widest border-b border-[#0F1226] pb-0.5 mb-1">Summary</div>
          <p className="text-[8px] text-[#374151] leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      <div className="mt-1.5">
        <div className="text-[8px] font-bold text-[#0F1226] uppercase tracking-widest border-b border-[#0F1226] pb-0.5 mb-1">Professional Experience</div>
        <div className="flex justify-between items-baseline">
          <span className="text-[9px] font-bold text-[#0F1226]">{org}</span>
          <span className="text-[8px] text-[#6B7280] italic">{period}</span>
        </div>
        <p className="text-[8px] text-[#0F1226] italic font-bold mb-1">{role}</p>
        {bullets.map((b, i) => (
          <p key={i} className="text-[8px] text-[#374151] pl-3 relative mb-1 leading-snug"
            style={{ paddingLeft: '10px' }}>
            <span className="absolute left-0.5 text-[#5B4FE8]">•</span>{b}
          </p>
        ))}
      </div>

      {/* Skills */}
      {skillRows && (
        <div className="mt-1.5">
          <div className="text-[8px] font-bold text-[#0F1226] uppercase tracking-widest border-b border-[#0F1226] pb-0.5 mb-1">Technical Skills</div>
          {skillRows.map((s, i) => (
            <p key={i} className="text-[8px] text-[#374151] mb-0.5">
              <b className="text-[#0F1226]">{s.label}:</b> {s.value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const cvCards = [
  {
    name: 'Ahmad Rizki Pratama',
    contact: 'Jakarta, Indonesia | (+62) 812-3456-7890 | ahmad.rizki@gmail.com | linkedin.com/in/ahmadrizki',
    summary: 'Software engineer with 4+ years building scalable web applications for fintech startups across Southeast Asia.',
    org: 'PT. Gojek Indonesia', period: '2022 – Present', role: 'Senior Software Engineer',
    bullets: ['Reduced API latency by 40% through query optimization.', 'Led migration of monolith to microservices, improving deployment 3x.', 'Mentored 3 junior engineers on code quality and best practices.'],
    skillRows: [{ label: 'Languages', value: 'JavaScript, TypeScript, Python, Go' }, { label: 'Tools', value: 'AWS, Docker, PostgreSQL, Redis, Git' }],
    score: null,
  },
  {
    name: 'Siti Nurhaliza Wijaya',
    contact: 'Surabaya, Indonesia | (+62) 878-5544-3322 | siti.wijaya@email.com | linkedin.com/in/sitinw',
    summary: 'Data scientist specializing in NLP and predictive modeling with proven impact in e-commerce systems.',
    org: 'Tokopedia', period: '2021 – Present', role: 'Data Scientist',
    bullets: ['Improved recommendation CTR by 23% using collaborative filtering.', 'Built fraud detection pipeline saving $2M annually.', 'Developed NLP model for product categorization with 91% accuracy.'],
    skillRows: [{ label: 'Languages', value: 'Python, R, SQL' }, { label: 'Tools', value: 'TensorFlow, Tableau, BigQuery, Airflow' }],
    score: 94,
  },
  {
    name: 'Budi Santoso',
    contact: 'Bandung, Indonesia | (+62) 811-9876-5432 | budi.santoso@mail.com | linkedin.com/in/budisantoso',
    summary: 'Product manager with 5 years driving 0-to-1 products in fintech and healthtech.',
    org: 'OVO Financial', period: '2020 – Present', role: 'Senior Product Manager',
    bullets: ['Launched digital wallet feature for 2M+ users within 3 months.', 'Increased DAU by 35% through onboarding flow redesign.'],
    skillRows: [{ label: 'Product', value: 'Agile, Scrum, A/B Testing, OKRs' }, { label: 'Tools', value: 'Figma, JIRA, Mixpanel, SQL' }],
    score: 96,
  },
  {
    name: 'Dewi Rahayu Putri',
    contact: 'Yogyakarta, Indonesia | (+62) 857-9012-3456 | dewi.rahayu@email.com | linkedin.com/in/dewirp',
    summary: 'UI/UX designer with 3 years crafting human-centered digital products focused on accessibility and conversion.',
    org: 'Bukalapak', period: '2022 – Present', role: 'UI/UX Designer',
    bullets: ['Redesigned checkout flow reducing cart abandonment by 18%.', 'Built design system used by 12 product teams company-wide.'],
    skillRows: [{ label: 'Design', value: 'Figma, Prototyping, User Research' }, { label: 'Others', value: 'HTML, CSS, Framer, Zeplin' }],
    score: 91,
  },
  {
    name: 'Fajar Nugroho',
    contact: 'Medan, Indonesia | (+62) 813-6677-8899 | fajar.nugroho@mail.com | linkedin.com/in/fajarnugroho',
    summary: 'Digital marketer with expertise in performance marketing and growth hacking for B2C brands across SEA.',
    org: 'Shopee Indonesia', period: '2021 – Present', role: 'Digital Marketing Manager',
    bullets: ['Scaled ROAS from 2.1x to 5.4x across all paid channels in 18 months.', 'Grew organic traffic 120% via technical SEO improvements.', 'Managed $500K annual budget across Google, Meta, and TikTok.'],
    skillRows: [{ label: 'Ads', value: 'Google Ads, Meta Ads, TikTok Ads' }, { label: 'Analytics', value: 'GA4, Mixpanel, Looker Studio, SQL' }],
    score: 89,
  },
  {
    name: 'Rina Kusuma Dewi',
    contact: 'Semarang, Indonesia | (+62) 857-2233-4455 | rina.kusuma@gmail.com | linkedin.com/in/rinakd',
    summary: 'Financial analyst with strong modeling skills. Experienced in FP&A for manufacturing and FMCG sectors.',
    org: 'Unilever Indonesia', period: '2020 – Present', role: 'Financial Analyst',
    bullets: ['Automated P&L dashboard reducing reporting time by 60%.', 'Delivered variance analysis for $50M annual operating budget.'],
    skillRows: [{ label: 'Finance', value: 'Financial Modeling, FP&A, Forecasting' }, { label: 'Tools', value: 'Excel, SAP, Power BI, SQL' }],
    score: 88,
  },
];

function CvScrollCol({ direction, cards }) {
  const doubled = [...cards, ...cards];
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex flex-col gap-2.5"
        style={{ animation: `${direction === 'up' ? 'cvScrollUp' : 'cvScrollDown'} 22s linear infinite` }}>
        {doubled.map((c, i) => <CvCard key={i} {...c} />)}
      </div>
    </div>
  );
}

/* ─── Scroll fade-up repeatable ─── */
function useFadeUp() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
        } else {
          el.classList.remove('is-visible');
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useFadeUp();
  return (
    <div ref={ref} className={`fade-up ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
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

/* ─── CV Step tracker (horizontal) ─── */
const cvSteps = [
  { icon: 'file-text', label: 'Extracting PDF', sub: 'Parsed',       state: 'done'    },
  { icon: 'cpu',       label: 'Running NLP',    sub: 'Extracted',    state: 'done'    },
  { icon: 'chart-dots',label: 'Predicting',     sub: 'In progress…', state: 'active'  },
  { icon: 'award',     label: 'Result',         sub: 'Waiting',      state: 'pending' },
];

const stepDotStyle = {
  done:    { background: 'rgba(91,79,232,0.15)', color: '#5B4FE8' },
  active:  { background: '#5B4FE8',              color: '#fff'     },
  pending: { background: 'rgba(91,79,232,0.05)', color: 'rgba(91,79,232,0.25)', border: '1px solid rgba(91,79,232,0.12)' },
};
const stepNameColor = { done: '#5B4FE8', active: '#5B4FE8', pending: 'rgba(91,79,232,0.25)' };
const stepSubColor  = { done: 'rgba(91,79,232,0.45)', active: '#8B85F0', pending: 'rgba(91,79,232,0.18)' };

function CvStepTracker() {
  return (
    <div className="flex items-start mt-5">
      {cvSteps.map((step, i) => (
        <div key={i} className="flex flex-col items-center flex-1 relative">
          {/* connector line to next */}
          {i < cvSteps.length - 1 && (
            <div
              className="absolute top-[13px] h-[1.5px]"
              style={{
                left: 'calc(50% + 13px)',
                right: 'calc(-50% + 13px)',
                background: step.state === 'done'
                  ? '#5B4FE8'
                  : step.state === 'active'
                  ? 'linear-gradient(to right, #5B4FE8, rgba(91,79,232,0.15))'
                  : 'rgba(91,79,232,0.1)',
              }}
            />
          )}
          {/* dot */}
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 mb-[7px] relative z-10"
            style={stepDotStyle[step.state]}
          >
            <i className={`ti ti-${step.icon}`} style={{ fontSize: '12px' }} aria-hidden="true" />
          </div>
          <span className="text-[11px] font-semibold text-center" style={{ color: stepNameColor[step.state] }}>{step.label}</span>
          <span className="text-[10px] text-center mt-0.5" style={{ color: stepSubColor[step.state] }}>{step.sub}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        @keyframes shapeEnter {
          from { opacity: 0; transform: translateY(-60px) rotate(var(--r, 0deg)); }
          to   { opacity: 1; transform: translateY(0px)   rotate(var(--r, 0deg)); }
        }
        @keyframes shapeFloat {
          0%, 100% { transform: translateY(0px)  rotate(var(--r, 0deg)); }
          50%       { transform: translateY(14px) rotate(var(--r, 0deg)); }
        }
        .shape-enter {
          opacity: 0;
          animation:
            shapeEnter 2.4s cubic-bezier(0.23,0.86,0.39,0.96) forwards,
            shapeFloat 12s ease-in-out 2.4s infinite;
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        {/* ══ HERO ══ */}
        <AuroraBackground>
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            <div className="relative z-10 max-w-3xl mx-auto px-6 w-full text-center py-16">

              <FadeUp delay={100}>
                <div className="inline-flex items-center gap-1.5 bg-primary-light text-primary text-xs font-bold font-display px-4 py-1.5 rounded-full mb-6 tracking-wide border border-primary/10">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  AI-POWERED CAREER GUIDANCE
                </div>
              </FadeUp>

              <FadeUp delay={250}>
                <h1
                  className="font-display font-extrabold leading-[1.13] text-[#0F1226] mb-5 tracking-tight"
                  style={{ fontSize: 'clamp(32px,5vw,58px)' }}
                >
                  Navigate Your Career
                  <br />
                  with{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(to right, #5B4FE8, #818CF8)' }}
                  >
                    Artificial Intelligence
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={400}>
                <p className="text-[16px] text-[#5A5F7D] leading-[1.75] mb-8 max-w-[540px] mx-auto">
                  Empowering students and professionals worldwide to bridge the gap between education and the professional world.
                  Our AI analyzes your skills and charts a personalized path to your dream job.
                </p>
              </FadeUp>

              <FadeUp delay={550}>
                <div className="flex flex-wrap gap-3 justify-center">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="btn-primary px-8 py-3 text-[15px]">
                        Go to Dashboard →
                      </Link>
                      <Link to="/upload-cv" className="btn-outline px-8 py-3 text-[15px]">
                        Upload CV
                      </Link>
                    </>
                  ) : (
                    <Link to="/login" className="btn-primary px-8 py-3 text-[15px]">
                      Get Started Free
                    </Link>
                  )}
                </div>
              </FadeUp>

              {!user && (
                <FadeUp delay={700}>
                  <p className="text-sm text-[#9EA3BC] mt-4">
                    ✓ Free forever for students · ✓ No credit card required
                  </p>
                </FadeUp>
              )}

            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #F8F9FE, transparent)' }} />
          </section>
        </AuroraBackground>

        {/* ══ FEATURES ══ */}
        <section className="py-20 bg-[#F8F9FE] px-6">
          <div className="max-w-[1140px] mx-auto">

            <FadeUp className="text-center max-w-[520px] mx-auto mb-14">
              <h2 className="font-display font-bold text-[#0F1226] mb-3" style={{ fontSize: 'clamp(22px,3vw,34px)' }}>
                Master Your Career Journey
              </h2>
              <p className="text-[#5A5F7D] text-[15px] leading-relaxed">
                Sophisticated AI tools designed to translate your education into a competitive professional profile.
              </p>
            </FadeUp>

            {/* ── Bento grid ── */}
            <FadeUp>
              {/* Row 1: Global Success Path (large left 2fr) + Career Prediction (small right 1fr) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                {/* Global Success Path — large left */}
                <div className="md:col-span-2 bg-white border border-[#E8EAF2] rounded-2xl p-8 relative overflow-hidden shadow-card">
                  <p className="text-[11px] font-bold text-[#8B85F0] tracking-widest mb-1 flex items-center gap-2">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 010 20"/>
                    </svg>
                    GLOBAL MARKET INTELLIGENCE
                  </p>
                  <h3 className="font-display font-bold text-base text-[#0F1226] mb-2">Global Success Path</h3>
                  <p className="text-sm text-[#5A5F7D] leading-relaxed">
                    Manage your career trajectory with real-time global industry insights and AI-powered recommendations tailored to your goals.
                  </p>
                </div>

                {/* Career Prediction — small right */}
                <div className="bg-white border border-[#E8EAF2] rounded-2xl p-8 relative overflow-hidden shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                      <polyline points="16 7 22 7 22 13"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F1226] mb-2">Career Prediction</h3>
                  <p className="text-sm text-[#5A5F7D] leading-relaxed">
                    AI-driven forecasting based on global market trends and your professional profile.
                  </p>
                </div>

              </div>
            </FadeUp>

            <FadeUp delay={100}>
              {/* Row 2: Gap Analysis (small left 1fr) + CV Skill Extraction (large right 2fr) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                {/* Gap Analysis — small left */}
                <div className="bg-white border border-[#E8EAF2] rounded-2xl p-8 relative overflow-hidden shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F1226] mb-2">Gap Analysis</h3>
                  <p className="text-sm text-[#5A5F7D] leading-relaxed">
                    Identify the exact skills you're missing and get a curated learning path to close each gap fast.
                  </p>
                </div>

                {/* CV Skill Extraction — large right */}
                <div className="md:col-span-2 bg-white border border-[#E8EAF2] rounded-2xl p-8 relative overflow-hidden shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F1226] mb-2">CV Skill Extraction</h3>
                  <p className="text-sm text-[#5A5F7D] leading-relaxed">
                    Neural networks scan your CV to surface hidden strengths and professional competencies.
                  </p>
                  <CvStepTracker />
                </div>

              </div>
            </FadeUp>

          </div>
        </section>

        {/* ══ ABOUT ══ */}
        <section className="py-20 px-6 bg-[#F8F9FE]">
          <div className="max-w-[1140px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <h2 className="font-display font-bold text-[#0F1226] mb-4" style={{ fontSize: 'clamp(22px,3vw,34px)' }}>
                Designed for the Future of Global Industry
              </h2>
              <p className="text-[15px] text-[#5A5F7D] leading-[1.75] mb-8">
                We believe every student deserves a clear path to success. Karisma AI leverages cutting-edge technology to level the playing field,
                providing world-class career tools for the next generation of international organizations and leaders.
              </p>
              <div className="flex flex-col gap-5">
                <AboutPoint
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>}
                  title="AI-Powered Insights"
                  desc="Deep analysis of market trends to guide your unique professional journey."
                />
                <AboutPoint
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                  title="Data-Driven Career Navigation"
                  desc="Strategic planning based on real-time global industry requirements and competency gaps."
                />
              </div>
            </FadeUp>
            <FadeUp delay={150} className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-[460px] h-[420px] overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, #F8F9FE, transparent)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, #F8F9FE, transparent)' }} />
                <div className="flex gap-3 h-full">
                  <CvScrollCol direction="up" cards={cvCards.slice(0, 3)} />
                  <CvScrollCol direction="down" cards={cvCards.slice(3, 6)} />
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="py-20 px-6 bg-[#F8F9FE]">
          <div className="max-w-[1140px] mx-auto">
            <FadeUp>
              <div className="relative overflow-hidden rounded-3xl py-16 px-10 text-center"
                style={{ background: 'linear-gradient(135deg, #12111F 0%, #1E1B4B 100%)' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: 'rgba(91,79,232,0.2)', filter: 'blur(60px)' }} />
                <h2 className="font-display font-bold text-white mb-3 relative" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>
                  Ready to transform your career?
                </h2>
                <p className="text-white/50 text-[15px] leading-relaxed mb-8 relative">
                  Join thousands of students and start your journey with Karisma AI today.<br />Free forever for students.
                </p>
                {user ? (
                  <Link to="/upload-cv" className="btn-primary px-10 py-3.5 text-[15px] relative">Upload Your CV →</Link>
                ) : (
                  <Link to="/login" className="btn-primary px-10 py-3.5 text-[15px] relative">Get Started Now</Link>
                )}
              </div>
            </FadeUp>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
