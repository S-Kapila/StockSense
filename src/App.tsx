import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { ReceiptsView } from './components/receipts/ReceiptsView';
import { DeliveriesView } from './components/deliveries/DeliveriesView';
import { TransfersView } from './components/transfers/TransfersView';
import { StockLedgerView } from './components/ledger/StockLedgerView';
import { ProfileView } from './components/profile/ProfileView';

// Modals
import { ProductModal } from './components/products/ProductModal';
import { ReceiptModal } from './components/receipts/ReceiptModal';
import { DeliveryModal } from './components/deliveries/DeliveryModal';
import { TransferModal } from './components/transfers/TransferModal';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Quick Action Modals
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isNewReceiptOpen, setIsNewReceiptOpen] = useState(false);
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex">
      {/* Auth Screen Modal if unauthenticated */}
      <AuthModal isOpen={!isAuthenticated} />

      {/* Main Application Layout when authenticated */}
      {isAuthenticated && (
        <>
          {/* Left Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <Header
              currentTab={currentTab}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              onOpenNewProduct={() => setIsNewProductOpen(true)}
              onOpenNewReceipt={() => setIsNewReceiptOpen(true)}
              onOpenNewDelivery={() => setIsNewDeliveryOpen(true)}
              onOpenNewTransfer={() => setIsNewTransferOpen(true)}
            />

            {/* Page Content */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {currentTab === 'dashboard' && (
                <DashboardView
                  onNavigate={setCurrentTab}
                  onOpenNewReceipt={() => setIsNewReceiptOpen(true)}
                  onOpenNewDelivery={() => setIsNewDeliveryOpen(true)}
                />
              )}
              {currentTab === 'products' && (
                <ProductsView
                  isAddModalOpen={isNewProductOpen}
                  setIsAddModalOpen={setIsNewProductOpen}
                />
              )}
              {currentTab === 'receipts' && (
                <ReceiptsView
                  isAddModalOpen={isNewReceiptOpen}
                  setIsAddModalOpen={setIsNewReceiptOpen}
                />
              )}
              {currentTab === 'deliveries' && (
                <DeliveriesView
                  isAddModalOpen={isNewDeliveryOpen}
                  setIsAddModalOpen={setIsNewDeliveryOpen}
                />
              )}
              {currentTab === 'transfers' && (
                <TransfersView
                  isAddModalOpen={isNewTransferOpen}
                  setIsAddModalOpen={setIsNewTransferOpen}
                />
              )}
              {currentTab === 'ledger' && <StockLedgerView />}
              {currentTab === 'profile' && <ProfileView />}
            </main>
          </div>

          {/* Quick Action Modals */}
          <ProductModal
            isOpen={isNewProductOpen && currentTab !== 'products'}
            onClose={() => setIsNewProductOpen(false)}
          />
          <ReceiptModal
            isOpen={isNewReceiptOpen && currentTab !== 'receipts'}
            onClose={() => setIsNewReceiptOpen(false)}
          />
          <DeliveryModal
            isOpen={isNewDeliveryOpen && currentTab !== 'deliveries'}
            onClose={() => setIsNewDeliveryOpen(false)}
          />
          <TransferModal
            isOpen={isNewTransferOpen && currentTab !== 'transfers'}
            onClose={() => setIsNewTransferOpen(false)}
          />
        </>
      )}

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <InventoryProvider>
            <AppContent />
          </InventoryProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
