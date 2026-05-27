import { useState } from "react";

// Single source of truth: #5B4FE8
// bg   = #5B4FE8 at ~8% opacity  → #EEEDFE
// border = #5B4FE8 at ~20% opacity → #C9C5F7
const THEME = { accent: "#5B4FE8", bg: "#EEEDFE", border: "#C9C5F7" };

const WEEK_META = [
  { num: "01", label: "Foundation" },
  { num: "02", label: "Deepening"  },
  { num: "03", label: "Practice"   },
  { num: "04", label: "Mastery"    },
];

export default function LearningRoadmap({ skillGaps }) {
  const [roadmap, setRoadmap]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(0);

  const gaps = Array.isArray(skillGaps)
    ? skillGaps
    : typeof skillGaps === "string"
    ? skillGaps.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const generateRoadmap = async () => {
    if (gaps.length === 0) return;
    setLoading(true);
    setError(null);
    setRoadmap(null);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("karisma_token");
      const res = await fetch(`${BASE_URL}/roadmap/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ skillGaps: gaps }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to generate roadmap");
      setRoadmap(data.roadmap);
      setExpandedWeek(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (gaps.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col gap-5 animate-fade-up">

      {/* ── Header Card ── */}
      <div className="card-base p-6 md:p-8 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
          style={{ background: "#5B4FE8" }}
        />
        <div className="flex items-start gap-4 pt-1">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-[17px] text-[#0F1226] mb-1">
              Personalized Learning Roadmap
            </h2>
            <p className="text-sm text-[#5A5F7D] leading-relaxed">
              A 4-week personalized learning roadmap designed specifically based on your skill gaps
            </p>
          </div>
        </div>
      </div>

      {/* ── Skill Gap Tags ── */}
      <div>
        <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-3">
          Skills to Master
        </p>
        <div className="flex flex-wrap gap-2">
          {gaps.map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: THEME.bg, color: "#5B4FE8", border: `1px solid ${THEME.border}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#5B4FE8" }} />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── Generate Button ── */}
      {!roadmap && (
        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="btn-primary font-display w-full py-3.5 text-[15px] font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#5B4FE8" }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating your learning roadmap...
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Create My Learning Roadmap
            </>
          )}
        </button>
      )}

      {/* ── Error State ── */}
      {error && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
          style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}
        >
          <span className="text-sm flex items-center gap-2" style={{ color: "#5B4FE8" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </span>
          <button
            onClick={generateRoadmap}
            className="text-xs font-semibold bg-transparent rounded-lg px-3 py-1.5 cursor-pointer transition-colors whitespace-nowrap"
            style={{ color: "#5B4FE8", border: `1px solid ${THEME.border}` }}
            onMouseEnter={e => e.currentTarget.style.background = THEME.border}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Roadmap Result ── */}
      {roadmap && (
        <div className="flex flex-col gap-4">

          {/* Summary */}
          <div className="card-base p-5 border-l-[3px]" style={{ borderLeftColor: "#5B4FE8" }}>
            <p className="text-sm text-[#5A5F7D] leading-relaxed">{roadmap.summary}</p>
          </div>

          {/* Week Navigation Pills */}
          <div className="grid grid-cols-4 gap-2">
            {roadmap.weeks?.map((week, i) => {
              const meta = WEEK_META[i % 4];
              const isActive = expandedWeek === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedWeek(i)}
                  className="font-display flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all duration-200 cursor-pointer"
                  style={isActive
                    ? { background: "#5B4FE8", borderColor: "#5B4FE8", color: "#fff", boxShadow: "0 4px 14px rgba(91,79,232,0.30)" }
                    : { background: THEME.bg, borderColor: THEME.border, color: "#5B4FE8" }
                  }
                >
                  <span className="text-lg font-extrabold leading-none tracking-tight">{meta.num}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Week Detail */}
          {roadmap.weeks?.map((week, i) => {
            if (i !== expandedWeek) return null;
            const meta = WEEK_META[i % 4];
            return (
              <div key={i} className="card-base overflow-hidden">

                {/* Week Header */}
                <div className="flex items-center gap-3 px-6 py-4" style={{ background: "#5B4FE8" }}>
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-extrabold text-white tracking-tight">{meta.num}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">
                      Week {week.week}
                    </p>
                    <h3 className="font-display text-[15px] font-bold text-white leading-none">{week.theme}</h3>
                  </div>
                  <div className="ml-auto">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>

                {/* Week Body */}
                <div className="p-6 flex flex-col gap-6">

                  {/* Goals */}
                  <div>
                    <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-3">
                      This Week's Goals
                    </p>
                    <ul className="flex flex-col gap-2.5">
                      {week.goals?.map((goal, gi) => (
                        <li key={gi} className="flex items-start gap-2.5 text-sm text-[#3A3F5C] leading-relaxed">
                          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="#5B4FE8">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px" style={{ background: THEME.border }} />

                  {/* Tasks */}
                  <div>
                    <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-3">
                      Daily Schedule
                    </p>
                    <div className="flex flex-col gap-3">
                      {week.tasks?.map((task, ti) => (
                        <div
                          key={ti}
                          className="rounded-xl p-4"
                          style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white"
                              style={{ background: "#5B4FE8" }}
                            >
                              {task.day}
                            </span>
                            <span className="text-[11px] font-semibold" style={{ color: "#5B4FE8" }}>
                              {task.skill}
                            </span>
                          </div>
                          <p className="text-sm text-[#0F1226] mb-1.5 leading-relaxed">{task.activity}</p>
                          {task.resources && (
                            <p className="text-[11px] text-[#9EA3BC] flex items-center gap-1.5">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                              </svg>
                              {task.resources}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tips */}
          {roadmap.tips?.length > 0 && (
            <div className="card-base p-6">
              <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-4">
                Learning Success Tips
              </p>
              <ul className="flex flex-col gap-3">
                {roadmap.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#5A5F7D] leading-relaxed">
                    <span
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 text-white"
                      style={{ background: "#5B4FE8" }}
                    >
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Insight Box */}
          <div
            className="rounded-xl p-4 md:p-5 flex gap-4 items-start"
            style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}
          >
            <div
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0"
              style={{ color: "#5B4FE8" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <p className="text-sm text-[#5A5F7D] leading-relaxed pt-1.5">
              <span className="font-semibold text-[#0F1226]">Tip: </span>
              Consistency is more important than intensity. Studying for 45 minutes every day is more effective than doing a long study marathon once a week.
            </p>
          </div>

          {/* Regenerate */}
          <div className="flex justify-center pb-2">
            <button
              onClick={() => setRoadmap(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-transparent transition-all duration-150 cursor-pointer"
              style={{ color: "#5B4FE8", border: `1px solid ${THEME.border}` }}
              onMouseEnter={e => { e.currentTarget.style.background = THEME.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Create new roadmap
            </button>
          </div>

        </div>
      )}
    </div>
  );
}