import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface CategoryBreakdownChartProps {
  data: Array<{
    name: string;
    value: number;
    count: number;
  }>;
}

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#6366f1', '#ec4899', '#64748b'];

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  return (
    <div className="enterprise-card p-5 flex flex-col h-80">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Inventory by Category
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Valuation Share</span>
      </div>

      <div className="flex-1 w-full min-h-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
              formatter={(value: number, _, item) => [
                `${formatCurrency(value)} (${item.payload.count} units)`,
                'Valuation',
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
