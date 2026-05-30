import { useParams, Navigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useCV } from '../contexts/CVContext';
import Navbar          from '../components/Navbar';
import Footer          from '../components/Footer';
import CVDetailHeader  from '../components/cv-detail/CVDetailHeader';
import CVSkillsCloud   from '../components/cv-detail/CVSkillsCloud';
import CareerMatchCard from '../components/cv-detail/CareerMatchCard';
import LearningRoadmap from '../components/LearningRoadmap';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Chatbot Component ────────────────────────────────────────────────────────
function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I'm Karisma Assistant 👋 How can I help you today?",
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('karisma_token');
      const res = await fetch(`${BASE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history: messages }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, an error occurred 🙏' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* POPUP */}
      {isOpen && (
        <div className="fixed z-[9998] bottom-0 right-0 w-screen h-dvh bg-white flex flex-col overflow-hidden sm:bottom-24 sm:right-6 sm:w-[360px] sm:h-[520px] sm:rounded-3xl sm:border sm:border-[#E8EAF2] sm:shadow-[0_8px_40px_rgba(91,79,232,0.15)]">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 bg-[#5B4FE8]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F0EFFE] flex items-center justify-center text-lg flex-shrink-0">
                <img src="/logo-karisma-2.png" alt="Karisma AI" className="h-8 w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-white truncate">Karisma Assistant</p>
                <div className="flex items-center gap-2 text-[11px] text-white/80">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col bg-[#F8F9FE]">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={`flex gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#F0EFFE] flex items-center justify-center text-sm flex-shrink-0">
                      <img src="/logo-karisma-2.png" alt="Karisma AI" className="h-5 w-auto object-contain" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed max-w-[85%] break-words overflow-hidden rounded-2xl ${
                      isUser
                        ? 'bg-[#5B4FE8] text-white rounded-br-md'
                        : 'bg-white text-[#0F1226] border border-[#E8EAF2] rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* TYPING */}
            {loading && (
              <div className="flex items-end gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#F0EFFE] flex items-center justify-center text-sm">🤖</div>
                <div className="bg-white border border-[#E8EAF2] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5B4FE8]/40 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#5B4FE8]/40 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#5B4FE8]/40 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-[#E8EAF2] p-3 flex items-end gap-2 bg-white flex-shrink-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 resize-none rounded-2xl border border-[#E8EAF2] px-4 py-3 text-sm outline-none focus:border-[#5B4FE8] focus:ring-2 focus:ring-[#5B4FE8]/10 max-h-28 overflow-y-auto"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm transition-all flex-shrink-0 ${
                !input.trim() || loading
                  ? 'bg-[#E8EAF2] cursor-not-allowed'
                  : 'bg-[#5B4FE8] hover:bg-[#4a3fd1] hover:scale-105'
              }`}
            >
              ➤
            </button>
          </div>
        </div>
      )}

  {/* FLOATING BUTTON */}
<button
  onClick={() => setIsOpen((prev) => !prev)}
  className={`fixed z-[9999] bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full shadow-xl active:scale-95 transition-all overflow-hidden border-2 group ${
    isOpen ? 'hidden sm:flex' : 'flex'
  }`}
  style={{ animation: isOpen ? 'none' : 'floatBounce 2s ease-in-out infinite' }}
>
  {isOpen ? (
      <div className="w-full h-full bg-[#5B4FE8] flex items-center justify-center">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </div>
  ) : (
    <div className="w-full h-full bg-[#5B4FE8] flex items-center justify-center">
      <img src="/Logo_chat.png" alt="Karisma AI" className="w-7 h-7 object-contain" />
      {/* Tooltip */}
      <span className="absolute bottom-16 right-0 bg-[#0F1226] text-white text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        Ask Karisma AI
        <span className="absolute -bottom-1 right-4 w-2 h-2 bg-[#0F1226] rotate-45" />
      </span>
    </div>
  )}
</button>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CVDetailAnalysis() {
  const { id } = useParams();
  const { getCV, loading } = useCV();
  const cv = getCV(id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FE]">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div
            className="w-10 h-10 border-[3px] border-[#E8EAF2] rounded-full"
            style={{ borderTopColor: '#5B4FE8', animation: 'spin 0.8s linear infinite' }}
          />
        </main>
      </div>
    );
  }

  if (!cv) return <Navigate to="/cv-history" replace />;

  const totalSkills = cv.analysis?.skills?.length || 0;
  const hasMatches  = (cv.matches?.length || 0) > 0;
  const isPending   = cv.analysis?.status === 'pending';

  const allSkillGaps = [
    ...new Set(
      (cv.matches || [])
        .flatMap((m) => m.skill_gaps || [])
        .filter(Boolean)
    ),
  ].slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FE] overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-8 sm:py-10">

          <CVDetailHeader cv={cv} />
          <CVSkillsCloud skills={cv.analysis?.skills} />

          {isPending && !hasMatches && (
            <div className="card-base p-4 sm:p-6 mb-6 border-l-4 border-l-amber-400 animate-fade-up">
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

          {hasMatches && (
            <div className="animate-fade-up">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#0F1226]">
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

          {hasMatches && allSkillGaps.length > 0 && (
            <div className="mt-8 animate-fade-up">
              <LearningRoadmap skillGaps={allSkillGaps} />
            </div>
          )}

        </div>
      </main>
      <Footer />

      {/* Chatbot — fixed kanan bawah */}
      <ChatbotPopup />
    </div>
  );
}