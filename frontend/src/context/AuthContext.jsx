import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token verification failed:", error);
          // If token is invalid/expired, clean up
          setToken(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setCurrentUser(data);
    setIsAuthenticated(true);
    localStorage.setItem('token', data.token);
    return data;
  };

  const signup = async (userData) => {
    const data = await authService.signup(userData);
    setToken(data.token);
    setCurrentUser(data);
    setIsAuthenticated(true);
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error (server):", error);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  // Merge partial user updates into current state (e.g. after avatar upload)
  const updateCurrentUser = (partialUser) => {
    setCurrentUser(prev => ({ ...prev, ...partialUser }));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      updateCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
