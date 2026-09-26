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
  Activity,
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
  unreadAlertCount = 2,
  pendingReceiptsCount = 2,
  pendingDeliveriesCount = 2,
}) => {
  const { user } = useAuth();
  const [operationsOpen, setOperationsOpen] = useState(true);

  const isOpActive = activeNav.startsWith('operations');

  const navItemClass = (isActive: boolean) =>
    cn(
      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group select-none text-left',
      isActive
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
    );

  const subNavItemClass = (isActive: boolean) =>
    cn(
      'w-full flex items-center justify-between pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none text-left',
      isActive
        ? 'text-emerald-400 font-semibold bg-emerald-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 w-64 glass-panel border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-glow-primary">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">StockSense</span>
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase block -mt-0.5">
                v1.0 • Odoo × GCET
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scroll">
          <div className="px-3 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Core Operations
          </div>

          {/* Dashboard */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={navItemClass(activeNav === 'dashboard')}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Products */}
          <button
            onClick={() => onNavigate('products')}
            className={navItemClass(activeNav === 'products')}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Products & Catalog</span>
            </div>
          </button>

          {/* Operations Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all select-none',
                isOpActive ? 'text-slate-200 bg-slate-850' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Stock Operations</span>
              </div>
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', operationsOpen && 'rotate-180')}
              />
            </button>

            {operationsOpen && (
              <div className="space-y-1 pt-0.5 pb-1">
                <button
                  onClick={() => onNavigate('operations-receipts')}
                  className={subNavItemClass(activeNav === 'operations-receipts')}
                >
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Receipts</span>
                  </div>
                  {pendingReceiptsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                      {pendingReceiptsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('operations-deliveries')}
                  className={subNavItemClass(activeNav === 'operations-deliveries')}
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-amber-400" />
                    <span>Deliveries</span>
                  </div>
                  {pendingDeliveriesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300">
                      {pendingDeliveriesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('operations-transfers')}
                  className={subNavItemClass(activeNav === 'operations-transfers')}
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Transfers</span>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('operations-adjustments')}
                  className={subNavItemClass(activeNav === 'operations-adjustments')}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                    <span>Adjustments</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Stock Ledger */}
          <button
            onClick={() => onNavigate('ledger')}
            className={navItemClass(activeNav === 'ledger')}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4" />
              <span>Stock Ledger</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              Audit
            </span>
          </button>

          <div className="pt-3 px-3 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Locations & Analytics
          </div>

          {/* Warehouses */}
          <button
            onClick={() => onNavigate('warehouses')}
            className={navItemClass(activeNav === 'warehouses')}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4" />
              <span>Warehouses</span>
            </div>
          </button>

          {/* Insights */}
          <button
            onClick={() => onNavigate('insights')}
            className={navItemClass(activeNav === 'insights')}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>Insights & Health</span>
            </div>
          </button>

          {/* Alerts */}
          <button
            onClick={() => onNavigate('alerts')}
            className={navItemClass(activeNav === 'alerts')}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Alerts Center</span>
            </div>
            {unreadAlertCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {unreadAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Footer / Engine Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-400">Engine Online</span>
              </div>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Role: <strong className="text-slate-200">{user?.role || 'Guest'}</strong></span>
              <span>GCET Team 1</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
