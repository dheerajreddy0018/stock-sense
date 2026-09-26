import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Warehouse as WarehouseIcon,
  ChevronDown,
  LogOut,
  UserCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Warehouse, Alert } from '../types';
import { seedService } from '../services/seedService';

interface TopBarProps {
  onToggleMobileSidebar: () => void;
  selectedWarehouseId: string;
  onSelectWarehouse: (warehouseId: string) => void;
  warehouses: Warehouse[];
  alerts: Alert[];
  onOpenSearch: () => void;
  onNavigateAlerts?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileSidebar,
  selectedWarehouseId,
  onSelectWarehouse,
  warehouses,
  alerts,
  onOpenSearch,
  onNavigateAlerts,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const handleResetData = async () => {
    setSeeding(true);
    await seedService.seedAll(true);
    setSeeding(false);
    setProfileDropdownOpen(false);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="w-full max-w-sm flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition group text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition" />
            <span className="truncate">Search products, receipts, transfers...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Warehouse Selector */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200">
            <WarehouseIcon className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => onSelectWarehouse(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Warehouses (Global)
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200">
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
          >
            <Bell size={18} />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">StockSense Alerts</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono">
                    {unreadAlerts.length} new
                  </span>
                </div>
                {onNavigateAlerts && (
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      onNavigateAlerts();
                    }}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto custom-scroll">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200">{alert.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-medium text-slate-200 block leading-tight">
                {user?.displayName?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block -mt-0.5">
                {user?.role || 'Operator'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="pb-3 border-b border-slate-800 px-2 pt-1">
                <p className="text-xs font-semibold text-white">{user?.displayName}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Role: {user?.role}
                </div>
              </div>

              {/* Quick Role Switcher for Hackathon presentation */}
              <div className="py-2 border-b border-slate-800">
                <span className="px-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Switch Active Role
                </span>
                <div className="space-y-0.5">
                  {(['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={async () => {
                        await quickLogin(r);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {r.replace('_', ' ')}
                      </span>
                      {user?.role === r && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seed / Reset Data */}
              <div className="py-1">
                <button
                  onClick={handleResetData}
                  disabled={seeding}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 transition"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Resetting Data...' : 'Reset Hackathon Seed Data'}</span>
                </button>
              </div>

              {/* Logout */}
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
