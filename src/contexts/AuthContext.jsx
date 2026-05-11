import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const MOCK_USERS = [
  { id: '1', full_name: 'Kiel Yehezkiel', email: 'kiel@mail.com', password: 'password123', avatar_url: null }
];

function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem('karisma_user');
      if (s) setUser(JSON.parse(s));
    } catch(_) {}
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email atau password salah.');
    const { password: _, ...safe } = found;
    setUser(safe);
    localStorage.setItem('karisma_user', JSON.stringify(safe));
    return safe;
  };

  const register = async (full_name, email, password) => {
    await new Promise(r => setTimeout(r, 800));
    if (MOCK_USERS.find(u => u.email === email)) throw new Error('Email sudah terdaftar.');
    const newUser = { id: String(Date.now()), full_name, email, avatar_url: null };
    MOCK_USERS.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('karisma_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('karisma_user');
    localStorage.removeItem('karisma_cvs');
  };

  const updateProfile = async (data) => {
    await new Promise(r => setTimeout(r, 500));
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('karisma_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;