import React from 'react';
import { SignupForm } from '../features/auth/SignupForm';

interface SignupPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSuccess, onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-0">
        <SignupForm onSuccess={onSuccess} onNavigateToLogin={onNavigateToLogin} />
      </div>
    </div>
  );
};
