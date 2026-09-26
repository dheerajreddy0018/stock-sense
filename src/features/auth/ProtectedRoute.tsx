import React from 'react';
import { useAuth } from './AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-emerald-500/10 blur-sm" />
        </div>
        <p className="mt-4 text-xs font-mono tracking-wider text-slate-400 uppercase">
          Verifying StockSense Session...
        </p>
      </div>
    );
  }

  if (!user) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center border border-rose-500/30">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-400">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-slate-400 text-sm mb-6">
            Please log in with your StockSense credentials or select a hackathon demo role to access the inventory system.
          </p>
          <a
            href="#login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-glow-primary"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
