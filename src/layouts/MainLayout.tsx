import React, { useState } from 'react';
import { Sidebar, ActiveNav } from './Sidebar';
import { TopBar } from './TopBar';
import { Warehouse, Alert } from '../types';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/Input';
import { Search, ArrowRight, Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeNav: ActiveNav;
  onNavigate: (nav: ActiveNav) => void;
  selectedWarehouseId: string;
  onSelectWarehouse: (id: string) => void;
  warehouses: Warehouse[];
  alerts: Alert[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeNav,
  onNavigate,
  selectedWarehouseId,
  onSelectWarehouse,
  warehouses,
  alerts,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Ctrl + K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavigate={(nav) => {
          onNavigate(nav);
          setMobileSidebarOpen(false);
        }}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        unreadAlertCount={alerts.filter((a) => !a.isRead).length}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopBar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          selectedWarehouseId={selectedWarehouseId}
          onSelectWarehouse={onSelectWarehouse}
          warehouses={warehouses}
          alerts={alerts}
          onOpenSearch={() => setSearchModalOpen(true)}
          onNavigateAlerts={() => onNavigate('alerts')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Search Modal (Ctrl + K) */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title="StockSense Global Navigator"
        description="Quick jump to operations, SKUs, warehouses, or ledger records"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <SearchInput
            placeholder="Type a SKU, product, transfer number, or command..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-mono uppercase text-slate-400">Quick Navigation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigate('products');
                  setSearchModalOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200">Catalog & Products</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onNavigate('operations-receipts');
                  setSearchModalOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200">Inward Receipts</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onNavigate('operations-deliveries');
                  setSearchModalOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpFromLine className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200">Outward Deliveries</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onNavigate('ledger');
                  setSearchModalOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-200">Stock Ledger Audit</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
