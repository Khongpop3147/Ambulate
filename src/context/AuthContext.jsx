import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sara_user');
    const token = localStorage.getItem('sara_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('sara_user', JSON.stringify(userData));
    localStorage.setItem('sara_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sara_user');
    localStorage.removeItem('sara_token');
    setUser(null);
  };

  if (loading) {
    return <div className="app-container flex-center">กำลังโหลด...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
