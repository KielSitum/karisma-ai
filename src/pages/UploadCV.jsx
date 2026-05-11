import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCV } from '../contexts/CVContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STEPS = ['Extracting text from PDF…','Running NLP skill extraction…','Predicting career matches…','Calculating skill gaps…','Finalizing results…'];
const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:'Private & Secure', desc:'Your personal data is encrypted and handled according to Indonesian privacy laws.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title:'Instant Analysis', desc:'Receive skill mapping and career gap analysis in less than 30 seconds.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, title:'Smart Optimizing', desc:'AI suggestions to improve your CV impact for top-tier Indonesian companies.' },
];

export default function UploadCV() {
  const { uploadAndAnalyze, analyzing } = useCV();
  const navigate   = useNavigate();
  const fileRef    = useRef();
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(0);

  const validate = f => {
    if (!f) return 'Pilih file terlebih dahulu.';
    if (f.type !== 'application/pdf') return 'Hanya file PDF yang diizinkan.';
    if (f.size > 10*1024*1024) return 'Ukuran file maksimal 10 MB.';
    return null;
  };
  const pick = f => { const e = validate(f); if(e) return setError(e); setError(''); setFile(f); };
  const onDrop = e => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); };

  const handleAnalyze = async () => {
    if (!file) return setError('Pilih file CV terlebih dahulu.');
    setError('');
    let s = 0;
    const iv = setInterval(() => { s++; setStep(s); if(s >= STEPS.length-1) clearInterval(iv); }, 600);
    try {
      const result = await uploadAndAnalyze(file);
      clearInterval(iv);
      navigate('/cv-history', { state: { highlightId: result.id } });
    } catch(e) { clearInterval(iv); setError(e.message); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-[820px] mx-auto px-6 py-12">
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="font-display font-extrabold text-[clamp(28px,4vw,44px)] text-[#0F1226] mb-3 leading-tight">Analyze your CV<br/>with AI</h1>
            <p className="text-[#5A5F7D] text-[15px] max-w-[500px] mx-auto leading-relaxed">Our advanced AI will scan your professional profile to identify key skills and match you with Indonesian career opportunities.</p>
          </div>

          {analyzing ? (
            <div className="card-base p-10 text-center mb-6 animate-fade-in">
              <div className="w-12 h-12 border-[3.5px] border-[#E8EAF2] border-t-primary rounded-full mx-auto mb-6" style={{animation:'spin 0.8s linear infinite'}}/>
              <h3 className="font-display font-bold text-lg text-[#0F1226] mb-2">Analyzing your CV…</h3>
              <p className="text-sm text-[#5A5F7D] mb-6">Our AI is working. This may take up to 30 seconds.</p>
              <div className="flex flex-col gap-2.5 text-left max-w-[280px] mx-auto">
                {STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? 'text-[#0F1226]' : 'text-[#9EA3BC]'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${i < step ? 'bg-green-400' : i === step ? 'bg-primary' : 'bg-[#E8EAF2]'}`}
                      style={i === step ? {animation:'pulse 1s ease-in-out infinite'} : {}}/>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-200 mb-4 animate-fade-up
                ${dragging ? 'border-primary bg-primary-light scale-[1.01]' : file ? 'border-primary bg-white cursor-default' : 'border-[#D0D3E8] bg-white hover:border-primary hover:bg-primary-light'}`}
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={onDrop}
              onClick={()=>!file && fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf" hidden onChange={e=>pick(e.target.files[0])} />

              {file ? (
                <div className="flex items-center gap-4 text-left max-w-[380px] mx-auto">
                  <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0F1226] text-sm truncate">{file.name}</p>
                    <p className="text-xs text-[#9EA3BC] mt-0.5">{(file.size/1024).toFixed(0)} KB · PDF</p>
                    <div className="flex items-center gap-1 mt-1 text-green-500 text-xs font-semibold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Ready to analyze
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setFile(null)}} className="p-1.5 rounded-lg hover:bg-[#F8F9FE] text-[#9EA3BC] hover:text-[#5A5F7D] transition-colors cursor-pointer bg-none border-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#0F1226] mb-2">Click to upload or drag and drop</h3>
                  <p className="text-sm text-[#5A5F7D] mb-5">Your files will be processed securely using Karisma AI.</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {[['📄','Supported format: PDF'],['🌐','Please upload your CV in English']].map(([e,t])=>(
                      <span key={t} className="flex items-center gap-1.5 text-xs text-[#9EA3BC] bg-[#F8F9FE] border border-[#E8EAF2] px-3 py-1.5 rounded-full">{e} {t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!analyzing && (
            <div className="flex justify-center gap-3 mb-3">
              {!file
                ? <button onClick={()=>fileRef.current.click()} className="btn-outline gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Select File from Computer ⊕
                  </button>
                : <>
                    <button onClick={()=>setFile(null)} className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#5A5F7D] hover:bg-[#E8EAF2] transition-colors cursor-pointer bg-none border-none font-display">Change file</button>
                    <button onClick={handleAnalyze} className="btn-primary px-8 py-2.5 text-sm gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      Analyze with AI
                    </button>
                  </>
              }
            </div>
          )}

          {error && <p className="text-center text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-4 animate-fade-in">{error}</p>}

          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {FEATURES.map((f,i) => (
              <div key={i} className="card-base p-6">
                <div className="w-10 h-10 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                <h4 className="font-display font-bold text-sm text-[#0F1226] mb-1.5">{f.title}</h4>
                <p className="text-xs text-[#5A5F7D] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}