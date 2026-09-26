export type LocationId = 'mainWarehouse' | 'productionFloor' | 'storageRack';

export interface LocationStock {
  mainWarehouse: number;
  productionFloor: number;
  storageRack: number;
}

export const LOCATION_NAMES: Record<LocationId, string> = {
  mainWarehouse: 'Main Warehouse',
  productionFloor: 'Production Floor',
  storageRack: 'Storage Rack',
};

export type OperationStatus = 'draft' | 'ready' | 'done';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string; // Unit of Measure, e.g. 'pcs', 'boxes', 'kg', 'units'
  stockByLocation: LocationStock;
  minThreshold: number; // Low stock threshold (default 10)
  costPrice?: number;
  sellingPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  uom: string;
  destinationLocation: LocationId;
}

export interface Receipt {
  id: string;
  reference: string; // e.g. REC-2026-001
  supplierName: string;
  status: OperationStatus;
  items: ReceiptItem[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DeliveryItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  uom: string;
  sourceLocation: LocationId;
}

export interface Delivery {
  id: string;
  reference: string; // e.g. DEL-2026-001
  customerName: string;
  status: OperationStatus;
  items: DeliveryItem[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StockTransfer {
  id: string;
  reference: string; // e.g. TRF-2026-001
  sourceLocation: LocationId;
  destinationLocation: LocationId;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  uom: string;
  status: OperationStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type LedgerEntryType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: LedgerEntryType;
  referenceNumber: string; // Document reference: REC-..., DEL-..., TRF-...
  productId: string;
  productName: string;
  sku: string;
  locationDetails: string; // e.g. "Main Warehouse" or "Main Warehouse → Production Floor"
  quantityDelta: number; // positive (+) for incoming, negative (-) for outgoing, 0 for intra-location total
  resultingBalance: number; // total stock of the product after transaction
  performedBy: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Warehouse Admin' | 'Inventory Manager' | 'Logistics Operator';
  avatar?: string;
}
