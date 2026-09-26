import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  ArrowLeftRight,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NavTab } from './Sidebar';
import { Button } from '../common/Button';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onOpenNewProduct: () => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
  onOpenNewTransfer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenNewProduct,
  onOpenNewReceipt,
  onOpenNewDelivery,
  onOpenNewTransfer,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time overview of warehouse inventory & order velocity',
    },
    products: {
      title: 'Product Master Catalog',
      subtitle: 'Manage inventory items, SKUs, and stock distribution by location',
    },
    receipts: {
      title: 'Inbound Receipts',
      subtitle: 'Process incoming supplier shipments and auto-replenish stock',
    },
    deliveries: {
      title: 'Outbound Deliveries',
      subtitle: 'Fulfill customer orders, verify availability, and dispatch stock',
    },
    transfers: {
      title: 'Internal Stock Transfers',
      subtitle: 'Relocate items between warehouse floors and storage racks',
    },
    ledger: {
      title: 'Stock Ledger Audit Trail',
      subtitle: 'Complete immutable log of all inventory movements and adjustments',
    },
    profile: {
      title: 'Account & System Settings',
      subtitle: 'Manage your profile and demo mock backend states',
    },
  };

  const headerInfo = titles[currentTab] || { title: 'Inventory Management', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {headerInfo.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Live Sync Status */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local Sync Active</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Quick Action Button Dropdown */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            >
              <span>New Action</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </Button>

            {quickMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-slide-up">
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewReceipt();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div>Inbound Receipt</div>
                    <div className="text-[10px] text-slate-400 font-normal">Receive stock from supplier</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewDelivery();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div>Outbound Delivery</div>
                    <div className="text-[10px] text-slate-400 font-normal">Fulfill customer order</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewTransfer();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div>Internal Transfer</div>
                    <div className="text-[10px] text-slate-400 font-normal">Move items across zones</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewProduct();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <Boxes className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <div>
                    <div>Create Product</div>
                    <div className="text-[10px] text-slate-400 font-normal">Add SKU to master list</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
