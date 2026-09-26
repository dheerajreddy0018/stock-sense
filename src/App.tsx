import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { RoleGuard } from './features/auth/RoleGuard';
import { MainLayout } from './layouts/MainLayout';
import { ActiveNav } from './layouts/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProductsView } from './features/products/ProductsView';
import { ReceiptsView } from './features/receipts/ReceiptsView';
import { DeliveriesView } from './features/deliveries/DeliveriesView';
import { TransfersView } from './features/transfers/TransfersView';
import { AdjustmentsView } from './features/adjustments/AdjustmentsView';
import { StockLedgerView } from './features/ledger/StockLedgerView';
import { WarehousesView } from './features/warehouses/WarehousesView';
import { InsightsView } from './features/insights/InsightsView';
import { AlertsView } from './features/alerts/AlertsView';
import { dbService } from './services/databaseService';
import { COLLECTIONS } from './firebase/collections';
import { Warehouse, Alert } from './types';


type AuthView = 'login' | 'signup' | 'forgot';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const unsubW = dbService.subscribe<Warehouse>(COLLECTIONS.WAREHOUSES, setWarehouses);
    const unsubA = dbService.subscribe<Alert>(COLLECTIONS.ALERTS, setAlerts);
    return () => {
      unsubW();
      unsubA();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <p className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
          Initializing StockSense...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authView === 'signup') {
      return (
        <SignupPage
          onSuccess={() => setAuthView('login')}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    if (authView === 'forgot') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onSuccess={() => setActiveNav('dashboard')}
        onNavigateToSignup={() => setAuthView('signup')}
        onNavigateToForgot={() => setAuthView('forgot')}
      />
    );
  }

  // Authenticated Application Shell
  const renderCurrentView = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <DashboardPage
            selectedWarehouseId={selectedWarehouseId}
            onNavigateTo={(section) => setActiveNav(section)}
          />
        );
      case 'products':
        return <ProductsView />;
      case 'operations-receipts':
        return <ReceiptsView />;
      case 'operations-deliveries':
        return <DeliveriesView />;
      case 'operations-transfers':
        return <TransfersView />;
      case 'operations-adjustments':
        return (
          <RoleGuard
            allowedRoles={['ADMIN', 'INVENTORY_MANAGER']}
            fallback={
              <div className="p-8 text-center glass-panel rounded-2xl border border-amber-500/30">
                <h3 className="text-base font-semibold text-white">Manager Authorization Required</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Physical stock adjustments alter fiscal balances and can only be committed by an Inventory Manager or Admin.
                </p>
              </div>
            }
          >
            <AdjustmentsView />
          </RoleGuard>
        );
      case 'ledger':
        return <StockLedgerView />;
      case 'warehouses':
        return <WarehousesView />;
      case 'insights':
        return <InsightsView />;
      case 'alerts':
        return <AlertsView />;
      default:
        return (
          <DashboardPage
            selectedWarehouseId={selectedWarehouseId}
            onNavigateTo={(section) => setActiveNav(section)}
          />
        );
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout
        activeNav={activeNav}
        onNavigate={setActiveNav}
        selectedWarehouseId={selectedWarehouseId}
        onSelectWarehouse={setSelectedWarehouseId}
        warehouses={warehouses}
        alerts={alerts}
      >


        {renderCurrentView()}
      </MainLayout>
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
