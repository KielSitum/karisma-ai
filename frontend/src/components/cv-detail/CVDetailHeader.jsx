import { Link } from 'react-router-dom';

const fmtDate = d => new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));

export default function CVDetailHeader({ cv }) {
  // Support status dari DB (pending/analyzed) atau selalu "analyzed" jika tidak ada status
  const status     = cv?.analysis?.status;
  const isPending  = status === 'pending';

  return (
    <div className="card-base p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 animate-fade-up">
      <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-[#0F1226] text-base truncate">{cv.filename}</p>
        <div className="flex items-center gap-2 mt-1">
          {isPending ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pending Analysis
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
              CV successfully analyzed
            </span>
          )}
          <span className="text-xs text-[#9EA3BC]">·</span>
          <span className="text-xs text-[#9EA3BC]">{fmtDate(cv.uploaded_at)}</span>
        </div>
      </div>

      <Link
        to="/cv-history"
        className="flex items-center gap-1.5 text-sm font-semibold text-[#5A5F7D] bg-[#F8F9FE] border border-[#E8EAF2] px-4 py-2 rounded-xl hover:text-primary hover:border-primary transition-all duration-200 flex-shrink-0"
        style={{ textDecoration: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to History
      </Link>
    </div>
  );
}
