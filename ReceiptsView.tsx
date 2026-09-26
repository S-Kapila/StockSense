import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Eye,
  Filter,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Receipt, OperationStatus } from '../../types/inventory';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { ReceiptModal } from './ReceiptModal';
import { ReceiptDetailModal } from './ReceiptDetailModal';
import { useToast } from '../../context/ToastContext';

interface ReceiptsViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const { receipts, markReceiptAsDone } = useInventory();
  const { success, error: toastError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OperationStatus>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchQuery, statusFilter]);

  const handleQuickMarkDone = (e: React.MouseEvent, id: string, ref: string) => {
    e.stopPropagation();
    const res = markReceiptAsDone(id);
    if (res.success) {
      success('Receipt Validated', `Stock received and updated for ${ref}.`);
    } else {
      toastError('Validation Failed', res.error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Actions Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by supplier or receipt reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Filter Tabs & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            {(['all', 'ready', 'done', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Receipt
          </Button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredReceipts.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowDownLeft className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No receipts found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try clearing your search or create an incoming stock receipt.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-6">Supplier</th>
                  <th className="py-3.5 px-6">Items & Quantities</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredReceipts.map((rec) => {
                  const totalUnits = rec.items.reduce((s, it) => s + it.quantity, 0);

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedReceipt(rec)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {rec.reference}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {rec.supplierName}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {rec.items.length} {rec.items.length === 1 ? 'Product' : 'Products'}{' '}
                          <span className="font-bold text-slate-900 dark:text-white">
                            ({totalUnits} units)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {rec.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={rec.status} />
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rec.status !== 'done' ? (
                            <Button
                              variant="success"
                              size="xs"
                              onClick={(e) => handleQuickMarkDone(e, rec.id, rec.reference)}
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Receive
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Received
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedReceipt(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Manifest Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReceiptModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ReceiptDetailModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
