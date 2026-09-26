import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowLeftRight,
  TrendingDown,
  Warehouse,
  CheckCircle2,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product, LOCATION_NAMES } from '../../types/inventory';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProductModal } from './ProductModal';
import { useToast } from '../../context/ToastContext';

interface ProductsViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  onOpenTransferForProduct?: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
  onOpenTransferForProduct,
}) => {
  const { products, deleteProduct, getProductTotalStock } = useInventory();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const totalStock = getProductTotalStock(p);

      // Search match by Name or SKU
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      // Category match
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      // Stock status filter
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = totalStock <= p.minThreshold && totalStock > 0;
      } else if (stockFilter === 'out') {
        matchesStock = totalStock === 0;
      } else if (stockFilter === 'in') {
        matchesStock = totalStock > p.minThreshold;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter, getProductTotalStock]);

  const handleDelete = (prod: Product) => {
    if (confirm(`Are you sure you want to remove "${prod.name}" (${prod.sku}) from catalog?`)) {
      deleteProduct(prod.id);
      success('Product Removed', `Product ${prod.sku} was deleted from catalog.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar & Filters */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Filter controls & Add button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in">Normal Stock</option>
            <option value="low">Low Stock Alerts (≤ Min)</option>
            <option value="out">Out of Stock (0)</option>
          </select>

          {/* Create Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Boxes className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No products found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search criteria or add a new product.
              </p>
              <Button
                variant="outline"
                size="xs"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStockFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Product & SKU</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Total Stock</th>
                  <th className="py-3.5 px-6">Stock by Location</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredProducts.map((prod) => {
                  const total = getProductTotalStock(prod);
                  const isLow = total <= prod.minThreshold && total > 0;
                  const isOut = total === 0;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {prod.sku}
                          </span>
                          <span className="text-xs text-slate-400">Unit: {prod.uom}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {prod.category}
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="py-4 px-6">
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">
                          {total}{' '}
                          <span className="text-xs font-normal text-slate-500">{prod.uom}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Min safety: {prod.minThreshold} {prod.uom}
                        </div>
                      </td>

                      {/* Stock by Location Pills */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 min-w-[220px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-brand-500" />
                              {LOCATION_NAMES.mainWarehouse}
                            </span>
                            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                              {prod.stockByLocation.mainWarehouse}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {LOCATION_NAMES.productionFloor}
                            </span>
                            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                              {prod.stockByLocation.productionFloor}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              {LOCATION_NAMES.storageRack}
                            </span>
                            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                              {prod.stockByLocation.storageRack}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Warning Badge */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <Badge variant="danger" dot>
                            Out of Stock
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" dot>
                            Low Stock Alert
                          </Badge>
                        ) : (
                          <Badge variant="success" dot>
                            Healthy Stock
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Displaying {filteredProducts.length} of {products.length} catalog items
          </span>
          <span className="font-mono">Real-time Multi-Location Tracking</span>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        productToEdit={editingProduct}
      />
    </div>
  );
};
