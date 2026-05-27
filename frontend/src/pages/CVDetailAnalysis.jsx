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
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hello! I'm Karisma Assistant 👋 How can I help you with your career and skill development today?", },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const textareaRef           = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg    = { role: 'user', text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('karisma_token');
      const res   = await fetch(`${BASE_URL}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Sorry, an error occurred. Please try again 🙏' },
      ]);
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
      {/* Popup — position fixed, tidak ganggu layout */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          width: '340px',
          height: '460px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
          border: '1px solid #E8EAF2',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>Karisma Assistant</div>
                <div style={{ fontSize: '11px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#4ADE80', borderRadius: '50%', display: 'inline-block' }} />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer',
                fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '6px',
                  marginBottom: '10px',
                }}>
                  {!isUser && (
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      backgroundColor: '#EEF2FF', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0,
                    }}>🤖</div>
                  )}
                  <div style={{
                    padding: '9px 13px',
                    backgroundColor: isUser ? '#4F46E5' : '#F3F4F6',
                    color: isUser ? '#fff' : '#1F2937',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    maxWidth: '78%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '10px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  backgroundColor: '#EEF2FF', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                }}>🤖</div>
                <div style={{
                  padding: '9px 14px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                      width: '6px', height: '6px',
                      backgroundColor: '#9CA3AF',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: `chatbotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: '8px',
            padding: '10px 12px',
            borderTop: '1px solid #F3F4F6',
            flexShrink: 0,
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Press Enter to send)"
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                padding: '9px 13px',
                borderRadius: '18px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                maxHeight: '80px',
                overflowY: 'auto',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: loading || !input.trim()
                  ? '#E5E7EB'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: loading || !input.trim() ? '#9CA3AF' : '#fff',
                border: 'none',
                fontSize: '15px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >➤</button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Chat with Karisma Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontSize: '22px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Keyframes untuk bounce animation */}
      <style>{`
        @keyframes chatbotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
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

          <CVDetailHeader cv={cv} />
          <CVSkillsCloud skills={cv.analysis?.skills} />

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

          {hasMatches && allSkillGaps.length > 0 && (
            <div className="mt-8 animate-fade-up">
              <LearningRoadmap skillGaps={allSkillGaps} />
            </div>
          )}

        </div>
      </main>
      <Footer />

      {/* Chatbot — fixed kanan bawah, tidak ganggu layout */}
      <ChatbotPopup />
    </div>
  );
}