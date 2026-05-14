import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

const CVContext = createContext();

<<<<<<< HEAD
/* Helper: generate AI recommendation from skill_gaps */
const makeRec = (gaps) => `Improve your skill in ${gaps.slice(0, -1).join(', ')}${gaps.length > 1 ? ', and ' : ''}${gaps[gaps.length - 1]} to bridge the gap for this role.`;

const DEFAULT_CVS = [
  {
    id: 'cv1', filename: 'John_Doe_Resume_v3.pdf', uploaded_at: '2026-04-28T10:00:00Z',
    analysis: {
      skills: ['React','TypeScript','Node.js','PostgreSQL','Docker','Git','CSS','HTML','REST API','Redux','Jest','Figma'],
    },
    matches: [
      { id:'m1', predicted_career:'Senior Frontend Engineer', match_percentage:92, matched_skills:['React','TypeScript','CSS','HTML','Redux','Git','Node.js','Jest'], skill_gaps:['Jest/Cypress','Web Vitals','Docker'], salary:'$5,000 - $8,000', recommendation: makeRec(['Jest/Cypress','Web Vitals','Docker']) },
      { id:'m2', predicted_career:'Product Solutions Architect', match_percentage:84, matched_skills:['Node.js','PostgreSQL','REST API','Docker'], skill_gaps:['System Design','Cloud Architecture','B2B Strategy'], salary:'$6,500 - $9,500', recommendation: makeRec(['System Design','Cloud Architecture','B2B Strategy']) },
      { id:'m3', predicted_career:'Technical Product Manager', match_percentage:76, matched_skills:['React','TypeScript','REST API','Git'], skill_gaps:['Agile Leadership','Data Analytics','Market Research'], salary:'$4,000 - $7,000', recommendation: makeRec(['Agile Leadership','Data Analytics','Market Research']) },
    ]
  },
  {
    id: 'cv2', filename: 'UX_Portfolio_Update.pdf', uploaded_at: '2026-04-15T09:00:00Z',
    analysis: {
      skills: ['Figma','Adobe XD','Sketch','HTML','CSS','User Research','Prototyping','Wireframing','Design Systems'],
    },
    matches: [
      { id:'m4', predicted_career:'UI/UX Designer', match_percentage:85, matched_skills:['Figma','Adobe XD','User Research','Prototyping'], skill_gaps:['Motion Design','React','Accessibility'], salary:'$3,500 - $6,000', recommendation: makeRec(['Motion Design','React','Accessibility']) },
      { id:'m5', predicted_career:'Product Designer', match_percentage:78, matched_skills:['Figma','Design Systems','Wireframing'], skill_gaps:['B2B Strategy','Data Analytics','SQL'], salary:'$4,000 - $7,000', recommendation: makeRec(['B2B Strategy','Data Analytics','SQL']) },
      { id:'m6', predicted_career:'Frontend Developer', match_percentage:64, matched_skills:['HTML','CSS'], skill_gaps:['JavaScript','React','TypeScript','Git'], salary:'$2,500 - $4,500', recommendation: makeRec(['JavaScript','React','TypeScript','Git']) },
    ]
  },
  {
    id: 'cv3', filename: 'Old_Resume_Backup.pdf', uploaded_at: '2026-03-22T08:00:00Z',
    analysis: {
      skills: ['Python','SQL','Excel','PowerPoint','Communication','Leadership'],
    },
    matches: [
      { id:'m7', predicted_career:'Data Analyst', match_percentage:64, matched_skills:['Python','SQL','Excel'], skill_gaps:['Tableau','Power BI','Statistical Analysis'], salary:'$2,000 - $4,000', recommendation: makeRec(['Tableau','Power BI','Statistical Analysis']) },
      { id:'m8', predicted_career:'Business Analyst', match_percentage:58, matched_skills:['SQL','Excel','Communication'], skill_gaps:['Tableau','Power BI','BPMN'], salary:'$2,500 - $4,500', recommendation: makeRec(['Tableau','Power BI','BPMN']) },
      { id:'m9', predicted_career:'Project Coordinator', match_percentage:52, matched_skills:['Communication','Leadership'], skill_gaps:['PMP','Jira','Risk Management'], salary:'$2,000 - $3,500', recommendation: makeRec(['PMP','Jira','Risk Management']) },
    ]
  }
];

=======
>>>>>>> kiel
export function CVProvider({ children }) {
  const { user } = useAuth();
  const [cvList,    setCvList]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchCVs = useCallback(async () => {
    if (!user) { setCvList([]); return; }
    setLoading(true);
    try {
      const { cvs } = await api.get('/cv');
      setCvList(cvs || []);
    } catch (err) {
      console.error('Failed to fetch CVs:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCVs(); }, [fetchCVs]);

  const uploadAndAnalyze = async (file) => {
    setAnalyzing(true);
<<<<<<< HEAD
    await new Promise(r => setTimeout(r, 3000));
    const skills = ['React','TypeScript','Node.js','PostgreSQL','Docker','Git','CSS','HTML','REST API','Redux'];
    const newCV = {
      id: 'cv_' + Date.now(), filename: file.name, uploaded_at: new Date().toISOString(),
      analysis: {
        skills,
      },
      matches: [
        { id:'nm1', predicted_career:'Senior Frontend Engineer', match_percentage:92, matched_skills:skills.slice(0,8), skill_gaps:['Jest/Cypress','Web Vitals','Docker'], salary:'$5,000 - $8,000', recommendation: makeRec(['Jest/Cypress','Web Vitals','Docker']) },
        { id:'nm2', predicted_career:'Product Solutions Architect', match_percentage:84, matched_skills:skills.slice(2,7), skill_gaps:['System Design','Cloud Architecture','B2B Strategy'], salary:'$6,500 - $9,500', recommendation: makeRec(['System Design','Cloud Architecture','B2B Strategy']) },
        { id:'nm3', predicted_career:'Technical Product Manager', match_percentage:76, matched_skills:skills.slice(0,4), skill_gaps:['Agile Leadership','Data Analytics','Market Research'], salary:'$4,000 - $7,000', recommendation: makeRec(['Agile Leadership','Data Analytics','Market Research']) },
      ]
    };
    const updated = [newCV, ...cvList];
    persist(updated);
    setAnalyzing(false);
    return newCV;
=======
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const { cv } = await api.upload('/cv/upload', formData);
      await fetchCVs();
      return cv;
    } finally {
      setAnalyzing(false);
    }
>>>>>>> kiel
  };

  const deleteCV = async (id) => {
    await api.delete(`/cv/${id}`);
    setCvList(prev => prev.filter(c => c.id !== id));
  };

  const getCV = (id) => cvList.find(c => c.id === id) || null;

  const getStats = () => {
    const allSkills  = [...new Set(cvList.flatMap(c => c.analysis?.skills || []))];
    const allMatches = cvList.flatMap(c => c.matches || []);
    const latest     = cvList[0];
    const topMatch   = allMatches.reduce(
      (b, m) => (!b || m.match_percentage > b.match_percentage) ? m : b, null
    );
    return {
      careerMatches:  allMatches.length,
      totalSkills:    allSkills.length,
      cvsUploaded:    cvList.length,
      lastUploadDate: latest ? new Date(latest.uploaded_at) : null,
      topMatch,
    };
  };

  return (
    <CVContext.Provider value={{ cvList, loading, analyzing, uploadAndAnalyze, deleteCV, getStats, getCV, fetchCVs }}>
      {children}
    </CVContext.Provider>
  );
}

export const useCV = () => useContext(CVContext);
