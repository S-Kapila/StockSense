import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  Calendar,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { LedgerEntry, LedgerEntryType } from '../../types/inventory';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const StockLedgerView: React.FC = () => {
  const { ledger } = useInventory();
  const { info } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | LedgerEntryType>('ALL');

  const filteredLedger = useMemo(() => {
    return ledger.filter((entry) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        entry.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.performedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || entry.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [ledger, searchQuery, typeFilter]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredLedger.length === 0) {
      info('No records to export', 'The current ledger filter has no entries.');
      return;
    }

    const headers = [
      'Timestamp',
      'Transaction Type',
      'Reference Number',
      'SKU',
      'Product Name',
      'Location Routing',
      'Quantity Delta',
      'Resulting Total Balance',
      'Operator',
      'Notes',
    ];

    const rows = filteredLedger.map((e) => [
      `"${new Date(e.timestamp).toISOString()}"`,
      `"${e.type}"`,
      `"${e.referenceNumber}"`,
      `"${e.sku}"`,
      `"${e.productName.replace(/"/g, '""')}"`,
      `"${e.locationDetails.replace(/"/g, '""')}"`,
      e.quantityDelta,
      e.resultingBalance,
      `"${e.performedBy}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_ledger_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    info('Ledger Exported', `Exported ${filteredLedger.length} ledger entries to CSV.`);
  };

  const getTypeBadge = (type: LedgerEntryType) => {
    switch (type) {
      case 'RECEIPT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <ArrowDownLeft className="w-3 h-3" />
            RECEIPT
          </span>
        );
      case 'DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <ArrowUpRight className="w-3 h-3" />
            DELIVERY
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <ArrowLeftRight className="w-3 h-3" />
            TRANSFER
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <Sliders className="w-3 h-3" />
            ADJUSTMENT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar with Search, Type Filter and Export CSV */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by SKU, product, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Filter & Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            {(['ALL', 'RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer ${
                    typeFilter === type
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {type.toLowerCase()}
                </button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredLedger.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No ledger entries found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Completed receipts, deliveries, and adjustments will append here automatically.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Type & Ref</th>
                  <th className="py-3.5 px-6">Product / SKU</th>
                  <th className="py-3.5 px-6">Movement Details</th>
                  <th className="py-3.5 px-6 text-right">Quantity Delta</th>
                  <th className="py-3.5 px-6 text-right">Balance</th>
                  <th className="py-3.5 px-6">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredLedger.map((entry) => {
                  const isPositive = entry.quantityDelta > 0;
                  const isNegative = entry.quantityDelta < 0;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(entry.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Type and Ref */}
                      <td className="py-3.5 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          {getTypeBadge(entry.type)}
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {entry.referenceNumber}
                          </span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {entry.productName}
                        </div>
                        <div className="font-mono text-xs text-slate-400">{entry.sku}</div>
                      </td>

                      {/* Location Movement */}
                      <td className="py-3.5 px-6">
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {entry.locationDetails}
                        </div>
                        {entry.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {entry.notes}
                          </div>
                        )}
                      </td>

                      {/* Delta */}
                      <td className="py-3.5 px-6 text-right font-mono font-extrabold">
                        {isPositive ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{entry.quantityDelta}
                          </span>
                        ) : isNegative ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            {entry.quantityDelta}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">
                            ⇄ {entry.quantityDelta}
                          </span>
                        )}
                      </td>

                      {/* Resulting Balance */}
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {entry.resultingBalance}
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {entry.performedBy}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total audit events recorded: {ledger.length} entries
          </span>
          <span className="font-mono">Immutable Transaction History</span>
        </div>
      </div>
    </div>
  );
};
