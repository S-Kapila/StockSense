import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/inventory';
import { StorageService } from '../services/storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, role?: User['role']) => Promise<boolean>;
  loginDemo: (role?: 'admin' | 'manager' | 'operator') => void;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    StorageService.init();
    const stored = StorageService.getAuth();
    if (stored.token && stored.user) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    // In mock backend, simulate verification
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Warehouse User',
      email,
      role: 'Warehouse Admin',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    };
    const newToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    StorageService.setAuth(newUser, newToken);
    setUser(newUser);
    setToken(newToken);
    return true;
  };

  const signup = async (name: string, email: string, _pass: string, role: User['role'] = 'Warehouse Admin'): Promise<boolean> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    const newToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    StorageService.setAuth(newUser, newToken);
    setUser(newUser);
    setToken(newToken);
    return true;
  };

  const loginDemo = (role: 'admin' | 'manager' | 'operator' = 'admin') => {
    let demoUser: User;
    if (role === 'manager') {
      demoUser = {
        id: 'usr-mgr-02',
        name: 'David Vance',
        email: 'david.vance@stocksense.io',
        role: 'Inventory Manager',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      };
    } else if (role === 'operator') {
      demoUser = {
        id: 'usr-ops-03',
        name: 'Elena Rostova',
        email: 'elena.rostova@stocksense.io',
        role: 'Logistics Operator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
    } else {
      demoUser = {
        id: 'usr-admin-01',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@stocksense.io',
        role: 'Warehouse Admin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      };
    }

    const newToken = `token_demo_${role}_${Date.now()}`;
    StorageService.setAuth(demoUser, newToken);
    setUser(demoUser);
    setToken(newToken);
  };

  const logout = () => {
    StorageService.clearAuth();
    setUser(null);
    setToken(null);
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    const updatedUser: User = { ...user, ...updated };
    setUser(updatedUser);
    if (token) {
      StorageService.setAuth(updatedUser, token);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        loginDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
