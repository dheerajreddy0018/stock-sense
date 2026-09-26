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
  Sparkles,
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
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-emerald-500/20 shadow-glow-primary/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-glow-primary">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Stock Pulse</h3>
              <Badge variant="success" size="sm" dot>
                Signature Pipeline Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Live material flow tracing: Supplier → Receipt → Warehouse → Transfer → Location → Delivery
            </p>
          </div>
        </div>

        {/* Consignment Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-slate-400">Consignment:</span>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
          >
            {items.map((it) => (
              <option key={it.id} value={it.id} className="bg-slate-900 text-slate-200">
                {it.sku} - {it.quantity} units ({it.receiptNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeItem && (
        <div className="mt-5 space-y-6">
          {/* Active SKU Overview */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tracking SKU
              </span>
              <h4 className="text-sm font-bold text-white">{activeItem.productName}</h4>
              <span className="text-xs font-mono text-emerald-400">{activeItem.sku}</span>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Consignment Batch</span>
                <span className="font-mono text-slate-200 font-semibold">{activeItem.quantity} Units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Station</span>
                <span className="font-mono text-cyan-400 font-semibold uppercase">
                  {activeItem.currentStage}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Recipient</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {activeItem.customerName || 'In Facility'}
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Stepper Visualization */}
          <div className="relative pt-3 pb-2 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[620px] relative">
              {/* Connecting Line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-800 -z-0" />
              <div
                className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-700 -z-0"
                style={{
                  width: `${(currentStageIndex / (stageOrder.length - 1)) * 90}%`,
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
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                        isCurrent
                          ? 'border-emerald-400 bg-emerald-500 text-white shadow-glow-primary scale-110'
                          : isPassed
                          ? 'border-emerald-500/50 bg-slate-900 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      )}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Icon className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Icon className="w-4 h-4 opacity-50" />
                      )}
                    </div>

                    <span
                      className={cn(
                        'mt-2 text-xs font-semibold tracking-tight',
                        isCurrent
                          ? 'text-emerald-400'
                          : isPassed
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      )}
                    >
                      {st.label}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {isCurrent ? 'Active' : isPassed ? 'Verified' : 'Pending'}
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
                    'p-3.5 rounded-xl border transition-all text-xs',
                    isNow
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : isPast
                      ? 'bg-slate-900/40 border-slate-800'
                      : 'bg-slate-950/30 border-slate-900 opacity-60'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      Phase {idx + 1}: {step.stage}
                    </span>
                    {step.status === 'COMPLETED' ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                        <CheckCircle2 size={12} /> Done
                      </span>
                    ) : step.status === 'IN_PROGRESS' ? (
                      <span className="text-cyan-400 flex items-center gap-1 font-mono text-[10px]">
                        <Clock size={12} className="animate-spin" /> In Progress
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">Awaiting</span>
                    )}
                  </div>

                  <h5 className="font-semibold text-slate-100">{step.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.subtitle}</p>

                  {step.details && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[10px]">
                      {Object.entries(step.details).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-slate-400">
                          <span>{k}:</span>
                          <span className="text-slate-200">{String(v)}</span>
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
