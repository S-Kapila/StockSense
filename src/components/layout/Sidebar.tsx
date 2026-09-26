import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ClipboardList,
  UserCircle,
  LogOut,
  PackageCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export type NavTab = 'dashboard' | 'products' | 'receipts' | 'deliveries' | 'transfers' | 'ledger' | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { kpis } = useInventory();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'products' as NavTab,
      label: 'Products',
      icon: <Boxes className="w-5 h-5" />,
      badge: kpis.lowStockCount > 0 ? (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertCircle className="w-3 h-3" />
          {kpis.lowStockCount}
        </span>
      ) : null,
    },
    {
      id: 'receipts' as NavTab,
      label: 'Receipts',
      icon: <ArrowDownLeft className="w-5 h-5" />,
      badge: kpis.pendingReceipts > 0 ? (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          {kpis.pendingReceipts}
        </span>
      ) : null,
    },
    {
      id: 'deliveries' as NavTab,
      label: 'Deliveries',
      icon: <ArrowUpRight className="w-5 h-5" />,
      badge: kpis.pendingDeliveries > 0 ? (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          {kpis.pendingDeliveries}
        </span>
      ) : null,
    },
    {
      id: 'transfers' as NavTab,
      label: 'Internal Transfers',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'ledger' as NavTab,
      label: 'Stock Ledger',
      icon: <ClipboardList className="w-5 h-5" />,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="flex items-center gap-3 px-6 h-18 border-b border-slate-100 dark:border-slate-800/80">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  StockSense
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Inventory</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations
            </p>
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                    active
                      ? 'bg-brand-50/90 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        active
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge}
                </button>
              );
            })}

            <div className="pt-4">
              <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </p>
              <button
                onClick={() => {
                  onSelectTab('profile');
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-brand-50/90 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCircle
                    className={`w-5 h-5 ${
                      currentTab === 'profile'
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>Settings & Profile</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role || 'Administrator'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
