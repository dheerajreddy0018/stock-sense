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
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          badgeVariant: 'success' as const,
          stroke: '#22c55e',
        };
      case 'GOOD':
        return {
          text: 'text-teal-400',
          bg: 'bg-teal-500/10',
          border: 'border-teal-500/30',
          badgeVariant: 'info' as const,
          stroke: '#14b8a6',
        };
      case 'WARNING':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badgeVariant: 'warning' as const,
          stroke: '#f59e0b',
        };
      case 'CRITICAL':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          badgeVariant: 'danger' as const,
          stroke: '#f43f5e',
        };
    }
  };

  const colors = getStatusColor(health.status);
  const strokeDashoffset = 283 - (283 * health.score) / 100;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Inventory Health Index
          </h3>
        </div>
        <Badge variant={colors.badgeVariant} dot>
          {health.status}
        </Badge>
      </div>

      <div className="py-4 flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="8"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold font-mono text-white tracking-tighter">
              {health.score}
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              / 100 PTS
            </span>
          </div>
        </div>

        {/* Health Breakdown Stats */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Healthy SKUs
            </span>
            <span className="font-mono font-semibold text-white">
              {health.healthyStockCount} / {health.totalSKUs}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Low Stock Risk
            </span>
            <span className="font-mono font-semibold text-amber-400">
              {health.lowStockCount} SKUs
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Stockout Depleted
            </span>
            <span className="font-mono font-semibold text-rose-400">
              {health.outOfStockCount} SKUs
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              Turnover Velocity
            </span>
            <span className="font-mono font-semibold text-cyan-400">
              {health.turnoverRatio}x annual
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation */}
      <div className="mt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-start gap-2 text-slate-300">
        <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <span className="text-[11px] leading-relaxed">
          {health.recommendations[0] || 'All operational metrics within standard tolerances.'}
        </span>
      </div>
    </div>
  );
};
