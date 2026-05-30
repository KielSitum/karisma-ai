import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const matchBadge = pct => pct >= 80 ? 'text-[#15803D]' : pct >= 60 ? 'text-[#B45309]' : 'text-[#DC2626]';
const fmtDate      = d => new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));
const fmtDateShort = d => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(d));

export default function CVHistory() {
  const { cvList, loading, deleteCV, getStats } = useCV();
  const navigate = useNavigate();
  const stats    = getStats();
  const [deleting,    setDeleting]    = useState(null);
  const [sortConfig,  setSortConfig]  = useState({ key: 'DATE', direction: 'desc' });

  const handleDelete = async id => {
    setDeleting(id);
    try { await deleteCV(id); }
    catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  const handleSort = (key) => {
    if (key === 'ACTION') return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedCVs = [...cvList].sort((a, b) => {
    let aVal, bVal;
    if      (sortConfig.key === 'FILENAME')  { aVal = a.filename.toLowerCase();              bVal = b.filename.toLowerCase(); }
    else if (sortConfig.key === 'DATE')      { aVal = new Date(a.uploaded_at).getTime();     bVal = new Date(b.uploaded_at).getTime(); }
    else if (sortConfig.key === 'TOP MATCH') { aVal = a.matches?.[0]?.match_percentage || 0; bVal = b.matches?.[0]?.match_percentage || 0; }
    else if (sortConfig.key === 'SKILLS')    { aVal = a.analysis?.skills?.length || 0;       bVal = b.analysis?.skills?.length || 0; }
    else return 0;
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ?  1 : -1;
    return 0;
  });

  const topMatch = cvList[0]?.matches?.[0];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FE]">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-[#E8EAF2] rounded-full" style={{ borderTopColor: '#5B4FE8', animation: 'spin 0.8s linear infinite' }} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FE]">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-[1140px] mx-auto px-6 py-10">

          <div className="mb-8 animate-fade-up">
            <h1 className="font-display font-extrabold text-[clamp(26px,3.5vw,38px)] text-[#0F1226] mb-2">CV History</h1>
            <p className="text-[#5A5F7D] text-sm max-w-[500px]">Track your career progress and review past analysis results to fine-tune your professional profile for the job market.</p>
          </div>

          {/* ── Stats ── */}
          <div className="grid md:grid-cols-3 gap-4 mb-10 animate-fade-up">

            {/* Total CVs */}
            <div className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0EFFE] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#9EA3BC] font-semibold uppercase tracking-widest mb-0.5">Total CVs</p>
                <p className="font-display font-extrabold text-2xl text-[#0F1226]">{stats.cvsUploaded}</p>
                <p className="text-xs text-[#9EA3BC] mt-0.5">All time uploads</p>
              </div>
            </div>

            {/* Latest Match */}
            <div className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0EFFE] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#9EA3BC] font-semibold uppercase tracking-widest mb-0.5">Latest Match</p>
                <p className="font-display font-extrabold text-2xl text-[#000000">{topMatch ? `${topMatch.match_percentage}%` : '—'}</p>
                <p className="text-xs text-[#9EA3BC] mt-0.5">{topMatch?.predicted_career || 'No data'}</p>
              </div>
            </div>

            {/* Latest Upload */}
            <div className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0EFFE] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#9EA3BC] font-semibold uppercase tracking-widest mb-0.5">Latest Upload</p>
                <p className="font-display font-extrabold text-2xl text-[#0F1226]">{stats.lastUploadDate ? fmtDateShort(stats.lastUploadDate) : '—'}</p>
                <p className="text-xs text-[#9EA3BC] mt-0.5">{stats.lastUploadDate ? fmtDate(stats.lastUploadDate) : 'No uploads'}</p>
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-[#0F1226]">Upload History</h2>
            </div>

            {cvList.length === 0 ? (
              <div className="card-base p-16 text-center">
                <div className="w-16 h-16 bg-[#F0EFFE] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  </svg>
                </div>
                <p className="font-display font-semibold text-[#0F1226] mb-2">No CVs uploaded yet</p>
                <p className="text-sm text-[#9EA3BC] mb-5">Upload your first CV to see your career analysis results here.</p>
                <button onClick={() => navigate('/upload-cv')} className="btn-primary px-6 py-2.5 text-sm">Upload CV Now</button>
              </div>
            ) : (
              <div className="card-base overflow-hidden">

                {/* Table header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr] gap-4 px-6 py-3 border-b border-[#E8EAF2] bg-[#F8F9FE]">
                  {['FILENAME', 'DATE', 'TOP MATCH', 'SKILLS', 'ACTION'].map(h => (
                    <div
                      key={h}
                      className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 select-none transition-colors ${h !== 'ACTION' ? 'cursor-pointer hover:text-[#5B4FE8]' : ''} ${sortConfig.key === h ? 'text-[#5B4FE8]' : 'text-[#9EA3BC]'}`}
                      onClick={() => handleSort(h)}
                    >
                      {h}
                      {h !== 'ACTION' && (
                        <svg
                          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                          className={`transition-all ${sortConfig.key === h ? 'opacity-100' : 'opacity-0'} ${sortConfig.key === h && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                        >
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>

                {sortedCVs.map((cv, i) => {
                  const topM   = cv.matches?.[0];
                  const skills = cv.analysis?.skills?.length || 0;

                  return (
                    <div
                      key={cv.id}
                      className={`p-4 md:px-6 md:py-5 transition-colors hover:bg-[#F8F9FE] ${i < cvList.length - 1 ? 'border-b border-[#E8EAF2]' : ''}`}
                    >

                      {/* MOBILE */}
                      <div className="md:hidden flex flex-col gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 bg-[#F0EFFE] rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#0F1226] truncate">{cv.filename}</p>
                            <p className="text-xs text-[#9EA3BC] mt-1">{fmtDate(cv.uploaded_at)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="bg-[#F8F9FE] border border-[#E8EAF2] rounded-xl px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wider text-[#9EA3BC] font-bold mb-1">Match</p>
                            {topM ? (
                              <>
                                <p className={`text-sm font-bold ${matchBadge(topM.match_percentage)}`}>{topM.match_percentage}%</p>
                                <p className="text-xs text-[#5A5F7D] break-words">{topM.predicted_career}</p>
                              </>
                            ) : (
                              <p className="text-xs text-[#9EA3BC]">No data</p>
                            )}
                          </div>
                          <div className="bg-[#F8F9FE] border border-[#E8EAF2] rounded-xl px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wider text-[#9EA3BC] font-bold mb-1">Skills</p>
                            <p className="text-sm font-bold text-[#0F1226]">{skills}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/cv-detail/${cv.id}`)}
                            className="btn-primary text-xs px-4 py-2 rounded-full flex-1"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(cv.id)}
                            disabled={deleting === cv.id}
                            className="w-9 h-9 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all border-none disabled:opacity-40 flex-shrink-0"
                          >
                            {deleting === cv.id ? (
                              <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* DESKTOP */}
                      <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr] gap-4 items-center">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-[#F0EFFE] rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-[#0F1226] truncate">{cv.filename}</p>
                        </div>

                        <p className="text-sm text-[#5A5F7D]">{fmtDate(cv.uploaded_at)}</p>

                        {topM ? (
                          <div className="min-w-0">
                            <p className={`text-sm font-bold ${matchBadge(topM.match_percentage)}`}>{topM.match_percentage}% Match</p>
                            <p className="text-xs text-[#9EA3BC] truncate">{topM.predicted_career}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-[#9EA3BC]">—</p>
                        )}

                        <p className="text-sm font-semibold text-[#0F1226]">{skills}</p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/cv-detail/${cv.id}`)}
                            className="btn-primary text-xs px-4 py-2 rounded-full whitespace-nowrap"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(cv.id)}
                            disabled={deleting === cv.id}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all border-none disabled:opacity-40 flex-shrink-0"
                          >
                            {deleting === cv.id ? (
                              <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}