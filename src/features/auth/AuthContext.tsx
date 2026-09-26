import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserProfile, UserRole } from '../../types';
import { authService } from '../../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (
    email: string,
    pass: string,
    displayName: string,
    role?: UserRole,
    department?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have an existing local session, load it immediately
    const initialUser = authService.getCurrentUser();
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
    } else {
      // Auto-login default admin for seamless hackathon review if no user exists
      authService.quickDemoLogin('ADMIN').then((admin) => {
        setUser(admin);
        setLoading(false);
      });
    }

    const unsubscribe = authService.onAuthState((currUser) => {
      setUser(currUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const loggedIn = await authService.login(email, pass);
      setUser(loggedIn);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole = 'WAREHOUSE_STAFF',
    department = 'Logistics'
  ) => {
    setError(null);
    setLoading(true);
    try {
      const newUser = await authService.signup(email, pass, displayName, role, department);
      setUser(newUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    await authService.logout();
    setUser(null);
  };

  const quickLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      const demoUser = await authService.quickDemoLogin(role);
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    await authService.resetPassword(email);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  const isManager = useMemo(
    () => user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER',
    [user]
  );
  const isStaff = useMemo(() => user !== null, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        quickLogin,
        resetPassword,
        hasRole,
        isAdmin,
        isManager,
        isStaff,
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
