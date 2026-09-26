import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { LocationId, LOCATION_NAMES, DeliveryItem, OperationStatus } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({ isOpen, onClose }) => {
  const { products, deliveries, createDelivery, checkStockAvailability } = useInventory();
  const { success, error: toastError } = useToast();

  const nextRefNumber = `DEL-2026-${String(deliveries.length + 1).padStart(3, '0')}`;

  const [customerName, setCustomerName] = useState('');
  const [reference, setReference] = useState(nextRefNumber);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OperationStatus>('ready');

  // Item lines state
  const [items, setItems] = useState<
    Array<{
      productId: string;
      quantity: number;
      sourceLocation: LocationId;
    }>
  >([
    {
      productId: products[0]?.id || '',
      quantity: 5,
      sourceLocation: 'mainWarehouse',
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddItemLine = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 5,
        sourceLocation: 'mainWarehouse',
      },
    ]);
  };

  const handleRemoveItemLine = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'productId' | 'quantity' | 'sourceLocation',
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
    if (!customerName.trim()) errs.customerName = 'Customer name is required';
    if (!reference.trim()) errs.reference = 'Reference number is required';
    if (items.length === 0) errs.items = 'At least one item is required';

    items.forEach((item, idx) => {
      if (!item.productId) errs[`item_${idx}_prod`] = 'Please select a product';
      if (item.quantity <= 0) errs[`item_${idx}_qty`] = 'Quantity must be > 0';

      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const available = prod.stockByLocation[item.sourceLocation] || 0;
        if (item.quantity > available) {
          errs[`item_${idx}_stock`] = `Insufficient: only ${available} ${prod.uom} available in ${LOCATION_NAMES[item.sourceLocation]}`;
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Check availability
    const check = checkStockAvailability(items);
    if (!check.available && status === 'done') {
      toastError('Cannot complete delivery', check.issues[0]);
      return;
    }

    const deliveryItems: DeliveryItem[] = items.map((line) => {
      const prod = products.find((p) => p.id === line.productId)!;
      return {
        productId: line.productId,
        sku: prod.sku,
        name: prod.name,
        quantity: Number(line.quantity),
        uom: prod.uom,
        sourceLocation: line.sourceLocation,
      };
    });

    const res = createDelivery({
      reference: reference.trim().toUpperCase(),
      customerName: customerName.trim(),
      status,
      items: deliveryItems,
      notes: notes.trim(),
    });

    if (res.success) {
      if (status === 'done') {
        success(
          'Delivery Dispatched',
          `Inventory for ${deliveryItems.length} products was deducted from warehouse locations.`
        );
      } else {
        success('Delivery Order Created', `Order ${reference} staged with status "Ready".`);
      }
      onClose();
      // Reset
      setCustomerName('');
      setNotes('');
      setStatus('ready');
      setItems([
        {
          productId: products[0]?.id || '',
          quantity: 5,
          sourceLocation: 'mainWarehouse',
        },
      ]);
    } else {
      toastError('Failed to create delivery', res.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Outbound Delivery Order"
      subtitle="Dispatch goods to customers with automatic real-time stock deductions"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Customer / Client Name"
            placeholder="e.g. Tesla Gigafactory Texas"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            error={errors.customerName}
            required
          />

          <Input
            label="Delivery Order # / Ref"
            placeholder="e.g. DEL-2026-003"
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
              Outgoing Line Items
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
              const availableInLocation = selectedProduct
                ? selectedProduct.stockByLocation[line.sourceLocation] || 0
                : 0;
              const hasInsufficientStock = line.quantity > availableInLocation;

              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border transition-colors ${
                    hasInsufficientStock
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800'
                  } flex flex-col sm:flex-row items-center gap-3`}
                >
                  {/* Product */}
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

                  {/* Source Location */}
                  <div className="w-full sm:w-44">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pick Location (Avail: {availableInLocation})
                    </label>
                    <select
                      value={line.sourceLocation}
                      onChange={(e) => handleItemChange(index, 'sourceLocation', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2 text-slate-900 dark:text-slate-100"
                    >
                      <option value="mainWarehouse">{LOCATION_NAMES.mainWarehouse}</option>
                      <option value="productionFloor">{LOCATION_NAMES.productionFloor}</option>
                      <option value="storageRack">{LOCATION_NAMES.storageRack}</option>
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
                      className={`w-full text-xs font-semibold rounded-lg border py-1.5 px-2 ${
                        hasInsufficientStock
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                      }`}
                    />
                  </div>

                  {/* Remove Button */}
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

          {Object.keys(errors).some((k) => k.startsWith('item_') && k.endsWith('_stock')) && (
            <div className="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>One or more items exceed current stock in the chosen location zone.</span>
            </div>
          )}
        </div>

        {/* Status Selection & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Select
            label="Initial Delivery Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OperationStatus)}
            options={[
              { value: 'ready', label: 'Ready (Staged at outbound bay)' },
              { value: 'done', label: 'Done (Dispatch & Deduct Stock Now)' },
              { value: 'draft', label: 'Draft (Picking in progress)' },
            ]}
            helperText={
              status === 'done'
                ? 'Stock levels will immediately deduct upon submission.'
                : 'Stock will only be deducted when order is marked Done.'
            }
          />

          <Input
            label="Dispatch Instructions (Optional)"
            placeholder="e.g. Carrier express freight, gate 3 loading"
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
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            {status === 'done' ? 'Dispatch & Deduct Stock' : 'Create Delivery Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
