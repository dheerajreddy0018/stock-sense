import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your account email.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not trigger password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 shadow-lg mb-3">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
        <p className="text-slate-400 text-sm mt-1">
          Receive a recovery email to regain access to StockSense
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-semibold text-white">Reset Instructions Dispatched</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an active operator account exists for <span className="text-emerald-400 font-mono">{email}</span>, a secure recovery email has been sent.
            </p>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@stocksense.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-amber-500 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Recovery Link'
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
