import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface StockMovementChartProps {
  data: Array<{
    date: string;
    inward: number;
    outward: number;
    net: number;
  }>;
}

export const StockMovementChart: React.FC<StockMovementChartProps> = ({ data }) => {
  return (
    <div className="enterprise-card p-5 flex flex-col h-80">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Stock Movement History
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          Inward vs Outward Ledger Flow
        </span>
      </div>

      <div className="flex-1 w-full min-h-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="inwardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="outwardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.15} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {value === 'inward' ? 'Inward Receipts (+)' : 'Outward Deliveries (-)'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="inward"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#inwardGrad)"
              name="inward"
            />
            <Area
              type="monotone"
              dataKey="outward"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#outwardGrad)"
              name="outward"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
