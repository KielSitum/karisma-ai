const IcoBriefcase = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const IcoGrad      = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10l-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>;
const IcoCert      = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>;
const IcoSparkle   = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.7l-6.2 4.2 2.4-7.2L2 9.2h7.6L12 2z"/></svg>;

export default function CVStatsGrid({ analysis }) {
  if (!analysis) return null;

  // Support kedua format: mock (experience/education/certifications) dan real DB (num_pages/raw_text/status)
  const experience      = analysis.experience || (analysis.num_pages ? `${analysis.num_pages} pages` : '—');
  const education       = analysis.education  || (analysis.status === 'analyzed' ? 'Analyzed' : analysis.status === 'pending' ? 'Pending' : '—');
  const certifications  = analysis.certifications ?? (analysis.raw_text ? Math.round(analysis.raw_text.length / 500) : 0);
  const totalSkills     = analysis.skills?.length || 0;

  const stats = [
    { icon: IcoBriefcase, color: 'bg-[#EEEDFE] text-primary',     label: 'Experience',     sublabel: 'Verified',   value: experience },
    { icon: IcoGrad,      color: 'bg-[#F3E8FF] text-purple-600',  label: 'Education',      sublabel: 'Level',      value: education },
    { icon: IcoCert,      color: 'bg-[#DBEAFE] text-blue-600',    label: 'Certifications', sublabel: 'Active',     value: certifications },
    { icon: IcoSparkle,   color: 'bg-[#E0F2FE] text-sky-600',     label: 'Total Skills',   sublabel: 'Identified', value: totalSkills },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up">
      {stats.map((s, i) => (
        <div key={i} className="card-base p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <span className="text-[10px] font-bold text-[#9EA3BC] uppercase tracking-wider">{s.sublabel}</span>
          </div>
          <p className="text-[11px] text-[#9EA3BC] font-medium mb-0.5">{s.label}</p>
          <p className="font-display font-extrabold text-[#0F1226] text-lg leading-tight">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
