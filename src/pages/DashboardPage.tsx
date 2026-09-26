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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Inventory Command Center
            </h1>
            <Badge variant="success" size="sm" dot>
              Real-time Firestore
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeWarehouse
              ? `Operational view filtered for ${activeWarehouse.name} (${activeWarehouse.code})`
              : 'Global network overview across all hubs, transit routes, and customer dispatches'}
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
            <History size={14} />
            <span>Audit Ledger</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsQuickOpOpen(true)}
            className="shadow-glow-primary"
          >
            <Zap size={14} />
            <span>Quick Move / Adjust</span>
          </Button>
        </div>
      </div>

      {/* 8 Primary Dashboard Metrics */}
      <DashboardMetrics metrics={metrics} onNavigateTo={onNavigateTo} />

      {/* Middle Row: Inventory Health Gauge & Stock Movement Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomingOutgoingChart data={incomingOutgoingData} />
        <CategoryBreakdownChart data={categoryBreakdownData} />
      </div>

      {/* Recent Stock Ledger Transactions Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Recent Stock Ledger Transactions
            </h3>
          </div>
          <button
            onClick={() => onNavigateTo('ledger')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
          >
            <span>View Full Ledger</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>SKU & Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Warehouse / Location</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>New Balance</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.slice(0, 5).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-slate-400 whitespace-nowrap">
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-emerald-400 block font-semibold">
                    {entry.sku}
                  </span>
                  <span className="text-slate-300 truncate max-w-xs block text-[11px]">
                    {entry.productName}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      entry.quantityDelta > 0
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {entry.movementType.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-slate-300 text-xs">
                  {entry.warehouseName} ({entry.locationName})
                </TableCell>
                <TableCell
                  className={`font-mono font-bold ${
                    entry.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {entry.quantityDelta > 0 ? `+${entry.quantityDelta}` : entry.quantityDelta}
                </TableCell>
                <TableCell className="font-mono font-semibold text-white">
                  {entry.balanceAfter}
                </TableCell>
                <TableCell className="font-mono text-slate-400 text-[11px]">
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
