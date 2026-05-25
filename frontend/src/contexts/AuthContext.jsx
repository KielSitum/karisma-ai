  import { createContext, useContext, useState, useEffect } from 'react';
  import { api } from '../utils/api';
  import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
  import { auth } from '../lib/firebase';

  export const AuthContext = createContext();

  function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session dari token yang tersimpan
    useEffect(() => {
      const token = localStorage.getItem('karisma_token');
      if (!token) { setLoading(false); return; }
      api.get('/auth/me')
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('karisma_token'))
        .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
      const { token, user } = await api.post('/auth/login', { email, password });
      localStorage.setItem('karisma_token', token);
      setUser(user);
      return user;
    };

    const register = async (full_name, email, password) => {
      const { token, user } = await api.post('/auth/register', { full_name, email, password });
      localStorage.setItem('karisma_token', token);
      setUser(user);
      return user;
    };

    const loginWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      // Minta user pilih akun setiap kali
      provider.setCustomParameters({ prompt: 'select_account' });

      // Popup Google sign-in
      const result = await signInWithPopup(auth, provider);

      // Ambil Firebase ID token
      const firebaseToken = await result.user.getIdToken();

      try {
        // Kirim ke backend untuk diverifikasi & dapat JWT app
        const { token, user } = await api.post('/auth/google', { token: firebaseToken });
        localStorage.setItem('karisma_token', token);
        setUser(user);
        return user;
      } catch (err) {
        // Jika belum terdaftar, lempar error khusus dengan info Google
        if (err.message?.includes('belum terdaftar')) {
          const googleUser = result.user;
          const notRegisteredError = new Error('USER_NOT_REGISTERED');
          notRegisteredError.code = 'USER_NOT_REGISTERED';
          notRegisteredError.googleName = googleUser.displayName;
          notRegisteredError.googleEmail = googleUser.email;
          throw notRegisteredError;
        }
        throw err;
      }
    };

    const logout = () => {
      setUser(null);
      localStorage.removeItem('karisma_token');
    };

    const updateProfile = async (data) => {
      const { user: updated } = await api.patch('/auth/profile', data);
      setUser(updated);
      return updated;
    };

    const changePassword = async (current_password, new_password) => {
      await api.patch('/auth/password', { current_password, new_password });
    };

    const deleteAccount = async () => {
      await api.delete('/auth/account');
      setUser(null);
      localStorage.removeItem('karisma_token');
    };

    return (
      <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateProfile, changePassword, deleteAccount }}>
        {!loading && children}
      </AuthContext.Provider>
    );
  }

  export const useAuth = () => useContext(AuthContext);
  export default AuthProvider;
