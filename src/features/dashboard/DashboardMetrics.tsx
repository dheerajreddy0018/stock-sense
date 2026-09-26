import React from 'react';
import { StatCard } from '../../components/ui/Card';
import { DashboardMetrics as MetricsType } from '../../hooks/useDashboard';
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  IndianRupee,
} from 'lucide-react';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

interface DashboardMetricsProps {
  metrics: MetricsType;
  onNavigateTo?: (section: string) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  metrics,
  onNavigateTo,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Products */}
      <StatCard
        title="Total Products"
        value={metrics.totalProducts}
        subtitle="Catalog active SKUs"
        icon={Package}
        accentColor="emerald"
        trend={{ value: '100%', isPositive: true, label: 'tracked in ledger' }}
        onClick={() => onNavigateTo?.('products')}
      />

      {/* 2. Total Stock Units */}
      <StatCard
        title="Total Stock Units"
        value={formatQuantity(metrics.totalStockUnits)}
        subtitle="Across all bin locations"
        icon={Layers}
        accentColor="cyan"
        trend={{ value: 'Live', isPositive: true, label: 'synchronized balance' }}
      />

      {/* 3. Low Stock */}
      <StatCard
        title="Low Stock Warning"
        value={metrics.lowStockCount}
        subtitle="Below minimum alert limit"
        icon={AlertTriangle}
        accentColor="amber"
        trend={{
          value: metrics.lowStockCount > 0 ? 'Action Req' : 'Optimal',
          isPositive: metrics.lowStockCount === 0,
          label: 'replenishment alert',
        }}
        onClick={() => onNavigateTo?.('alerts')}
      />

      {/* 4. Out of Stock */}
      <StatCard
        title="Out of Stock"
        value={metrics.outOfStockCount}
        subtitle="Zero balance SKUs"
        icon={XCircle}
        accentColor="rose"
        trend={{
          value: metrics.outOfStockCount > 0 ? 'Critical' : 'None',
          isPositive: metrics.outOfStockCount === 0,
          label: 'depleted items',
        }}
        onClick={() => onNavigateTo?.('alerts')}
      />

      {/* 5. Pending Receipts */}
      <StatCard
        title="Pending Receipts"
        value={metrics.pendingReceiptsCount}
        subtitle="Awaiting dock inwarding"
        icon={ArrowDownToLine}
        accentColor="cyan"
        trend={{ value: 'Supplier', isPositive: true, label: 'inbound shipments' }}
        onClick={() => onNavigateTo?.('operations-receipts')}
      />

      {/* 6. Pending Deliveries */}
      <StatCard
        title="Pending Deliveries"
        value={metrics.pendingDeliveriesCount}
        subtitle="Customer dispatches ready"
        icon={ArrowUpFromLine}
        accentColor="amber"
        trend={{ value: 'Fulfillment', isPositive: true, label: 'outbound orders' }}
        onClick={() => onNavigateTo?.('operations-deliveries')}
      />

      {/* 7. Scheduled Transfers */}
      <StatCard
        title="Scheduled Transfers"
        value={metrics.scheduledTransfersCount}
        subtitle="Inter-hub relocations"
        icon={ArrowLeftRight}
        accentColor="indigo"
        trend={{ value: 'Transit', isPositive: true, label: 'expressway fleet' }}
        onClick={() => onNavigateTo?.('operations-transfers')}
      />

      {/* 8. Total Inventory Value */}
      <StatCard
        title="Total Inventory Value"
        value={formatCurrency(metrics.inventoryValue)}
        subtitle="Cost valuation basis"
        icon={IndianRupee}
        accentColor="emerald"
        trend={{ value: 'Weighted', isPositive: true, label: 'asset capital' }}
      />
    </div>
  );
};
