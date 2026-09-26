import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Receipt,
  Delivery,
  StockTransfer,
  LedgerEntry,
  LocationId,
  LOCATION_NAMES,
  OperationStatus,
} from '../types/inventory';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

export interface InventoryKPIs {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  totalUnits: number;
  totalValuation: number;
}

interface InventoryContextValue {
  products: Product[];
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: StockTransfer[];
  ledger: LedgerEntry[];
  kpis: InventoryKPIs;
  
  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductTotalStock: (product: Product) => number;

  // Receipt Actions
  createReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>) => { success: boolean; id: string; error?: string };
  markReceiptAsDone: (id: string) => { success: boolean; error?: string };
  cancelReceipt: (id: string) => void;

  // Delivery Actions
  createDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => { success: boolean; id: string; error?: string };
  markDeliveryAsDone: (id: string) => { success: boolean; error?: string };
  cancelDelivery: (id: string) => void;
  checkStockAvailability: (items: { productId: string; quantity: number; sourceLocation: LocationId }[]) => {
    available: boolean;
    issues: string[];
  };

  // Transfer Actions
  createTransfer: (transfer: Omit<StockTransfer, 'id' | 'createdAt' | 'status'>) => { success: boolean; error?: string };

  // System
  resetToSampleData: () => void;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const operatorName = user ? user.name : 'System Admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  // Initialize and load from storage
  useEffect(() => {
    StorageService.init();
    setProducts(StorageService.getProducts());
    setReceipts(StorageService.getReceipts());
    setDeliveries(StorageService.getDeliveries());
    setTransfers(StorageService.getTransfers());
    setLedger(StorageService.getLedger());
  }, []);

  const getProductTotalStock = useCallback((product: Product): number => {
    if (!product || !product.stockByLocation) return 0;
    return (
      (product.stockByLocation.mainWarehouse || 0) +
      (product.stockByLocation.productionFloor || 0) +
      (product.stockByLocation.storageRack || 0)
    );
  }, []);

  // Compute live KPIs
  const kpis = useMemo<InventoryKPIs>(() => {
    let lowStock = 0;
    let outOfStock = 0;
    let totalUnits = 0;
    let totalValuation = 0;

    products.forEach((p) => {
      const stock = getProductTotalStock(p);
      totalUnits += stock;
      totalValuation += stock * (p.costPrice || 0);

      if (stock === 0) {
        outOfStock++;
        lowStock++;
      } else if (stock <= p.minThreshold) {
        lowStock++;
      }
    });

    const pendingReceipts = receipts.filter((r) => r.status !== 'done').length;
    const pendingDeliveries = deliveries.filter((d) => d.status !== 'done').length;

    return {
      totalProducts: products.length,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      pendingReceipts,
      pendingDeliveries,
      totalUnits,
      totalValuation,
    };
  }, [products, receipts, deliveries, getProductTotalStock]);

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingSku = products.find(
      (p) => p.sku.trim().toLowerCase() === productData.sku.trim().toLowerCase()
    );
    if (existingSku) {
      return { success: false, error: `SKU "${productData.sku}" is already in use by "${existingSku.name}".` };
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    StorageService.saveProducts(updated);

    // If initial stock was provided, log adjustment into ledger
    const totalStock = getProductTotalStock(newProduct);
    if (totalStock > 0) {
      const newLedgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        timestamp: now,
        type: 'ADJUSTMENT',
        referenceNumber: 'INIT-STOCK',
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        locationDetails: 'Initial Setup Across Locations',
        quantityDelta: totalStock,
        resultingBalance: totalStock,
        performedBy: operatorName,
        notes: 'Initial inventory creation',
      };
      const updatedLedger = [newLedgerEntry, ...ledger];
      setLedger(updatedLedger);
      StorageService.saveLedger(updatedLedger);
    }

    return { success: true };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const existingIndex = products.findIndex((p) => p.id === id);
    if (existingIndex === -1) {
      return { success: false, error: 'Product not found.' };
    }

    if (updates.sku) {
      const duplicateSku = products.find(
        (p) => p.id !== id && p.sku.trim().toLowerCase() === updates.sku!.trim().toLowerCase()
      );
      if (duplicateSku) {
        return { success: false, error: `SKU "${updates.sku}" is already in use.` };
      }
    }

    const current = products[existingIndex];
    const updatedProduct: Product = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updated = [...products];
    updated[existingIndex] = updatedProduct;
    setProducts(updated);
    StorageService.saveProducts(updated);

    return { success: true };
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    StorageService.saveProducts(updated);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Receipt Actions
  const createReceipt = (receiptData: Omit<Receipt, 'id' | 'createdAt'>) => {
    const id = `rec-${Date.now()}`;
    const now = new Date().toISOString();
    const newReceipt: Receipt = {
      ...receiptData,
      id,
      createdAt: now,
    };

    if (receiptData.status === 'done') {
      newReceipt.completedAt = now;
      // Process receipt stock directly
      processReceiptIntake(newReceipt);
    } else {
      const updatedReceipts = [newReceipt, ...receipts];
      setReceipts(updatedReceipts);
      StorageService.saveReceipts(updatedReceipts);
    }

    return { success: true, id };
  };

  const processReceiptIntake = (receipt: Receipt) => {
    const now = new Date().toISOString();
    const productsMap = new Map(products.map((p) => [p.id, { ...p }]));
    const newLedgerEntries: LedgerEntry[] = [];

    for (const item of receipt.items) {
      const prod = productsMap.get(item.productId);
      if (prod) {
        const dest = item.destinationLocation;
        prod.stockByLocation = {
          ...prod.stockByLocation,
          [dest]: (prod.stockByLocation[dest] || 0) + item.quantity,
        };
        prod.updatedAt = now;

        const newBalance = (prod.stockByLocation.mainWarehouse || 0) +
          (prod.stockByLocation.productionFloor || 0) +
          (prod.stockByLocation.storageRack || 0);

        newLedgerEntries.push({
          id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          type: 'RECEIPT',
          referenceNumber: receipt.reference,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          locationDetails: `Received to ${LOCATION_NAMES[dest]}`,
          quantityDelta: item.quantity,
          resultingBalance: newBalance,
          performedBy: operatorName,
          notes: `Supplier: ${receipt.supplierName}${receipt.notes ? ` - ${receipt.notes}` : ''}`,
        });
      }
    }

    const updatedProducts = Array.from(productsMap.values());
    const updatedReceipts = [
      { ...receipt, status: 'done' as OperationStatus, completedAt: now },
      ...receipts.filter((r) => r.id !== receipt.id),
    ];
    const updatedLedger = [...newLedgerEntries, ...ledger];

    setProducts(updatedProducts);
    setReceipts(updatedReceipts);
    setLedger(updatedLedger);

    StorageService.saveProducts(updatedProducts);
    StorageService.saveReceipts(updatedReceipts);
    StorageService.saveLedger(updatedLedger);
  };

  const markReceiptAsDone = (id: string) => {
    const target = receipts.find((r) => r.id === id);
    if (!target) return { success: false, error: 'Receipt not found.' };
    if (target.status === 'done') return { success: false, error: 'Receipt is already completed.' };

    processReceiptIntake(target);
    return { success: true };
  };

  const cancelReceipt = (id: string) => {
    const updated = receipts.filter((r) => r.id !== id);
    setReceipts(updated);
    StorageService.saveReceipts(updated);
  };

  // Stock Availability Checker
  const checkStockAvailability = (
    items: { productId: string; quantity: number; sourceLocation: LocationId }[]
  ) => {
    const issues: string[] = [];

    items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        issues.push(`Product ID ${item.productId} was not found.`);
        return;
      }
      const available = prod.stockByLocation[item.sourceLocation] || 0;
      if (item.quantity > available) {
        issues.push(
          `Insufficient stock for "${prod.name}" in ${LOCATION_NAMES[item.sourceLocation]}. Requested: ${item.quantity} ${prod.uom}, Available: ${available} ${prod.uom}.`
        );
      }
    });

    return {
      available: issues.length === 0,
      issues,
    };
  };

  // Delivery Actions
  const processDeliveryOutbound = (delivery: Delivery): { success: boolean; error?: string } => {
    const availability = checkStockAvailability(delivery.items);
    if (!availability.available) {
      return { success: false, error: availability.issues.join(' | ') };
    }

    const now = new Date().toISOString();
    const productsMap = new Map(products.map((p) => [p.id, { ...p }]));
    const newLedgerEntries: LedgerEntry[] = [];

    for (const item of delivery.items) {
      const prod = productsMap.get(item.productId);
      if (prod) {
        const src = item.sourceLocation;
        prod.stockByLocation = {
          ...prod.stockByLocation,
          [src]: Math.max(0, (prod.stockByLocation[src] || 0) - item.quantity),
        };
        prod.updatedAt = now;

        const newBalance = (prod.stockByLocation.mainWarehouse || 0) +
          (prod.stockByLocation.productionFloor || 0) +
          (prod.stockByLocation.storageRack || 0);

        newLedgerEntries.push({
          id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          type: 'DELIVERY',
          referenceNumber: delivery.reference,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          locationDetails: `Dispatched from ${LOCATION_NAMES[src]}`,
          quantityDelta: -item.quantity,
          resultingBalance: newBalance,
          performedBy: operatorName,
          notes: `Customer: ${delivery.customerName}${delivery.notes ? ` - ${delivery.notes}` : ''}`,
        });
      }
    }

    const updatedProducts = Array.from(productsMap.values());
    const updatedDeliveries = [
      { ...delivery, status: 'done' as OperationStatus, completedAt: now },
      ...deliveries.filter((d) => d.id !== delivery.id),
    ];
    const updatedLedger = [...newLedgerEntries, ...ledger];

    setProducts(updatedProducts);
    setDeliveries(updatedDeliveries);
    setLedger(updatedLedger);

    StorageService.saveProducts(updatedProducts);
    StorageService.saveDeliveries(updatedDeliveries);
    StorageService.saveLedger(updatedLedger);

    return { success: true };
  };

  const createDelivery = (deliveryData: Omit<Delivery, 'id' | 'createdAt'>) => {
    const id = `del-${Date.now()}`;
    const now = new Date().toISOString();
    const newDelivery: Delivery = {
      ...deliveryData,
      id,
      createdAt: now,
    };

    if (deliveryData.status === 'done') {
      const res = processDeliveryOutbound(newDelivery);
      if (!res.success) return { success: false, id, error: res.error };
    } else {
      const updatedDeliveries = [newDelivery, ...deliveries];
      setDeliveries(updatedDeliveries);
      StorageService.saveDeliveries(updatedDeliveries);
    }

    return { success: true, id };
  };

  const markDeliveryAsDone = (id: string) => {
    const target = deliveries.find((d) => d.id === id);
    if (!target) return { success: false, error: 'Delivery order not found.' };
    if (target.status === 'done') return { success: false, error: 'Delivery is already completed.' };

    return processDeliveryOutbound(target);
  };

  const cancelDelivery = (id: string) => {
    const updated = deliveries.filter((d) => d.id !== id);
    setDeliveries(updated);
    StorageService.saveDeliveries(updated);
  };

  // Internal Transfer Action
  const createTransfer = (transferData: Omit<StockTransfer, 'id' | 'createdAt' | 'status'>) => {
    const prod = products.find((p) => p.id === transferData.productId);
    if (!prod) return { success: false, error: 'Product not found.' };

    const srcAvailable = prod.stockByLocation[transferData.sourceLocation] || 0;
    if (transferData.quantity > srcAvailable) {
      return {
        success: false,
        error: `Insufficient stock in ${LOCATION_NAMES[transferData.sourceLocation]}. Available: ${srcAvailable} ${prod.uom}, Requested: ${transferData.quantity} ${prod.uom}.`,
      };
    }

    const now = new Date().toISOString();
    const newTransfer: StockTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      status: 'done',
      createdAt: now,
      completedAt: now,
    };

    const updatedProd: Product = {
      ...prod,
      stockByLocation: {
        ...prod.stockByLocation,
        [transferData.sourceLocation]: srcAvailable - transferData.quantity,
        [transferData.destinationLocation]:
          (prod.stockByLocation[transferData.destinationLocation] || 0) + transferData.quantity,
      },
      updatedAt: now,
    };

    const updatedProducts = products.map((p) => (p.id === prod.id ? updatedProd : p));
    const totalBalance = getProductTotalStock(updatedProd);

    const newLedgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      timestamp: now,
      type: 'TRANSFER',
      referenceNumber: transferData.reference,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      locationDetails: `${LOCATION_NAMES[transferData.sourceLocation]} → ${LOCATION_NAMES[transferData.destinationLocation]}`,
      quantityDelta: 0,
      resultingBalance: totalBalance,
      performedBy: operatorName,
      notes: `Transfer of ${transferData.quantity} ${prod.uom}${transferData.notes ? ` - ${transferData.notes}` : ''}`,
    };

    const updatedTransfers = [newTransfer, ...transfers];
    const updatedLedger = [newLedgerEntry, ...ledger];

    setProducts(updatedProducts);
    setTransfers(updatedTransfers);
    setLedger(updatedLedger);

    StorageService.saveProducts(updatedProducts);
    StorageService.saveTransfers(updatedTransfers);
    StorageService.saveLedger(updatedLedger);

    return { success: true };
  };

  // Reset to sample data
  const resetToSampleData = () => {
    StorageService.resetAll();
    setProducts(StorageService.getProducts());
    setReceipts(StorageService.getReceipts());
    setDeliveries(StorageService.getDeliveries());
    setTransfers(StorageService.getTransfers());
    setLedger(StorageService.getLedger());
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        receipts,
        deliveries,
        transfers,
        ledger,
        kpis,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductTotalStock,
        createReceipt,
        markReceiptAsDone,
        cancelReceipt,
        createDelivery,
        markDeliveryAsDone,
        cancelDelivery,
        checkStockAvailability,
        createTransfer,
        resetToSampleData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextValue => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
