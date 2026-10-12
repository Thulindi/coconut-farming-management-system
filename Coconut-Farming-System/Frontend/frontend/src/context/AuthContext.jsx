import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem('token');
      const username = sessionStorage.getItem('username');
      const roles = sessionStorage.getItem('roles');
      const userId = sessionStorage.getItem('userId');

      if (token && username && roles) {
        try {
          // Verify session with backend
          await authAPI.getProfile(username);
          setUser({
            id: userId,
            username,
            roles: JSON.parse(roles),
            token,
          });
        } catch (error) {
          console.error('Session validation failed:', error);
          // Only logout if it's a 401/403 or if backend was restarted (user missing)
          if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
            sessionStorage.clear();
            setUser(null);
          }
        }
      } else {
        sessionStorage.clear(); // Ensure partial data is cleaned
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, roles, id, username } = response.data;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('roles', JSON.stringify(roles));
    sessionStorage.setItem('userId', id);

    setUser({
      id,
      username,
      roles,
      token,
    });

    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const loginWithGoogle = async (googleData) => {
    const response = await authAPI.googleLogin(googleData);
    const { token, roles, id, username } = response.data;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('roles', JSON.stringify(roles));
    sessionStorage.setItem('userId', id);

    setUser({
      id,
      username,
      roles,
      token,
    });

    return response.data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('userId');
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const getPrimaryRole = () => {
    if (!user?.roles) return null;
    if (user.roles.includes('ADMIN')) return 'ADMIN';
    if (user.roles.includes('OFFICER')) return 'OFFICER';
    if (user.roles.includes('FARMER')) return 'FARMER';
    return user.roles[0];
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
    getPrimaryRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
