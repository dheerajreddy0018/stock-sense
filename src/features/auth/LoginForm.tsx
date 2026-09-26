import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../../types';
import { Boxes, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

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
    <div className="w-full max-w-sm mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm mb-3">
          <Boxes className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">StockSense</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Intelligent Inventory & Stock Operations
        </p>
      </div>

      {/* Main Card */}
      <div className="enterprise-card p-6 sm:p-7 shadow-md">
        {/* Preset Role Switchers */}
        <div className="mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Demo Access
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Ready</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition flex flex-col items-center"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Admin</span>
              <span className="text-[10px] text-slate-400">All rights</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('INVENTORY_MANAGER')}
              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition flex flex-col items-center"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Manager</span>
              <span className="text-[10px] text-slate-400">Inventory</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('WAREHOUSE_STAFF')}
              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition flex flex-col items-center"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Staff</span>
              <span className="text-[10px] text-slate-400">Logistics</span>
            </button>
          </div>
        </div>

        {(localError || error) && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stocksense.io"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              {onNavigateToForgot && (
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {onNavigateToSignup && (
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Need an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
