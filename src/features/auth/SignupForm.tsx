import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../../types';
import { UserPlus, Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onNavigateToLogin }) => {
  const { signup, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('WAREHOUSE_STAFF');
  const [department, setDepartment] = useState('Logistics & Fulfillment');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!displayName || !email || !password) {
      setLocalError('Please complete all required fields.');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, displayName, role, department);
      onSuccess?.();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-glow-accent mb-3">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Staff Account</h1>
        <p className="text-slate-400 text-sm mt-1">Register new member on StockSense</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Vikramaditya Rao"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="v.rao@stocksense.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-cyan-500 text-sm text-white outline-none"
              >
                <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
                <option value="INVENTORY_MANAGER">Inventory Manager</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-cyan-500 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-medium text-sm transition-all shadow-glow-accent flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {onNavigateToLogin && (
          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline-offset-4 hover:underline"
            >
              Sign in to session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
