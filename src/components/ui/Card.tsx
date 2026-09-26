import React from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'enterprise-card p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5 pb-3 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={cn('p-5 pt-0', className)} {...props} />;

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'enterprise-card p-4 sm:p-5 relative transition-all duration-150',
        onClick && 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.995]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <div className="mt-1.5 text-2xl font-semibold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px]">
          <span
            className={cn(
              'font-mono font-medium',
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
