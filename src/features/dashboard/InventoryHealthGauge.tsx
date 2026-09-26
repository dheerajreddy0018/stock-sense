import React from 'react';
import { InventoryHealthScore } from '../../types';
import { ShieldCheck, AlertCircle, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface InventoryHealthGaugeProps {
  health: InventoryHealthScore;
}

export const InventoryHealthGauge: React.FC<InventoryHealthGaugeProps> = ({ health }) => {
  const getStatusColor = (status: InventoryHealthScore['status']) => {
    switch (status) {
      case 'EXCELLENT':
        return {
          badgeVariant: 'success' as const,
          stroke: '#10b981',
        };
      case 'GOOD':
        return {
          badgeVariant: 'info' as const,
          stroke: '#0ea5e9',
        };
      case 'WARNING':
        return {
          badgeVariant: 'warning' as const,
          stroke: '#f59e0b',
        };
      case 'CRITICAL':
        return {
          badgeVariant: 'danger' as const,
          stroke: '#f43f5e',
        };
    }
  };

  const colors = getStatusColor(health.status);
  const strokeDashoffset = 283 - (283 * health.score) / 100;

  return (
    <div className="enterprise-card p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Inventory Health Score
          </h3>
        </div>
        <Badge variant={colors.badgeVariant} dot>
          {health.status}
        </Badge>
      </div>

      <div className="py-4 flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Gauge */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={colors.stroke}
              strokeWidth="7"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {health.score}
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              / 100
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Healthy SKUs
            </span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
              {health.healthyStockCount} / {health.totalSKUs}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Low Stock
            </span>
            <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
              {health.lowStockCount} items
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Stockout Depleted
            </span>
            <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
              {health.outOfStockCount} items
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-500" />
              Turnover Velocity
            </span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {health.turnoverRatio}x
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Note */}
      <div className="mt-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs flex items-start gap-2 text-slate-600 dark:text-slate-300">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <span className="text-[11px] leading-relaxed">
          {health.recommendations[0] || 'All operational inventory parameters are within standard thresholds.'}
        </span>
      </div>
    </div>
  );
};
