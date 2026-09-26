import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Product, LocationStock } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES = [
  'Machinery',
  'Hardware',
  'Chemicals',
  'Packaging',
  'Electronics',
  'Raw Materials',
  'Consumables',
  'Other',
];

const UOM_OPTIONS = [
  'Units',
  'Pcs',
  'Boxes',
  'Tubes',
  'Bundles',
  'Kg',
  'Liters',
  'Rolls',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct } = useInventory();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [uom, setUom] = useState(UOM_OPTIONS[0]);
  const [minThreshold, setMinThreshold] = useState(10);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stockByLocation, setStockByLocation] = useState<LocationStock>({
    mainWarehouse: 0,
    productionFloor: 0,
    storageRack: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setUom(productToEdit.uom);
      setMinThreshold(productToEdit.minThreshold);
      setCostPrice(productToEdit.costPrice || 0);
      setSellingPrice(productToEdit.sellingPrice || 0);
      setStockByLocation(productToEdit.stockByLocation);
    } else {
      setName('');
      setSku('');
      setCategory(CATEGORIES[0]);
      setUom(UOM_OPTIONS[0]);
      setMinThreshold(10);
      setCostPrice(0);
      setSellingPrice(0);
      setStockByLocation({
        mainWarehouse: 0,
        productionFloor: 0,
        storageRack: 0,
      });
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU is required';
    if (minThreshold < 0) errs.minThreshold = 'Minimum threshold cannot be negative';
    if (costPrice < 0) errs.costPrice = 'Cost price cannot be negative';
    if (sellingPrice < 0) errs.sellingPrice = 'Selling price cannot be negative';
    if (stockByLocation.mainWarehouse < 0) errs.mainWarehouse = 'Must be >= 0';
    if (stockByLocation.productionFloor < 0) errs.productionFloor = 'Must be >= 0';
    if (stockByLocation.storageRack < 0) errs.storageRack = 'Must be >= 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    if (productToEdit) {
      const res = updateProduct(productToEdit.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        uom,
        minThreshold: Number(minThreshold),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockByLocation,
      });

      if (res.success) {
        success('Product Updated', `Successfully updated "${name}" (${sku.toUpperCase()})`);
        onClose();
      } else {
        toastError('Failed to update product', res.error);
      }
    } else {
      const res = addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        uom,
        minThreshold: Number(minThreshold),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockByLocation,
      });

      if (res.success) {
        success('Product Created', `Added "${name}" with SKU: ${sku.toUpperCase()}`);
        onClose();
      } else {
        toastError('Failed to create product', res.error);
      }
    }

    setSubmitting(false);
  };

  const totalCalculated =
    Number(stockByLocation.mainWarehouse || 0) +
    Number(stockByLocation.productionFloor || 0) +
    Number(stockByLocation.storageRack || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product Catalog Item' : 'Create New Product'}
      subtitle="Define product specifications, units of measure, and stock by physical location"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            placeholder="e.g. Industrial Servo Motor X-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            placeholder="e.g. MTR-X200"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            error={errors.sku}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          />

          <Select
            label="Unit of Measure (UOM)"
            value={uom}
            onChange={(e) => setUom(e.target.value)}
            options={UOM_OPTIONS.map((u) => ({ value: u, label: u }))}
          />

          <Input
            label="Low Stock Threshold"
            type="number"
            min="0"
            value={minThreshold}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            error={errors.minThreshold}
            helperText="Triggers warning when total <= this"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cost Price ($)"
            type="number"
            step="0.01"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
            error={errors.costPrice}
          />

          <Input
            label="Selling Price ($)"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            error={errors.sellingPrice}
          />
        </div>

        {/* Location Stock Breakdown Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Stock by Location Allocation
              </h4>
              <p className="text-[11px] text-slate-500">
                Allocate initial inventory quantities across the 3 physical zones
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold">
              Total: {totalCalculated} {uom}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Main Warehouse"
              type="number"
              min="0"
              value={stockByLocation.mainWarehouse}
              onChange={(e) =>
                setStockByLocation({
                  ...stockByLocation,
                  mainWarehouse: Math.max(0, Number(e.target.value)),
                })
              }
              error={errors.mainWarehouse}
            />

            <Input
              label="Production Floor"
              type="number"
              min="0"
              value={stockByLocation.productionFloor}
              onChange={(e) =>
                setStockByLocation({
                  ...stockByLocation,
                  productionFloor: Math.max(0, Number(e.target.value)),
                })
              }
              error={errors.productionFloor}
            />

            <Input
              label="Storage Rack"
              type="number"
              min="0"
              value={stockByLocation.storageRack}
              onChange={(e) =>
                setStockByLocation({
                  ...stockByLocation,
                  storageRack: Math.max(0, Number(e.target.value)),
                })
              }
              error={errors.storageRack}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {productToEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
