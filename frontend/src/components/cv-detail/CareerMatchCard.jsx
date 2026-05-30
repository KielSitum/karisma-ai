import MatchDonut from './MatchDonut';

const getTier = (pct) =>
  pct >= 80 ? { ring: '#22C55E', text: 'text-[#15803D]' } :
  pct >= 60 ? { ring: '#F59E0B', text: 'text-[#B45309]' } :
              { ring: '#EF4444', text: 'text-[#DC2626]' };

// Format salary dari job object (Min_Salary/Max_Salary dalam Rupiah)
function formatSalary(job, fallbackSalary) {
  // Kalau ada fallback salary string dari mock (saat data belum dari DB)
  if (fallbackSalary) return fallbackSalary;
  if (!job) return null;
  const { min_salary, max_salary } = job;
  if (!min_salary && !max_salary) return null;
  const fmt = n => n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(0)}jt`
    : `$${n.toLocaleString('id-ID')}`;
  if (min_salary && max_salary) return `${fmt(min_salary)} – ${fmt(max_salary)}`;
  return fmt(min_salary || max_salary);
}

export default function CareerMatchCard({ match, totalSkills }) {
  const {
    predicted_career,
    match_percentage,
    matched_skills = [],
    skill_gaps     = [],
    salary,         // field lama (mock) — masih support untuk kompatibilitas
    recommendation, // field lama (mock) — masih support untuk kompatibilitas
    job,            // dari backend real: { title, category, min_salary, max_salary }
  } = match;

  const tier        = getTier(match_percentage);
  const salaryLabel = formatSalary(job, salary);
  const searchQuery = encodeURIComponent(job?.title || predicted_career);

  return (
    <div className="card-base p-6 md:p-8 flex flex-col md:flex-row gap-8 animate-fade-up items-stretch">
      {/* ── Left: Score & Identity ── */}
<div className="flex flex-col items-center text-center flex-shrink-0 md:w-[240px] md:border-r border-[#E8EAF2] md:pr-8 justify-center gap-4 self-stretch">
  <MatchDonut percentage={match_percentage} size={110} strokeWidth={9} color={tier.ring} />
  <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest">Affinity Score</p>

  <h3 className="font-display font-extrabold text-[22px] text-[#0F1226] leading-tight">{predicted_career}</h3>

  {salaryLabel && (
    <span className="text-[13px] font-bold text-[#5B4FE8] bg-[#EEEDFE] px-3 py-1.5 rounded-lg">
      {salaryLabel} / mo
    </span>
  )}

  {job?.category && !salaryLabel && (
    <span className="text-[11px] font-semibold text-[#9EA3BC] bg-[#F8F9FE] border border-[#E8EAF2] px-2.5 py-1 rounded-full">
      {job.category}
    </span>
  )}

  
    <a href={`https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-bold transition-colors"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
    Search on LinkedIn
  </a>
</div>

      {/* ── Right: Details & Insight ── */}
      <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
          {/* Matched Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#0F1226]">Matched Skills</p>
            </div>
            {matched_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matched_skills.map(skill => (
                  <span key={skill} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F4F5FB] text-[#0F1226]">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9EA3BC] italic">Belum ada data</p>
            )}
          </div>

          {/* Skill Gaps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#0F1226]">Skill Gaps</p>
              <span className="text-xs font-bold text-[#9EA3BC]">{skill_gaps.length} skills</span>
            </div>
            {skill_gaps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skill_gaps.map(gap => (
                  <span key={gap} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-[#D1D5DB] text-[#5A5F7D]">
                    {gap}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9EA3BC] italic">Tidak ada gap skill</p>
            )}
          </div>
        </div>

        {/* Recommendation Insight — tampil jika ada (dari mock atau dari model nanti) */}
        {recommendation && (
          <div className="bg-[#F8F9FE] rounded-xl p-4 md:p-5 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <p className="text-sm text-[#5A5F7D] leading-relaxed pt-1.5">
              <span className="font-semibold text-[#0F1226]">Insight: </span>
              {recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
