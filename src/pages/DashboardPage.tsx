import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardMetrics } from '../features/dashboard/DashboardMetrics';
import { InventoryHealthGauge } from '../features/dashboard/InventoryHealthGauge';
import { StockMovementChart } from '../features/dashboard/StockMovementChart';
import { IncomingOutgoingChart } from '../features/dashboard/IncomingOutgoingChart';
import { CategoryBreakdownChart } from '../features/dashboard/CategoryBreakdownChart';
import { StockPulseTracker } from '../features/dashboard/StockPulseTracker';
import { QuickOperationsModal } from '../features/dashboard/QuickOperationsModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import {
  Zap,
  History,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface DashboardPageProps {
  selectedWarehouseId: string;
  onNavigateTo: (section: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedWarehouseId,
  onNavigateTo,
}) => {
  const {
    products,
    warehouses,
    locations,
    metrics,
    stockMovementData,
    incomingOutgoingData,
    categoryBreakdownData,
    stockPulseItems,
    ledgerEntries,
  } = useDashboard(selectedWarehouseId);

  const [isQuickOpOpen, setIsQuickOpOpen] = useState(false);

  const activeWarehouse =
    selectedWarehouseId === 'ALL'
      ? null
      : warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inventory Overview
            </h1>
            <Badge variant="success" size="sm" dot>
              Live Sync
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeWarehouse
              ? `Filtered for ${activeWarehouse.name} (${activeWarehouse.code})`
              : 'Global network overview across all warehouse hubs and transit routes'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTo('ledger')}
            className="hidden sm:inline-flex"
          >
            <History size={13} />
            <span>Audit Ledger</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsQuickOpOpen(true)}
          >
            <Zap size={13} />
            <span>Quick Move / Adjust</span>
          </Button>
        </div>
      </div>

      {/* 8 Primary Dashboard Metrics */}
      <DashboardMetrics metrics={metrics} onNavigateTo={onNavigateTo} />

      {/* Middle Row: Inventory Health Gauge & Stock Movement Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <InventoryHealthGauge health={metrics.health} />
        </div>
        <div className="lg:col-span-2">
          <StockMovementChart data={stockMovementData} />
        </div>
      </div>

      {/* Signature Feature: Stock Pulse */}
      <StockPulseTracker items={stockPulseItems} />

      {/* Charts Row: Incoming vs Outgoing & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IncomingOutgoingChart data={incomingOutgoingData} />
        <CategoryBreakdownChart data={categoryBreakdownData} />
      </div>

      {/* Recent Stock Ledger Transactions Table */}
      <div className="enterprise-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Recent Stock Ledger Transactions
            </h3>
          </div>
          <button
            onClick={() => onNavigateTo('ledger')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 transition"
          >
            <span>View Full Ledger</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>SKU & Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>New Balance</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.slice(0, 5).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 block font-semibold">
                    {entry.sku}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs block text-[11px]">
                    {entry.productName}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      entry.quantityDelta > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                    }`}
                  >
                    {entry.movementType.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300 text-xs">
                  {entry.warehouseName} ({entry.locationName})
                </TableCell>
                <TableCell
                  className={`font-mono font-semibold ${
                    entry.quantityDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {entry.quantityDelta > 0 ? `+${entry.quantityDelta}` : entry.quantityDelta}
                </TableCell>
                <TableCell className="font-mono font-semibold text-slate-900 dark:text-white">
                  {entry.balanceAfter}
                </TableCell>
                <TableCell className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                  {entry.referenceId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Quick Operations Modal */}
      <QuickOperationsModal
        isOpen={isQuickOpOpen}
        onClose={() => setIsQuickOpOpen(false)}
        products={products}
        warehouses={warehouses}
        locations={locations}
      />
    </div>
  );
};
