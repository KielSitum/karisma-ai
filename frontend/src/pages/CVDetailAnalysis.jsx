// src/pages/CVDetailAnalysis.jsx
import { useParams, Navigate } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import Navbar          from '../components/Navbar';
import Footer          from '../components/Footer';
import CVDetailHeader  from '../components/cv-detail/CVDetailHeader';
import CVSkillsCloud   from '../components/cv-detail/CVSkillsCloud';
import CareerMatchCard from '../components/cv-detail/CareerMatchCard';
import LearningRoadmap from '../components/LearningRoadmap';

export default function CVDetailAnalysis() {
  const { id } = useParams();
  const { getCV, loading } = useCV();
  const cv = getCV(id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div
            className="w-10 h-10 border-[3px] border-[#E8EAF2] border-t-primary rounded-full"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </main>
      </div>
    );
  }

  if (!cv) return <Navigate to="/cv-history" replace />;

  const totalSkills = cv.analysis?.skills?.length || 0;
  const hasMatches  = (cv.matches?.length || 0) > 0;
  const isPending   = cv.analysis?.status === 'pending';

  // Kumpulkan semua skill_gaps dari seluruh career matches (deduplicated, maks 5)
  const allSkillGaps = [
    ...new Set(
      (cv.matches || [])
        .flatMap((m) => m.skill_gaps || [])
        .filter(Boolean)
    ),
  ].slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-[920px] mx-auto px-6 py-10">

          {/* Header */}
          <CVDetailHeader cv={cv} />

          {/* Identified Skills */}
          <CVSkillsCloud skills={cv.analysis?.skills} />

          {/* Pending banner */}
          {isPending && !hasMatches && (
            <div className="card-base p-6 mb-6 border-l-4 border-l-amber-400 animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-bold text-[#0F1226] mb-1">Analysis Pending</h4>
                  <p className="text-sm text-[#5A5F7D] leading-relaxed">
                    Your CV has been successfully uploaded and the text has been extracted. Career matching will appear here once the AI model has finished processing.
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
                {cv.matches.map((match) => (
                  <CareerMatchCard key={match.id} match={match} totalSkills={totalSkills} />
                ))}
              </div>
            </div>
          )}

          {/*
           * ─── PERSONALIZED LEARNING ROADMAP (Gemini AI) ───────────────────
           * Ditampilkan hanya jika ada skill_gaps dari career matches.
           * allSkillGaps = gabungan Skill_gaps dari semua Career_Matches.
           */}
          {hasMatches && allSkillGaps.length > 0 && (
            <div className="mt-8 animate-fade-up">
              <LearningRoadmap skillGaps={allSkillGaps} />
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
