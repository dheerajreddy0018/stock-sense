import React, { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import { InventoryHealthScore } from '../../types';
import { TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { InventoryHealthGauge } from '../dashboard/InventoryHealthGauge';

export const InsightsView: React.FC = () => {
  const [health, setHealth] = useState<InventoryHealthScore | null>(null);

  useEffect(() => {
    stockService.calculateInventoryHealth().then(setHealth);
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Insights & Health
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Stockout risk telemetry, safety buffer analysis, and replenishment directives
        </p>
      </div>

      {health && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <InventoryHealthGauge health={health} />
          </div>

          <div className="lg:col-span-2 enterprise-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Operational Directives
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Algorithmic Balance</span>
            </div>

            <div className="space-y-2.5">
              {health.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Directive #{idx + 1}</span>
                    <span className="text-slate-600 dark:text-slate-300">{rec}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-4">
              <strong className="block text-slate-900 dark:text-white">Core Stock Calculation Invariant:</strong>
              <p className="text-[11px] leading-relaxed">
                Stock consistency is enforced through <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Opening + Receipts - Deliveries + Transfer In - Transfer Out ± Adjustments</code>. Transactions are processed with strict validation to prevent negative balances and duplicate mutations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
