import React from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '../../types';
import { Lock } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { user, hasRole } = useAuth();

  if (!user || !hasRole(allowedRoles)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 text-center my-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3 text-amber-400">
          <Lock size={22} />
        </div>
        <h3 className="text-base font-semibold text-slate-100">Restricted Permission Level</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          This operation requires <span className="text-amber-400 font-mono font-medium">{allowedRoles.join(' or ')}</span> authorization.
          Your current active role is <span className="text-emerald-400 font-mono font-medium">{user?.role || 'Guest'}</span>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
