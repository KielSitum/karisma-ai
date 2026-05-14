import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

const CVContext = createContext();

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
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const { cv } = await api.upload('/cv/upload', formData);
      await fetchCVs();
      return cv;
    } finally {
      setAnalyzing(false);
    }
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
