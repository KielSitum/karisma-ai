import { useParams, Navigate } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CVDetailHeader from '../components/cv-detail/CVDetailHeader';
import CVSkillsCloud from '../components/cv-detail/CVSkillsCloud';
import CareerMatchCard from '../components/cv-detail/CareerMatchCard';

export default function CVDetailAnalysis() {
  const { id } = useParams();
  const { getCV, cvList, loading } = useCV();
  const cv = getCV(id);

  // Tampilkan spinner saat loading dari API
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-[#E8EAF2] border-t-primary rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
        </main>
      </div>
    );
  }

  if (!cv) return <Navigate to="/cv-history" replace />;

  const totalSkills = cv.analysis?.skills?.length || 0;
  const hasMatches  = (cv.matches?.length || 0) > 0;
  const isPending   = cv.analysis?.status === 'pending';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-[920px] mx-auto px-6 py-10">

          {/* Header */}
          <CVDetailHeader cv={cv} />

          {/* Identified Skills */}
          <CVSkillsCloud skills={cv.analysis?.skills} />

          {/* Pending banner — tampil saat model belum memproses */}
          {isPending && !hasMatches && (
            <div className="card-base p-6 mb-6 border-l-4 border-l-amber-400 animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-bold text-[#0F1226] mb-1">Analysis Pending</h4>
                  <p className="text-sm text-[#5A5F7D] leading-relaxed">
                    CV berhasil diupload dan teks berhasil diekstrak. Career matching akan muncul di sini setelah AI model selesai memproses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Career Matches */}
          {hasMatches && (
            <div className="animate-fade-up">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-display font-bold text-xl text-[#0F1226]">
                  Top {cv.matches.length} Career Matches
                </h2>
                <div className="flex-1 h-px bg-[#E8EAF2]" />
              </div>
              <div className="flex flex-col gap-4">
                {cv.matches.map(match => (
                  <CareerMatchCard key={match.id} match={match} totalSkills={totalSkills} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
