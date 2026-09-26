import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  Eye,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Delivery, OperationStatus } from '../../types/inventory';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { DeliveryModal } from './DeliveryModal';
import { DeliveryDetailModal } from './DeliveryDetailModal';
import { useToast } from '../../context/ToastContext';

interface DeliveriesViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const { deliveries, markDeliveryAsDone } = useInventory();
  const { success, error: toastError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OperationStatus>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        d.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchQuery, statusFilter]);

  const handleQuickMarkDone = (e: React.MouseEvent, id: string, ref: string) => {
    e.stopPropagation();
    const res = markDeliveryAsDone(id);
    if (res.success) {
      success('Delivery Dispatched', `Stock deducted and order completed for ${ref}.`);
    } else {
      toastError('Dispatch Failed', res.error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Actions & Filters Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or order ref..."
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
            New Delivery Order
          </Button>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowUpRight className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No delivery orders found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search criteria or create a new delivery order.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Order Reference</th>
                  <th className="py-3.5 px-6">Customer / Client</th>
                  <th className="py-3.5 px-6">Items & Quantities</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Order Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredDeliveries.map((del) => {
                  const totalUnits = del.items.reduce((s, it) => s + it.quantity, 0);

                  return (
                    <tr
                      key={del.id}
                      onClick={() => setSelectedDelivery(del)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {del.reference}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {del.customerName}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {del.items.length} {del.items.length === 1 ? 'Product' : 'Products'}{' '}
                          <span className="font-bold text-slate-900 dark:text-white">
                            ({totalUnits} units)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {del.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={del.status} />
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(del.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {del.status !== 'done' ? (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={(e) => handleQuickMarkDone(e, del.id, del.reference)}
                              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Dispatch
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Dispatched
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedDelivery(del)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Order Details"
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
      <DeliveryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeliveryDetailModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
};
