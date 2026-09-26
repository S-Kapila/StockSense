import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Calendar,
  Warehouse,
  CheckCircle2,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { LOCATION_NAMES } from '../../types/inventory';
import { Button } from '../common/Button';
import { TransferModal } from './TransferModal';

interface TransfersViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const { transfers } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransfers = transfers.filter((t) => {
    return (
      searchQuery.trim() === '' ||
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Actions Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transfers by SKU, product or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Internal Transfer
        </Button>
      </div>

      {/* Transfers Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTransfers.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowLeftRight className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No internal transfers yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Relocate inventory items between Main Warehouse, Production Floor, and Storage Rack.
              </p>
              <Button
                variant="outline"
                size="xs"
                className="mt-4"
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Create First Transfer
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-6">Item</th>
                  <th className="py-3.5 px-6">Routing</th>
                  <th className="py-3.5 px-6">Quantity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredTransfers.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {t.reference}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                      <div className="font-mono text-xs text-slate-400">{t.sku}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {LOCATION_NAMES[t.sourceLocation]}
                        </span>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-brand-500" />
                        <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold">
                          {LOCATION_NAMES[t.destinationLocation]}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      {t.quantity} {t.uom}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <TransferModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
