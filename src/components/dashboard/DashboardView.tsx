import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Warehouse,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { KpiCard, KpiStatus } from '../common/KpiCard';
import { StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { OperationStatus, LOCATION_NAMES } from '../../types/inventory';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewReceipt,
  onOpenNewDelivery,
}) => {
  const {
    products,
    receipts,
    deliveries,
    kpis,
    markReceiptAsDone,
    markDeliveryAsDone,
  } = useInventory();

  // Status Filter Tab for Recent Operations
  const [statusFilter, setStatusFilter] = useState<'all' | OperationStatus>('all');

  // Compute stock distribution by location
  const locationBreakdown = React.useMemo(() => {
    let main = 0;
    let prod = 0;
    let storage = 0;

    products.forEach((p) => {
      main += p.stockByLocation.mainWarehouse || 0;
      prod += p.stockByLocation.productionFloor || 0;
      storage += p.stockByLocation.storageRack || 0;
    });

    const total = main + prod + storage || 1;

    return {
      main,
      prod,
      storage,
      total,
      mainPct: Math.round((main / total) * 100),
      prodPct: Math.round((prod / total) * 100),
      storagePct: Math.round((storage / total) * 100),
    };
  }, [products]);

  // Combine and sort operations for the operations feed
  const combinedOperations = React.useMemo(() => {
    const list: Array<{
      id: string;
      opType: 'receipt' | 'delivery';
      reference: string;
      partyName: string;
      status: OperationStatus;
      date: string;
      itemCount: number;
    }> = [];

    receipts.forEach((r) => {
      list.push({
        id: r.id,
        opType: 'receipt',
        reference: r.reference,
        partyName: r.supplierName,
        status: r.status,
        date: r.createdAt,
        itemCount: r.items.reduce((acc, curr) => acc + curr.quantity, 0),
      });
    });

    deliveries.forEach((d) => {
      list.push({
        id: d.id,
        opType: 'delivery',
        reference: d.reference,
        partyName: d.customerName,
        status: d.status,
        date: d.createdAt,
        itemCount: d.items.reduce((acc, curr) => acc + curr.quantity, 0),
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (statusFilter === 'all') return list;
    return list.filter((item) => item.status === statusFilter);
  }, [receipts, deliveries, statusFilter]);

  // Low stock products alert list
  const lowStockItems = React.useMemo(() => {
    return products
      .filter((p) => {
        const total = (p.stockByLocation.mainWarehouse || 0) +
          (p.stockByLocation.productionFloor || 0) +
          (p.stockByLocation.storageRack || 0);
        return total <= p.minThreshold;
      })
      .slice(0, 4);
  }, [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Total Products */}
        <KpiCard
          title="Total Products"
          value={kpis.totalProducts}
          subtitle="Active SKUs in catalog"
          icon={<Boxes className="w-5 h-5" />}
          status="ok"
          statusText="Catalog OK"
          onClick={() => onNavigate('products')}
        />

        {/* KPI 2: Low Stock Items */}
        <KpiCard
          title="Low Stock Items"
          value={kpis.lowStockCount}
          subtitle={`Threshold < 10 units`}
          icon={<AlertTriangle className="w-5 h-5" />}
          status={kpis.lowStockCount > 0 ? 'critical' : 'ok'}
          statusText={kpis.lowStockCount > 0 ? 'Critical' : 'All Stocked'}
          onClick={() => onNavigate('products')}
        />

        {/* KPI 3: Pending Receipts */}
        <KpiCard
          title="Pending Receipts"
          value={kpis.pendingReceipts}
          subtitle="Inbound orders awaiting intake"
          icon={<ArrowDownLeft className="w-5 h-5" />}
          status={kpis.pendingReceipts > 0 ? 'warning' : 'ok'}
          statusText={kpis.pendingReceipts > 0 ? 'Action Needed' : 'Up to Date'}
          onClick={() => onNavigate('receipts')}
        />

        {/* KPI 4: Pending Deliveries */}
        <KpiCard
          title="Pending Deliveries"
          value={kpis.pendingDeliveries}
          subtitle="Outbound orders ready for dispatch"
          icon={<ArrowUpRight className="w-5 h-5" />}
          status={kpis.pendingDeliveries > 0 ? 'warning' : 'ok'}
          statusText={kpis.pendingDeliveries > 0 ? 'Pending Pick' : 'Dispatched'}
          onClick={() => onNavigate('deliveries')}
        />
      </div>

      {/* Warehouse Locations Breakdown & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock by Location Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>Multi-Location Stock Distribution</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current inventory allocation across active physical zones ({locationBreakdown.total} total units)
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onNavigate('transfers')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Transfer Stock
            </Button>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-6">
            <div
              style={{ width: `${locationBreakdown.mainPct}%` }}
              className="bg-brand-500 transition-all duration-500"
              title={`Main Warehouse: ${locationBreakdown.main} units (${locationBreakdown.mainPct}%)`}
            />
            <div
              style={{ width: `${locationBreakdown.prodPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Production Floor: ${locationBreakdown.prod} units (${locationBreakdown.prodPct}%)`}
            />
            <div
              style={{ width: `${locationBreakdown.storagePct}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Storage Rack: ${locationBreakdown.storage} units (${locationBreakdown.storagePct}%)`}
            />
          </div>

          {/* Location Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-900 dark:text-brand-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <span>{LOCATION_NAMES.mainWarehouse}</span>
                </div>
                <span>{locationBreakdown.mainPct}%</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {locationBreakdown.main}{' '}
                <span className="text-xs font-normal text-slate-500">units</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Primary intake & staging</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{LOCATION_NAMES.productionFloor}</span>
                </div>
                <span>{locationBreakdown.prodPct}%</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {locationBreakdown.prod}{' '}
                <span className="text-xs font-normal text-slate-500">units</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Active assembly lines</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{LOCATION_NAMES.storageRack}</span>
                </div>
                <span>{locationBreakdown.storagePct}%</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {locationBreakdown.storage}{' '}
                <span className="text-xs font-normal text-slate-500">units</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">High-bay reserve racks</p>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Low Stock Watchlist
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {lowStockItems.length} Alert{lowStockItems.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Products at or below reorder threshold requiring priority purchase orders.
            </p>

            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All inventory levels are within safe operating buffers.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((prod) => {
                  const currentStock = (prod.stockByLocation.mainWarehouse || 0) +
                    (prod.stockByLocation.productionFloor || 0) +
                    (prod.stockByLocation.storageRack || 0);
                  return (
                    <div
                      key={prod.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">{prod.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                          {currentStock} / {prod.minThreshold} {prod.uom}
                        </span>
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                          Critical
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onNavigate('receipts')}
              icon={<ArrowDownLeft className="w-4 h-4 text-emerald-600" />}
            >
              Create Restock Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Operations with Status Filter Tabs */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header and Filter Tabs */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>Inventory Operations Live Stream</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unified inbound receipts and outbound delivery fulfillment pipeline
            </p>
          </div>

          {/* Status Filter Tabs: All / Draft / Ready / Done */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            {(['all', 'draft', 'ready', 'done'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Operations' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Operations Table */}
        <div className="overflow-x-auto">
          {combinedOperations.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No operations found matching filter "{statusFilter}".
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-6">Operation / Ref</th>
                  <th className="py-3 px-6">Partner / Source</th>
                  <th className="py-3 px-6">Units</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {combinedOperations.map((op) => {
                  const isReceipt = op.opType === 'receipt';
                  return (
                    <tr
                      key={op.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isReceipt
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}
                          >
                            {isReceipt ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {op.reference}
                            </span>
                            <span className="ml-2 text-[11px] text-slate-400">
                              {isReceipt ? 'Inbound' : 'Outbound'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700 dark:text-slate-300">
                        {op.partyName}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                        {op.itemCount} items
                      </td>
                      <td className="py-3.5 px-6">
                        <StatusBadge status={op.status} />
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500">
                        {new Date(op.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {op.status !== 'done' ? (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              if (isReceipt) {
                                markReceiptAsDone(op.id);
                              } else {
                                markDeliveryAsDone(op.id);
                              }
                            }}
                          >
                            Mark Done
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Deep Navigation */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing {combinedOperations.length} operations
          </span>
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('receipts')}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Receipts <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('deliveries')}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Deliveries <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
