import React, { useState } from 'react';
import {
  UserCircle,
  Shield,
  Mail,
  Key,
  Database,
  RotateCcw,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const ProfileView: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { products, receipts, deliveries, transfers, ledger, resetToSampleData } = useInventory();
  const { success } = useToast();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleResetData = () => {
    resetToSampleData();
    setConfirmResetOpen(false);
    success(
      'Demo Data Reset',
      'Successfully restored the 5 sample products, 3 receipts, 2 deliveries, and synchronized ledger.'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={
            user?.avatar ||
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
          }
          alt={user?.name || 'User'}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-md"
        />

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {user?.name || 'Authorized Operator'}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 self-center sm:self-auto">
              <Shield className="w-3 h-3 mr-1" />
              {user?.role || 'Administrator'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {user?.email || 'admin@stocksense.io'}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="w-3 h-3 text-slate-400" />
              Token: {token ? `${token.substring(0, 16)}...` : 'Active Local Token'}
            </span>
          </div>
        </div>

        <div>
          <Button variant="danger" size="sm" onClick={logout} icon={<LogOut className="w-4 h-4" />}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* System Diagnostics & Mock Persistence Stats */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-brand-600" />
          <span>Local Storage Persistence Telemetry</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          All changes are instantly persisted locally across browser sessions.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block">Catalog Products</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {products.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block">Inbound Receipts</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {receipts.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block">Outbound Deliveries</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {deliveries.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block">Ledger Records</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {ledger.length}
            </span>
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>Reset Demo Mock Data</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Re-populate localStorage with the official spec baseline: 5 sample products, 3 receipts (1 pending), 2 deliveries (1 pending), and synchronized ledger audit entries.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmResetOpen(true)}
          icon={<RotateCcw className="w-4 h-4 text-amber-500" />}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* Confirm Reset Dialog */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Restore Sample Data?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              This will overwrite custom products and reset inventory numbers to the default 5 products and pre-simulated operations.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmResetOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleResetData}>
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
