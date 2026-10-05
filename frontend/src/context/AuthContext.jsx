/**
 * AuthContext.jsx — User Authentication State Management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tradeflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('tradeflow_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup'

  // Save to localStorage when user or token updates
  useEffect(() => {
    if (user) {
      localStorage.setItem('tradeflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tradeflow_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('tradeflow_token', token);
    } else {
      localStorage.removeItem('tradeflow_token');
    }
  }, [token]);

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signin = async ({ identifier, password }) => {
    try {
      const res = await axios.post(`${API_URL}/auth/signin`, {
        identifier,
        password
      });

      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        toast.success(res.data.message || `Welcome back, ${res.data.user.name}!`);
        closeAuthModal();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sign in failed';
      toast.error(msg);
      throw err;
    }
  };

  const signup = async ({ name, username, email, password }) => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        name,
        username,
        email,
        password
      });

      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        toast.success(res.data.message || 'Account created successfully!');
        closeAuthModal();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sign up failed';
      toast.error(msg);
      throw err;
    }
  };

  const signout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tradeflow_user');
    localStorage.removeItem('tradeflow_token');
    toast('Logged out of TradeFlow', { icon: '👋' });
  };

  const loginAsDemo = async (demoName = 'Rahul Sharma (Demo Trader)', demoUser = 'trader_user') => {
    const demo = {
      userId: 'USR_DEMO_DEFAULT',
      name: demoName,
      username: demoUser,
      email: `${demoUser}@tradeflow.com`,
      virtualBalance: 1000000,
      role: 'TRADER'
    };
    setUser(demo);
    setToken('demo_token_valid');
    toast.success(`Logged in as ${demo.name}`);
    closeAuthModal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        signin,
        signup,
        signout,
        loginAsDemo
      }}
    >
      {children}
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

export default AuthContext;
