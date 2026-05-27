// src/components/LearningRoadmap.jsx
import { useState } from "react";

const weekColors = [
  { bg: "#EEF2FF", accent: "#4F46E5", light: "#C7D2FE" },
  { bg: "#F0FDF4", accent: "#16A34A", light: "#BBF7D0" },
  { bg: "#FFF7ED", accent: "#EA580C", light: "#FED7AA" },
  { bg: "#FDF4FF", accent: "#9333EA", light: "#E9D5FF" },
];

const skillIcons = {
  docker: "🐳",
  git: "🌿",
  sql: "🗄️",
  python: "🐍",
  javascript: "⚡",
  react: "⚛️",
  nodejs: "🟢",
  java: "☕",
  typescript: "📘",
  kubernetes: "⚙️",
  aws: "☁️",
  linux: "🐧",
  default: "📚",
};

function getSkillIcon(skill) {
  const key = skill?.toLowerCase();
  for (const [k, v] of Object.entries(skillIcons)) {
    if (key?.includes(k)) return v;
  }
  return skillIcons.default;
}

/**
 * LearningRoadmap
 * Props:
 *   skillGaps: string[] — daftar skill gap dari Career_Matches.Skill_gaps
 */
export default function LearningRoadmap({ skillGaps }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(0);

  // Normalise: terima array atau CSV string
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

      const res = await fetch(`${BASE_URL}/api/roadmap/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ skillGaps: gaps }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Gagal membuat roadmap");
      }

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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>🗺️</div>
        <div>
          <h2 style={styles.headerTitle}>Personalized Learning Roadmap</h2>
          <p style={styles.headerSubtitle}>
            AI akan buatkan jadwal belajar 4 minggu khusus untuk kamu
          </p>
        </div>
      </div>

      {/* Skill Gap Tags */}
      <div style={styles.skillSection}>
        <p style={styles.skillLabel}>Skill yang perlu dikuasai:</p>
        <div style={styles.skillTags}>
          {gaps.map((skill, i) => (
            <span key={i} style={styles.skillTag}>
              {getSkillIcon(skill)} {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {!roadmap && (
        <button
          onClick={generateRoadmap}
          disabled={loading}
          style={{
            ...styles.generateBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <span style={styles.loadingContent}>
              <span style={styles.spinner} />
              Membuat roadmap belajarmu...
            </span>
          ) : (
            "✨ Buat Roadmap Belajar Saya"
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <span>⚠️ {error}</span>
          <button onClick={generateRoadmap} style={styles.retryBtn}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* Roadmap Result */}
      {roadmap && (
        <div style={styles.roadmapContainer}>
          {/* Summary */}
          <div style={styles.summaryBox}>
            <span style={styles.summaryIcon}>💡</span>
            <p style={styles.summaryText}>{roadmap.summary}</p>
          </div>

          {/* Week Tabs */}
          <div style={styles.weekTabs}>
            {roadmap.weeks?.map((week, i) => (
              <button
                key={i}
                onClick={() => setExpandedWeek(i)}
                style={{
                  ...styles.weekTab,
                  backgroundColor:
                    expandedWeek === i ? weekColors[i % 4].accent : "#F3F4F6",
                  color: expandedWeek === i ? "#fff" : "#374151",
                }}
              >
                Minggu {week.week}
              </button>
            ))}
          </div>

          {/* Active Week Content */}
          {roadmap.weeks?.map((week, i) => {
            if (i !== expandedWeek) return null;
            const color = weekColors[i % 4];
            return (
              <div key={i} style={{ ...styles.weekCard, backgroundColor: color.bg }}>
                <div style={styles.weekHeader}>
                  <div style={{ ...styles.weekBadge, backgroundColor: color.accent }}>
                    Minggu {week.week}
                  </div>
                  <h3 style={{ ...styles.weekTheme, color: color.accent }}>
                    {week.theme}
                  </h3>
                </div>

                {/* Goals */}
                <div>
                  <p style={styles.sectionLabel}>🎯 Target Minggu Ini:</p>
                  <ul style={styles.goalsList}>
                    {week.goals?.map((goal, gi) => (
                      <li key={gi} style={styles.goalItem}>
                        <span style={{ ...styles.goalDot, backgroundColor: color.accent }} />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tasks */}
                <div>
                  <p style={styles.sectionLabel}>📅 Jadwal Harian:</p>
                  <div style={styles.tasksList}>
                    {week.tasks?.map((task, ti) => (
                      <div key={ti} style={styles.taskCard}>
                        <div style={styles.taskHeader}>
                          <span
                            style={{
                              ...styles.taskDay,
                              backgroundColor: color.light,
                              color: color.accent,
                            }}
                          >
                            {task.day}
                          </span>
                          <span style={styles.taskSkill}>
                            {getSkillIcon(task.skill)} {task.skill}
                          </span>
                        </div>
                        <p style={styles.taskActivity}>{task.activity}</p>
                        {task.resources && (
                          <p style={styles.taskResource}>📖 {task.resources}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tips */}
          {roadmap.tips?.length > 0 && (
            <div style={styles.tipsBox}>
              <p style={styles.tipsTitle}>🚀 Tips Sukses Belajar:</p>
              <ul style={styles.tipsList}>
                {roadmap.tips.map((tip, i) => (
                  <li key={i} style={styles.tipItem}>
                    <span style={styles.tipNumber}>{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Regenerate */}
          <button
            onClick={() => { setRoadmap(null); }}
            style={styles.regenerateBtn}
          >
            🔄 Buat Roadmap Baru
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    marginTop: "32px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    color: "#fff",
  },
  headerIcon: { fontSize: "40px" },
  headerTitle: { margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700" },
  headerSubtitle: { margin: 0, fontSize: "14px", opacity: 0.85 },
  skillSection: { marginBottom: "16px" },
  skillLabel: { margin: "0 0 8px 0", fontSize: "14px", color: "#6B7280", fontWeight: "600" },
  skillTags: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillTag: {
    padding: "6px 14px",
    background: "#EEF2FF",
    color: "#4F46E5",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid #C7D2FE",
  },
  generateBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "16px",
  },
  loadingContent: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },
  errorBox: {
    padding: "16px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "12px",
    color: "#DC2626",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  retryBtn: {
    padding: "6px 14px",
    background: "#DC2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    flexShrink: 0,
  },
  roadmapContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  summaryBox: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    borderRadius: "12px",
    alignItems: "flex-start",
  },
  summaryIcon: { fontSize: "22px", marginTop: "2px" },
  summaryText: { margin: 0, color: "#92400E", fontSize: "15px", lineHeight: "1.6" },
  weekTabs: { display: "flex", gap: "8px", flexWrap: "wrap" },
  weekTab: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  weekCard: {
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  weekHeader: { display: "flex", alignItems: "center", gap: "12px" },
  weekBadge: {
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  weekTheme: { margin: 0, fontSize: "18px", fontWeight: "700" },
  sectionLabel: { margin: "0 0 10px 0", fontSize: "14px", fontWeight: "700", color: "#374151" },
  goalsList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" },
  goalItem: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#374151" },
  goalDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  tasksList: { display: "flex", flexDirection: "column", gap: "10px" },
  taskCard: {
    background: "rgba(255,255,255,0.75)",
    borderRadius: "10px",
    padding: "14px",
  },
  taskHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  taskDay: { padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  taskSkill: { fontSize: "13px", fontWeight: "600", color: "#6B7280" },
  taskActivity: { margin: "0 0 6px 0", fontSize: "14px", color: "#1F2937", lineHeight: "1.5" },
  taskResource: { margin: 0, fontSize: "12px", color: "#6B7280", fontStyle: "italic" },
  tipsBox: {
    padding: "20px",
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "12px",
  },
  tipsTitle: { margin: "0 0 12px 0", fontWeight: "700", color: "#166534" },
  tipsList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" },
  tipItem: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#166534" },
  tipNumber: {
    minWidth: "22px",
    height: "22px",
    background: "#16A34A",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
  },
  regenerateBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "2px solid #D1D5DB",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#374151",
    alignSelf: "center",
  },
};
