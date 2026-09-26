import React, { useState } from 'react';
import { StockPulseItem, StockPulseStage } from '../../types';
import {
  Truck,
  ArrowDownToLine,
  Building2,
  ArrowLeftRight,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../../components/ui/Badge';

interface StockPulseTrackerProps {
  items: StockPulseItem[];
}

export const StockPulseTracker: React.FC<StockPulseTrackerProps> = ({ items }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];

  const stages: { stage: StockPulseStage; label: string; icon: React.ElementType }[] = [
    { stage: 'SUPPLIER', label: 'Supplier', icon: Truck },
    { stage: 'RECEIPT', label: 'Receipt', icon: ArrowDownToLine },
    { stage: 'WAREHOUSE', label: 'Warehouse', icon: Building2 },
    { stage: 'TRANSFER', label: 'Transfer', icon: ArrowLeftRight },
    { stage: 'LOCATION', label: 'Location', icon: MapPin },
    { stage: 'DELIVERY', label: 'Delivery', icon: Send },
  ];

  const stageOrder: StockPulseStage[] = [
    'SUPPLIER',
    'RECEIPT',
    'WAREHOUSE',
    'TRANSFER',
    'LOCATION',
    'DELIVERY',
  ];

  const currentStageIndex = stageOrder.indexOf(activeItem?.currentStage || 'LOCATION');

  return (
    <div className="enterprise-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Stock Pulse Traceability
              </h3>
              <Badge variant="success" size="sm" dot>
                Live Flow
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audited route: Supplier → Inward Dock → Staged Warehouse → Inter-hub Transfer → Bin Allocation → Customer Delivery
            </p>
          </div>
        </div>

        {/* Consignment Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Tracking:</span>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
          >
            {items.map((it) => (
              <option key={it.id} value={it.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                {it.sku} ({it.quantity} units) • {it.receiptNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeItem && (
        <div className="mt-4 space-y-5">
          {/* Active Consignment Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Product & Consignment
              </span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{activeItem.productName}</h4>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">{activeItem.sku}</span>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Consignment Batch</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{activeItem.quantity} Units</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Current Station</span>
                <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold uppercase">
                  {activeItem.currentStage}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Consignee</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                  {activeItem.customerName || 'In Hub Storage'}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="relative pt-2 pb-2 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[580px] relative px-4">
              {/* Connecting Line */}
              <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
              <div
                className="absolute top-4 left-8 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                style={{
                  width: `${(currentStageIndex / (stageOrder.length - 1)) * 88}%`,
                }}
              />

              {stages.map((st, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const Icon = st.icon;

                return (
                  <div key={st.stage} className="flex flex-col items-center relative z-10">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 text-xs',
                        isCurrent
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                          : isPassed
                          ? 'border-emerald-500/60 bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400'
                      )}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Icon className="w-4 h-4" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </div>

                    <span
                      className={cn(
                        'mt-1.5 text-xs tracking-tight',
                        isCurrent
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : isPassed
                          ? 'text-slate-800 dark:text-slate-200 font-medium'
                          : 'text-slate-400 dark:text-slate-400'
                      )}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeItem.steps.map((step, idx) => {
              const isPast = idx < currentStageIndex;
              const isNow = idx === currentStageIndex;

              return (
                <div
                  key={step.stage}
                  className={cn(
                    'p-3 rounded-lg border text-xs transition-colors',
                    isNow
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                      : isPast
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                      : 'bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/40 opacity-60'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium">
                      Stage {idx + 1}: {step.stage}
                    </span>
                    {step.status === 'COMPLETED' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono text-[10px] font-medium">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : step.status === 'IN_PROGRESS' ? (
                      <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-mono text-[10px] font-medium">
                        <Clock size={11} className="animate-spin" /> In Progress
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">Queued</span>
                    )}
                  </div>

                  <h5 className="font-medium text-slate-900 dark:text-slate-100">{step.title}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{step.subtitle}</p>

                  {step.details && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-0.5 font-mono text-[10px]">
                      {Object.entries(step.details).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>{k}:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
