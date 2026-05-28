import { useState } from "react";

// Palet selaras dengan Home.jsx
// Primary: #5B4FE8, Primary light: #F0EFFE, Border: #E4E1FD
// Dark: #0F1226, Subtle text: #5A5F7D, #9EA3BC
const T = {
  accent:      "#5B4FE8",   // primary — sama dengan Home
  accentLight: "#818CF8",   // primary soft
  bg:          "#F0EFFE",   // primary-light — sama dengan Home bg-primary-light
  border:      "#E4E1FD",   // primary border subtle
  text:        "#3B35B8",   // primary dark text
  dark:        "#0F1226",
};

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
    <div className="flex flex-col gap-5 animate-fade-up">

      {/* ── Header Card ── */}
      <div className="card-base p-5 md:p-6">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-4">
            {/* Icon: senada Home — bg-primary-light text-primary */}
            <div className="w-12 h-12 bg-[#F0EFFE] text-[#5B4FE8] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-[#0F1226] text-base">Personalized Learning Roadmap</p>
              <p className="text-xs text-[#9EA3BC] mt-1">A 4-week plan built around your skill gaps</p>
            </div>
          </div>
          {/* Badge — senada Home */}
          <div className="bg-[#F8F9FE] border border-[#E8EAF2] px-4 py-2 rounded-xl flex items-center flex-shrink-0">
            <span className="text-sm font-bold text-[#5B4FE8]">{gaps.length}</span>
            <span className="text-xs font-semibold text-[#5A5F7D] ml-1.5 uppercase tracking-wider">Gaps</span>
          </div>
        </div>

        {/* Skill tags — senada Home hover style */}
        <div className="flex flex-wrap gap-2.5">
          {gaps.map((skill, i) => (
            <span
              key={i}
              className="px-3.5 py-1.5 bg-[#F8F9FE] border border-[#E8EAF2] text-[#0F1226] text-sm font-medium rounded-lg hover:border-[#E4E1FD] hover:bg-[#F0EFFE] hover:text-[#5B4FE8] transition-colors duration-200 cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── Generate Button — btn-primary dari Home ── */}
      {!roadmap && (
        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="font-display w-full py-3.5 text-[15px] font-bold flex items-center justify-center gap-2 rounded-xl text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-[#5B4FE8] hover:bg-[#4a3fd1]"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating your learning roadmap...
            </>
          ) : (
            'Create My Learning Roadmap'
          )}
        </button>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#F0EFFE] border border-[#E4E1FD]">
          <span className="text-sm flex items-center gap-2 text-[#3B35B8]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </span>
          <button
            onClick={generateRoadmap}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors bg-transparent text-[#3B35B8] border border-[#E4E1FD] hover:bg-[#E4E1FD] whitespace-nowrap"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Roadmap Result ── */}
      {roadmap && (
        <div className="flex flex-col gap-4">

          {/* Summary */}
          <div className="card-base p-5 border-l-[3px] border-l-[#5B4FE8]">
            <p className="text-sm text-[#5A5F7D] leading-relaxed">{roadmap.summary}</p>
          </div>

          {/* Week Nav Pills */}
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
                    ? { background: '#5B4FE8', borderColor: '#5B4FE8', color: '#fff', boxShadow: '0 4px 14px rgba(91,79,232,0.25)' }
                    : { background: '#F0EFFE', borderColor: '#E4E1FD', color: '#3B35B8' }
                  }
                >
                  <span className="text-lg font-extrabold leading-none tracking-tight">{meta.num}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Week */}
          {roadmap.weeks?.map((week, i) => {
            if (i !== expandedWeek) return null;
            const meta = WEEK_META[i % 4];
            return (
              <div key={i} className="card-base overflow-hidden">

                {/* Week Header — gradient senada Home hero gradient */}
                <div className="flex items-center gap-3 px-6 py-4 bg-[#5B4FE8]">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-extrabold text-white tracking-tight">{meta.num}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Week {week.week}</p>
                    <h3 className="font-display text-[15px] font-bold text-white leading-none">{week.theme}</h3>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
                      {meta.label}
                    </span>
                  </div>
                </div>

                {/* Week Body */}
                <div className="p-6 flex flex-col gap-6">

                  {/* Goals */}
                  <div>
                    <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-3">This Week's Goals</p>
                    <ul className="flex flex-col gap-2.5">
                      {week.goals?.map((goal, gi) => (
                        <li key={gi} className="flex items-start gap-2.5 text-sm text-[#3A3F5C] leading-relaxed">
                          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4FE8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px bg-[#E8EAF2]" />

                  {/* Tasks */}
                  <div>
                    <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-3">Daily Schedule</p>
                    <div className="flex flex-col gap-3">
                      {week.tasks?.map((task, ti) => (
                        <div key={ti} className="rounded-xl p-4 bg-[#F0EFFE] border border-[#E4E1FD]">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white"
                              style={{ background: '#5B4FE8' }}
                            >
                              {task.day}
                            </span>
                            <span className="text-[11px] font-semibold text-[#3B35B8]">
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
              <p className="text-[11px] font-bold text-[#9EA3BC] uppercase tracking-widest mb-4">Learning Success Tips</p>
              <ul className="flex flex-col gap-3">
                {roadmap.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#5A5F7D] leading-relaxed">
                    <span
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 text-white"
                      style={{ background: '#5B4FE8' }}
                    >
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Insight Box — senada About section Home */}
          <div className="rounded-xl p-4 md:p-5 flex gap-4 items-start bg-[#F0EFFE] border border-[#E4E1FD]">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[#5B4FE8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <p className="text-sm text-[#5A5F7D] leading-relaxed pt-1.5">
              <span className="font-semibold text-[#0F1226]">Tip: </span>
              Consistency beats intensity. 45 minutes every day is more effective than a long marathon once a week.
            </p>
          </div>

          {/* Regenerate */}
          <div className="flex justify-center pb-2">
            <button
              onClick={() => setRoadmap(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-transparent transition-all duration-150 cursor-pointer text-[#3B35B8] border border-[#E4E1FD] hover:bg-[#F0EFFE]"
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
