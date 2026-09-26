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
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0a0e17]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-500 dark:text-slate-400 transition text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Search products, receipts, transfers...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Warehouse Selector */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            <WarehouseIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => onSelectWarehouse(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                All Facilities
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
          >
            <Bell size={17} />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 enterprise-card p-3 shadow-lg z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">Alerts</span>
                  {unreadAlerts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-mono border border-rose-200 dark:border-rose-800/60">
                      {unreadAlerts.length} new
                    </span>
                  )}
                </div>
                {onNavigateAlerts && (
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      onNavigateAlerts();
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{alert.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{alert.message}</p>
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
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition border border-transparent"
          >
            <div className="w-7 h-7 rounded-md bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-medium text-xs">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-medium text-slate-900 dark:text-white block leading-tight">
                {user?.displayName?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block -mt-0.5">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 enterprise-card p-2.5 shadow-lg z-50">
              <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 px-2 pt-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.displayName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user?.email}</p>
              </div>

              {/* Role Switcher */}
              <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Active Role
                </span>
                <div className="space-y-0.5">
                  {(['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={async () => {
                        await quickLogin(r);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {r.replace('_', ' ')}
                      </span>
                      {user?.role === r && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Data */}
              <div className="py-1">
                <button
                  onClick={handleResetData}
                  disabled={seeding}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Resetting Data...' : 'Reset Seed Dataset'}</span>
                </button>
              </div>

              {/* Logout */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
