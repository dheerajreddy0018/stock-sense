import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ArrowLeftRight } from 'lucide-react';

interface IncomingOutgoingChartProps {
  data: Array<{
    name: string;
    units: number;
    fill: string;
  }>;
}

export const IncomingOutgoingChart: React.FC<IncomingOutgoingChartProps> = ({ data }) => {
  return (
    <div className="enterprise-card p-5 flex flex-col h-80">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Incoming vs Outgoing Pipeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total Units</span>
      </div>

      <div className="flex-1 w-full min-h-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.15} vertical={false} />
            <XAxis
              dataKey="name"
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
              formatter={(value: number) => [`${value} units`, 'Volume']}
            />
            <Bar dataKey="units" radius={[6, 6, 0, 0]} barSize={36}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
