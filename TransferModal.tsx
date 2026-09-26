import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { LocationId, LOCATION_NAMES } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeftRight, AlertCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
}) => {
  const { products, transfers, createTransfer } = useInventory();
  const { success, error: toastError } = useToast();

  const nextRef = `TRF-2026-${String(transfers.length + 1).padStart(3, '0')}`;

  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || '');
  const [sourceLocation, setSourceLocation] = useState<LocationId>('mainWarehouse');
  const [destinationLocation, setDestinationLocation] = useState<LocationId>('productionFloor');
  const [quantity, setQuantity] = useState(5);
  const [reference, setReference] = useState(nextRef);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);
  const availableInSource = selectedProduct
    ? selectedProduct.stockByLocation[sourceLocation] || 0
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceLocation === destinationLocation) {
      setError('Source and destination locations must be different.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (quantity > availableInSource) {
      setError(
        `Insufficient stock in ${LOCATION_NAMES[sourceLocation]}. Only ${availableInSource} available.`
      );
      return;
    }

    if (!selectedProduct) {
      setError('Selected product is invalid.');
      return;
    }

    const res = createTransfer({
      reference: reference.trim().toUpperCase(),
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      sourceLocation,
      destinationLocation,
      quantity: Number(quantity),
      uom: selectedProduct.uom,
      notes: notes.trim(),
    });

    if (res.success) {
      success(
        'Transfer Completed',
        `Moved ${quantity} ${selectedProduct.uom} of ${selectedProduct.name} from ${LOCATION_NAMES[sourceLocation]} to ${LOCATION_NAMES[destinationLocation]}.`
      );
      onClose();
    } else {
      toastError('Transfer Failed', res.error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Internal Warehouse Stock Transfer"
      subtitle="Relocate stock between physical warehouse zones without altering total inventory"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Transfer Reference #"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />

        {/* Product Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Select Product
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Source and Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              From Location (Avail: {availableInSource})
            </label>
            <select
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value as LocationId)}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
            >
              <option value="mainWarehouse">{LOCATION_NAMES.mainWarehouse}</option>
              <option value="productionFloor">{LOCATION_NAMES.productionFloor}</option>
              <option value="storageRack">{LOCATION_NAMES.storageRack}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              To Location
            </label>
            <select
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value as LocationId)}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
            >
              <option value="mainWarehouse">{LOCATION_NAMES.mainWarehouse}</option>
              <option value="productionFloor">{LOCATION_NAMES.productionFloor}</option>
              <option value="storageRack">{LOCATION_NAMES.storageRack}</option>
            </select>
          </div>
        </div>

        {/* Quantity */}
        <Input
          label={`Transfer Quantity (${selectedProduct?.uom || 'Units'})`}
          type="number"
          min="1"
          max={availableInSource}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          helperText={`Current source balance: ${availableInSource} ${selectedProduct?.uom || 'Units'}`}
          required
        />

        <Input
          label="Internal Notes / Transfer Reason (Optional)"
          placeholder="e.g. Line 3 restock requisition"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Execute Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
