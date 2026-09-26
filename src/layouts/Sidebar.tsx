import React, { useState } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  TrendingUp,
  Bell,
  ChevronDown,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

export type ActiveNav =
  | 'dashboard'
  | 'products'
  | 'operations-receipts'
  | 'operations-deliveries'
  | 'operations-transfers'
  | 'operations-adjustments'
  | 'ledger'
  | 'warehouses'
  | 'insights'
  | 'alerts';

interface SidebarProps {
  activeNav: ActiveNav;
  onNavigate: (nav: ActiveNav) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadAlertCount?: number;
  pendingReceiptsCount?: number;
  pendingDeliveriesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  unreadAlertCount = 0,
  pendingReceiptsCount = 0,
  pendingDeliveriesCount = 0,
}) => {
  const { user } = useAuth();
  const [operationsOpen, setOperationsOpen] = useState(true);

  const isOpActive = activeNav.startsWith('operations');

  const navItemClass = (isActive: boolean) =>
    cn(
      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none text-left',
      isActive
        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
    );

  const subNavItemClass = (isActive: boolean) =>
    cn(
      'w-full flex items-center justify-between pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none text-left',
      isActive
        ? 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-900 dark:text-white font-semibold'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
    );

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#0c101c] border-r border-slate-200 dark:border-slate-800/80 z-50 flex flex-col transition-transform duration-200 ease-in-out',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white block">
                StockSense
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block -mt-0.5">
                GCET 2026 • v1.0
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400">
            Operations
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className={navItemClass(activeNav === 'dashboard')}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('products')}
            className={navItemClass(activeNav === 'products')}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Products & Catalog</span>
            </div>
          </button>

          {/* Operations Dropdown */}
          <div className="space-y-0.5">
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none',
                isOpActive
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Movements</span>
              </div>
              <ChevronDown
                size={13}
                className={cn('transition-transform duration-150 text-slate-400', operationsOpen && 'rotate-180')}
              />
            </button>

            {operationsOpen && (
              <div className="space-y-0.5 pt-0.5">
                <button
                  onClick={() => onNavigate('operations-receipts')}
                  className={subNavItemClass(activeNav === 'operations-receipts')}
                >
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" />
                    <span>Receipts</span>
                  </div>
                  {pendingReceiptsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                      {pendingReceiptsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('operations-deliveries')}
                  className={subNavItemClass(activeNav === 'operations-deliveries')}
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deliveries</span>
                  </div>
                  {pendingDeliveriesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                      {pendingDeliveriesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('operations-transfers')}
                  className={subNavItemClass(activeNav === 'operations-transfers')}
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transfers</span>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('operations-adjustments')}
                  className={subNavItemClass(activeNav === 'operations-adjustments')}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Adjustments</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('ledger')}
            className={navItemClass(activeNav === 'ledger')}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Stock Ledger</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              Audit
            </span>
          </button>

          <div className="pt-4 px-3 pb-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400">
            Network & Alerts
          </div>

          <button
            onClick={() => onNavigate('warehouses')}
            className={navItemClass(activeNav === 'warehouses')}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Warehouses</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('insights')}
            className={navItemClass(activeNav === 'insights')}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Insights & Health</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('alerts')}
            className={navItemClass(activeNav === 'alerts')}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Alerts</span>
            </div>
            {unreadAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                {unreadAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Footer User & Engine Status */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-slate-700 dark:text-slate-300">Engine Synced</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
