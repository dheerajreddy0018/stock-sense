import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToForgot?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToSignup,
  onNavigateToForgot,
}) => {
  const { login, quickLogin, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await quickLogin(role);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-glow-primary mb-3">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">StockSense</h1>
        <p className="text-xs uppercase tracking-widest font-mono text-emerald-400 mt-1">
          Odoo × GCET Hackathon 2026
        </p>
        <p className="text-slate-400 text-sm mt-2">Sign in to access your inventory control center</p>
      </div>

      {/* Main Glass Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        {/* Hackathon Quick Role Switchers */}
        <div className="mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Instant Hackathon Demo Login
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all text-center flex flex-col items-center gap-1"
            >
              <span className="text-emerald-400 font-bold">Admin</span>
              <span className="text-[10px] text-slate-400">Full Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('INVENTORY_MANAGER')}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-600/20 hover:border-cyan-500/50 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all text-center flex flex-col items-center gap-1"
            >
              <span className="text-cyan-400 font-bold">Manager</span>
              <span className="text-[10px] text-slate-400">Stock & Moves</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('WAREHOUSE_STAFF')}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-600/20 hover:border-amber-500/50 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all text-center flex flex-col items-center gap-1"
            >
              <span className="text-amber-400 font-bold">Staff</span>
              <span className="text-[10px] text-slate-400">Floor Ops</span>
            </button>
          </div>
        </div>

        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stocksense.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              {onNavigateToForgot && (
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition-all shadow-glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {onNavigateToSignup && (
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an operator account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="text-emerald-400 hover:text-emerald-300 font-medium underline-offset-4 hover:underline"
            >
              Register team member
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
