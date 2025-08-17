// client/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set the auth header for all subsequent api requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      api.get('/api/auth/profile')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          // If token is invalid, clear storage and state
          localStorage.clear();
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userId', userData._id);
    if (userData.doctorId) localStorage.setItem('doctorId', userData.doctorId);
    if (userData.patientId) localStorage.setItem('patientId', userData.patientId);
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = { user, isAuthenticated: !!user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};