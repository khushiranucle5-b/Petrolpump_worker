/**
 * Persistent Authentication Context
 * Manages active session, worker user object, approval status, and token lifecycle.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenStorage } from '../services/auth/tokenStorage';
import { AuthService } from '../services/auth/authService';
import {
  WorkerUser,
  LoginCredentials,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/auth';

interface AuthContextType {
  user: WorkerUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPendingApproval: boolean;
  login: (credentials: LoginCredentials) => Promise<WorkerUser>;
  register: (payload: RegisterPayload) => Promise<WorkerUser>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<WorkerUser>;
  refreshProfile: () => Promise<WorkerUser | null>;
  changePassword: (payload: ChangePasswordPayload) => Promise<{ message: string }>;
  setUserDirectly: (user: WorkerUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<WorkerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore persistent session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await TokenStorage.getToken();
        const savedUser = await TokenStorage.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<WorkerUser> => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<WorkerUser> => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(payload);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<WorkerUser> => {
    const updated = await AuthService.updateProfile(payload);
    setUser(updated);
    return updated;
  };

  const refreshProfile = async (): Promise<WorkerUser | null> => {
    try {
      const fresh = await AuthService.getProfile();
      setUser(fresh);
      return fresh;
    } catch {
      return user;
    }
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    return AuthService.changePassword(payload);
  };

  const setUserDirectly = (newUser: WorkerUser | null) => {
    setUser(newUser);
    if (newUser) {
      TokenStorage.setUser(newUser);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isPendingApproval = user?.accountStatus === 'pending_approval';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isPendingApproval,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        changePassword,
        setUserDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
