import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const matchBadge = pct => pct >= 85 ? 'bg-[#DCFCE7] text-[#15803D]' : pct >= 70 ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FEE2E2] text-[#EF4444]';

const fmtDate = d => new Intl.DateTimeFormat('en',{year:'numeric',month:'short',day:'numeric'}).format(new Date(d));
const fmtDateShort = d => new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(new Date(d));

export default function CVHistory() {
  const { cvList, deleteCV, getStats } = useCV();
  const navigate   = useNavigate();
  const stats      = getStats();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async id => {
    setDeleting(id);
    await new Promise(r => setTimeout(r, 400));
    deleteCV(id);
    setDeleting(null);
  };

  const topMatch = cvList[0]?.matches?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-[1140px] mx-auto px-6 py-10">

          <div className="mb-8 animate-fade-up">
            <h1 className="font-display font-extrabold text-[clamp(26px,3.5vw,38px)] text-[#0F1226] mb-2">CV History</h1>
            <p className="text-[#5A5F7D] text-sm max-w-[500px]">Track your career progress and review past analysis results to fine-tune your professional profile for the Indonesian job market.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10 animate-fade-up">
            <div className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <p className="text-xs text-[#9EA3BC] font-semibold uppercase tracking-widest mb-0.5">Total CVs</p>
                <p className="font-display font-extrabold text-2xl text-[#0F1226]">{stats.cvsUploaded}</p>
                <p className="text-xs text-[#9EA3BC] mt-0.5">All time uploads</p>
              </div>
            </div>
            <div className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
              </div>
              <div>
                <p className="text-xs text-[#9EA3BC] font-semibold uppercase tracking-widest mb-0.5">Latest Match</p>
                <p className="font-display font-extrabold text-2xl text-primary">{topMatch ? `${topMatch.match_percentage}%` : '—'}</p>
                <p className="text-xs text-[#9EA3BC] mt-0.5">{topMatch?.predicted_career || 'No data'}</p>
              </div>
            </div>
            <div className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p className="text-xs text-[#9EA3BC] font-semibold uppercase tracking-widest mb-0.5">Latest Upload</p>
                <p className="font-display font-extrabold text-2xl text-[#0F1226]">{stats.lastUploadDate ? fmtDateShort(stats.lastUploadDate) : '—'}</p>
                <p className="text-xs text-[#9EA3BC] mt-0.5">{stats.lastUploadDate ? fmtDate(stats.lastUploadDate) : 'No uploads'}</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-[#0F1226]">Upload History</h2>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer bg-none border-none font-display">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filter
              </button>
            </div>

            {cvList.length === 0 ? (
              <div className="card-base p-16 text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                </div>
                <p className="font-display font-semibold text-[#0F1226] mb-2">No CVs uploaded yet</p>
                <p className="text-sm text-[#9EA3BC] mb-5">Upload your first CV to see your career analysis results here.</p>
                <button onClick={()=>navigate('/upload-cv')} className="btn-primary px-6 py-2.5 text-sm">Upload CV Now</button>
              </div>
            ) : (
              <div className="card-base overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr] gap-4 px-6 py-3 border-b border-[#E8EAF2] bg-[#F8F9FE]">
                  {['FILENAME','DATE','TOP MATCH','SKILLS','ACTION'].map(h => (
                    <p key={h} className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-wider">{h}</p>
                  ))}
                </div>

                {cvList.map((cv, i) => {
                  const topM = cv.matches?.[0];
                  const skills = cv.analysis?.skills?.length || 0;
                  return (
                    <div key={cv.id} className={`grid grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr] gap-4 px-6 py-5 items-center transition-colors hover:bg-[#F8F9FE] ${i < cvList.length-1 ? 'border-b border-[#E8EAF2]' : ''}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <p className="text-sm font-medium text-[#0F1226] truncate">{cv.filename}</p>
                      </div>
                      <p className="text-sm text-[#5A5F7D]">{fmtDate(cv.uploaded_at)}</p>
                      {topM ? (
                        <div>
                          <p className={`text-sm font-bold ${matchBadge(topM.match_percentage).split(' ')[1]}`}>{topM.match_percentage}% Match</p>
                          <p className="text-xs text-[#9EA3BC]">{topM.predicted_career}</p>
                        </div>
                      ) : <p className="text-sm text-[#9EA3BC]">—</p>}
                      <p className="text-sm font-semibold text-[#0F1226]">{skills}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>navigate('/cv-history', { state: { viewId: cv.id } })}
                          className="btn-primary text-xs px-4 py-2 rounded-full">View Details</button>
                        <button onClick={()=>handleDelete(cv.id)} disabled={deleting === cv.id}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer border-none disabled:opacity-40">
                          {deleting === cv.id
                            ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full" style={{animation:'spin 0.7s linear infinite'}}/>
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                          }
                        </button>
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