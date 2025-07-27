import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  isPremium: boolean;
  scansRemaining: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'OPEN_AUTH_MODAL'; payload?: 'login' | 'register' }
  | { type: 'CLOSE_AUTH_MODAL' }
  | { type: 'SET_AUTH_MODE'; payload: 'login' | 'register' }
  | { type: 'UPDATE_SCANS'; payload: number };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthModalOpen: false,
  authMode: 'login'
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthModalOpen: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false
      };
    case 'OPEN_AUTH_MODAL':
      return {
        ...state,
        isAuthModalOpen: true,
        authMode: action.payload || 'login'
      };
    case 'CLOSE_AUTH_MODAL':
      return { ...state, isAuthModalOpen: false };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.payload };
    case 'UPDATE_SCANS':
      return {
        ...state,
        user: state.user ? { ...state.user, scansRemaining: action.payload } : null
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  updateScansRemaining: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token validity by making a request
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            dispatch({ type: 'SET_USER', payload: { user: userData.user, token } });
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.login(email, password);
      dispatch({ type: 'SET_USER', payload: response });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.register(email, password);
      dispatch({ type: 'SET_USER', payload: response });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    dispatch({ type: 'OPEN_AUTH_MODAL', payload: mode });
  };

  const closeAuthModal = () => {
    dispatch({ type: 'CLOSE_AUTH_MODAL' });
  };

  const setAuthMode = (mode: 'login' | 'register') => {
    dispatch({ type: 'SET_AUTH_MODE', payload: mode });
  };

  const updateScansRemaining = (count: number) => {
    dispatch({ type: 'UPDATE_SCANS', payload: count });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal,
    setAuthMode,
    updateScansRemaining
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};