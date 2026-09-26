import React from 'react';
import { ForgotPasswordForm } from '../features/auth/ForgotPasswordForm';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-0">
        <ForgotPasswordForm onBackToLogin={onBackToLogin} />
      </div>
    </div>
  );
};
