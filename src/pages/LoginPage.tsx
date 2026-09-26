import React from 'react';
import { LoginForm } from '../features/auth/LoginForm';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgot: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToSignup,
  onNavigateToForgot,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background industrial lighting gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-0">
        <LoginForm
          onSuccess={onSuccess}
          onNavigateToSignup={onNavigateToSignup}
          onNavigateToForgot={onNavigateToForgot}
        />
      </div>
    </div>
  );
};
