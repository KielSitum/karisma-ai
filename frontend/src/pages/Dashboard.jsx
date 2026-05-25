import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCV } from '../contexts/CVContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const IcoBriefcase = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const IcoSparkle   = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.7l-6.2 4.2 2.4-7.2L2 9.2h7.6L12 2z"/></svg>;
const IcoFile      = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcoCalendar  = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const fmtDateShort = d => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(d));

export default function Dashboard() {
  const { user }             = useAuth();
  const { cvList, loading, getStats } = useCV();
  const stats  = getStats();
  const hasCVs = cvList.length > 0;

  const firstName = user?.full_name?.split(' ')[0] || 'User';
  const greeting  = hasCVs ? `Welcome back, ${firstName}!` : `Welcome, ${firstName}!`;

  const statCards = [
    { icon: IcoBriefcase, color: 'bg-[#EEEDFE] text-primary',     value: stats.careerMatches, label: 'CAREER MATCHES' },
    { icon: IcoSparkle,   color: 'bg-[#F3E8FF] text-purple-600',  value: stats.totalSkills,   label: 'TOTAL SKILLS IDENTIFIED' },
    { icon: IcoFile,      color: 'bg-[#DBEAFE] text-blue-600',    value: stats.cvsUploaded,   label: 'CVS UPLOADED' },
    { icon: IcoCalendar,  color: 'bg-[#E0F2FE] text-sky-600',     value: stats.lastUploadDate ? fmtDateShort(stats.lastUploadDate) : '—', label: 'LAST UPLOAD DATE' },
  ];

  // Spinner saat loading awal dari API
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-[#E8EAF2] border-t-primary rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="max-w-[1140px] mx-auto px-6 py-10">

          <div className="mb-8 animate-fade-up">
            <h1 className="font-display font-extrabold text-[clamp(28px,4vw,42px)] text-[#0F1226] mb-1 animate-fade-up">{greeting}</h1>
            <p className="text-[#5A5F7D] text-base">Your career journey is looking promising today.</p>
          </div>

          {!hasCVs && (
            <div className="card-base p-8 md:p-10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="font-display font-extrabold text-[clamp(22px,3vw,32px)] text-[#0F1226] mb-3 leading-tight">
                  Ready to advance your<br/>career?
                </h2>
                <p className="text-[#5A5F7D] text-sm leading-relaxed max-w-[500px]">
                  Upload your CV now to get personalized AI-driven insights and find your perfect career match. Let our technology help you find the right opportunities.
                </p>
              </div>
              <Link to="/upload-cv" className="btn-primary px-7 py-3.5 text-[15px] whitespace-nowrap flex-shrink-0">
                Get Started →
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-up">
            {statCards.map((c, i) => (
              <div key={i} className="card-base p-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
                  {c.icon}
                </div>
                <p className="font-display font-extrabold text-[clamp(22px,3vw,34px)] text-[#0F1226] leading-none mb-1.5">
                  {c.value}
                </p>
                <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest">{c.label}</p>
              </div>
            ))}
          </div>

          {hasCVs && (() => {
            const topAllMatches = cvList
              .flatMap(cv => (cv.matches || []).map(m => ({ ...m, cvId: cv.id, cvFilename: cv.filename })))
              .sort((a, b) => b.match_percentage - a.match_percentage)
              .slice(0, 3);

            if (topAllMatches.length === 0) return null;

            return (
              <div className="animate-fade-up">
                <h2 className="font-display font-bold text-2xl text-[#0F1226] mb-5">Top Career Matches</h2>
                <div className="flex flex-col gap-3">
                  {topAllMatches.map((m, i) => {
                    const badgeCls = m.match_percentage >= 80 ? 'bg-[#DCFCE7] text-[#15803D]' :
                                     m.match_percentage >= 60 ? 'bg-[#FEF3C7] text-[#B45309]' :
                                                                'bg-[#FEE2E2] text-[#DC2626]';
                    return (
                      <div key={i} className="card-base px-7 py-6 flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-[#0F1226] text-lg mb-2">{m.predicted_career}</p>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeCls}`}>
                              {m.match_percentage}% MATCH
                            </span>
                            <span className="text-xs font-medium text-[#9EA3BC] flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              {m.cvFilename}
                            </span>
                          </div>
                        </div>
                        <Link to={`/cv-detail/${m.cvId}`} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                          View Details →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </div>
      </main>
      <Footer />
    </div>
  );
}
