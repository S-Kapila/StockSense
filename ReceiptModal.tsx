import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { LocationId, LOCATION_NAMES, ReceiptItem, OperationStatus } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, ArrowDownLeft } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose }) => {
  const { products, receipts, createReceipt } = useInventory();
  const { success, error: toastError } = useToast();

  const nextRefNumber = `REC-2026-${String(receipts.length + 1).padStart(3, '0')}`;

  const [supplierName, setSupplierName] = useState('');
  const [reference, setReference] = useState(nextRefNumber);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OperationStatus>('ready');

  // Item lines state
  const [items, setItems] = useState<
    Array<{
      productId: string;
      quantity: number;
      destinationLocation: LocationId;
    }>
  >([
    {
      productId: products[0]?.id || '',
      quantity: 10,
      destinationLocation: 'mainWarehouse',
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddItemLine = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 10,
        destinationLocation: 'mainWarehouse',
      },
    ]);
  };

  const handleRemoveItemLine = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'productId' | 'quantity' | 'destinationLocation',
    val: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!supplierName.trim()) errs.supplierName = 'Supplier name is required';
    if (!reference.trim()) errs.reference = 'Reference number is required';
    if (items.length === 0) errs.items = 'At least one item is required';

    items.forEach((item, idx) => {
      if (!item.productId) errs[`item_${idx}_prod`] = 'Please select a product';
      if (item.quantity <= 0) errs[`item_${idx}_qty`] = 'Quantity must be > 0';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build receipt items with product snapshots
    const receiptItems: ReceiptItem[] = items.map((line) => {
      const prod = products.find((p) => p.id === line.productId)!;
      return {
        productId: line.productId,
        sku: prod.sku,
        name: prod.name,
        quantity: Number(line.quantity),
        uom: prod.uom,
        destinationLocation: line.destinationLocation,
      };
    });

    const res = createReceipt({
      reference: reference.trim().toUpperCase(),
      supplierName: supplierName.trim(),
      status,
      items: receiptItems,
      notes: notes.trim(),
    });

    if (res.success) {
      if (status === 'done') {
        success(
          'Receipt Completed',
          `Inventory for ${receiptItems.length} products was received and added to locations.`
        );
      } else {
        success('Receipt Created', `Receipt ${reference} saved with status "Ready".`);
      }
      onClose();
      // Reset
      setSupplierName('');
      setNotes('');
      setStatus('ready');
      setItems([
        {
          productId: products[0]?.id || '',
          quantity: 10,
          destinationLocation: 'mainWarehouse',
        },
      ]);
    } else {
      toastError('Failed to create receipt', res.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Inbound Receipt"
      subtitle="Record incoming goods from suppliers and auto-replenish stock locations"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receipt Header details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Supplier Name"
            placeholder="e.g. Apex Dynamics Corp."
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            error={errors.supplierName}
            required
          />

          <Input
            label="Reference / PO Number"
            placeholder="e.g. REC-2026-004"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            error={errors.reference}
            required
          />
        </div>

        {/* Dynamic Item Lines */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Incoming Line Items
            </label>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleAddItemLine}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((line, index) => {
              const selectedProduct = products.find((p) => p.id === line.productId);
              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3"
                >
                  {/* Product Select */}
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Product SKU & Name
                    </label>
                    <select
                      value={line.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2 text-slate-900 dark:text-slate-100"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-full sm:w-28">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Qty ({selectedProduct?.uom || 'Units'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', Math.max(1, Number(e.target.value)))
                      }
                      className="w-full text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Destination Location */}
                  <div className="w-full sm:w-44">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Destination Zone
                    </label>
                    <select
                      value={line.destinationLocation}
                      onChange={(e) =>
                        handleItemChange(index, 'destinationLocation', e.target.value)
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2 text-slate-900 dark:text-slate-100"
                    >
                      <option value="mainWarehouse">{LOCATION_NAMES.mainWarehouse}</option>
                      <option value="productionFloor">{LOCATION_NAMES.productionFloor}</option>
                      <option value="storageRack">{LOCATION_NAMES.storageRack}</option>
                    </select>
                  </div>

                  {/* Delete Item Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItemLine(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed self-end sm:self-center mt-2 sm:mt-4"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Selection & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Select
            label="Initial Receipt Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OperationStatus)}
            options={[
              { value: 'ready', label: 'Ready (Pending dock intake)' },
              { value: 'done', label: 'Done (Immediately update stock)' },
              { value: 'draft', label: 'Draft (In preparation)' },
            ]}
            helperText={
              status === 'done'
                ? 'Stock levels will immediately increase upon saving.'
                : 'Stock will only increase when receipt is validated.'
            }
          />

          <Input
            label="Shipment Notes (Optional)"
            placeholder="e.g. Carrier tracking number, dock inspection pass"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<ArrowDownLeft className="w-4 h-4" />}
          >
            {status === 'done' ? 'Receive & Update Stock' : 'Create Receipt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
