import React from 'react';
import { Modal } from '../common/Modal';
import { Receipt, LOCATION_NAMES } from '../../types/inventory';
import { StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { CheckCircle2, Calendar, Building2, FileText, ArrowDownLeft } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';

interface ReceiptDetailModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({ receipt, onClose }) => {
  const { markReceiptAsDone } = useInventory();
  const { success, error: toastError } = useToast();

  if (!receipt) return null;

  const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleComplete = () => {
    const res = markReceiptAsDone(receipt.id);
    if (res.success) {
      success('Receipt Validated', `Stock received and updated for ${receipt.reference}.`);
      onClose();
    } else {
      toastError('Validation Failed', res.error);
    }
  };

  return (
    <Modal
      isOpen={!!receipt}
      onClose={onClose}
      title={`Receipt: ${receipt.reference}`}
      subtitle="Inbound inventory intake manifest"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Meta Header */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Supplier</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {receipt.supplierName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Status</span>
            <StatusBadge status={receipt.status} />
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Created Date</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(receipt.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Total Intake</span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400">
              {totalQuantity} Units
            </span>
          </div>
        </div>

        {/* Notes if any */}
        {receipt.notes && (
          <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <FileText className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{receipt.notes}</span>
          </div>
        )}

        {/* Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Manifest Line Items ({receipt.items.length})
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Item SKU & Name</th>
                  <th className="py-2.5 px-4">Destination Zone</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {LOCATION_NAMES[item.destinationLocation]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      +{item.quantity} {item.uom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {receipt.status !== 'done' && (
            <Button
              variant="success"
              size="sm"
              icon={<ArrowDownLeft className="w-4 h-4" />}
              onClick={handleComplete}
            >
              Confirm Dock Intake & Replenish Stock
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
