import { Product, Receipt, Delivery, StockTransfer, LedgerEntry, User } from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_LEDGER,
  INITIAL_USER,
} from '../data/seedData';

const KEYS = {
  PRODUCTS: 'stocksense_products',
  RECEIPTS: 'stocksense_receipts',
  DELIVERIES: 'stocksense_deliveries',
  TRANSFERS: 'stocksense_transfers',
  LEDGER: 'stocksense_ledger',
  AUTH_USER: 'stocksense_auth_user',
  AUTH_TOKEN: 'stocksense_auth_token',
  THEME: 'stocksense_theme',
};

// Safe JSON parser helper
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  // Initialization: seeds sample data if storage is empty
  init(): void {
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      safeSet(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(KEYS.RECEIPTS)) {
      safeSet(KEYS.RECEIPTS, INITIAL_RECEIPTS);
    }
    if (!localStorage.getItem(KEYS.DELIVERIES)) {
      safeSet(KEYS.DELIVERIES, INITIAL_DELIVERIES);
    }
    if (!localStorage.getItem(KEYS.TRANSFERS)) {
      safeSet(KEYS.TRANSFERS, []);
    }
    if (!localStorage.getItem(KEYS.LEDGER)) {
      safeSet(KEYS.LEDGER, INITIAL_LEDGER);
    }
    if (!localStorage.getItem(KEYS.AUTH_USER)) {
      safeSet(KEYS.AUTH_USER, INITIAL_USER);
      safeSet(KEYS.AUTH_TOKEN, 'stocksense_jwt_token_sample_abc123');
    }
  },

  // Products
  getProducts(): Product[] {
    return safeGet<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    safeSet(KEYS.PRODUCTS, products);
  },

  // Receipts
  getReceipts(): Receipt[] {
    return safeGet<Receipt[]>(KEYS.RECEIPTS, INITIAL_RECEIPTS);
  },
  saveReceipts(receipts: Receipt[]): void {
    safeSet(KEYS.RECEIPTS, receipts);
  },

  // Deliveries
  getDeliveries(): Delivery[] {
    return safeGet<Delivery[]>(KEYS.DELIVERIES, INITIAL_DELIVERIES);
  },
  saveDeliveries(deliveries: Delivery[]): void {
    safeSet(KEYS.DELIVERIES, deliveries);
  },

  // Transfers
  getTransfers(): StockTransfer[] {
    return safeGet<StockTransfer[]>(KEYS.TRANSFERS, []);
  },
  saveTransfers(transfers: StockTransfer[]): void {
    safeSet(KEYS.TRANSFERS, transfers);
  },

  // Ledger
  getLedger(): LedgerEntry[] {
    return safeGet<LedgerEntry[]>(KEYS.LEDGER, INITIAL_LEDGER);
  },
  saveLedger(ledger: LedgerEntry[]): void {
    safeSet(KEYS.LEDGER, ledger);
  },

  // Auth User & Token
  getAuth(): { user: User | null; token: string | null } {
    return {
      user: safeGet<User | null>(KEYS.AUTH_USER, null),
      token: localStorage.getItem(KEYS.AUTH_TOKEN) || null,
    };
  },
  setAuth(user: User, token: string): void {
    safeSet(KEYS.AUTH_USER, user);
    localStorage.setItem(KEYS.AUTH_TOKEN, token);
  },
  clearAuth(): void {
    localStorage.removeItem(KEYS.AUTH_USER);
    localStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  // Theme
  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light';
  },
  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(KEYS.THEME, theme);
  },

  // Hard Reset to fresh sample data
  resetAll(): void {
    safeSet(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    safeSet(KEYS.RECEIPTS, INITIAL_RECEIPTS);
    safeSet(KEYS.DELIVERIES, INITIAL_DELIVERIES);
    safeSet(KEYS.TRANSFERS, []);
    safeSet(KEYS.LEDGER, INITIAL_LEDGER);
    safeSet(KEYS.AUTH_USER, INITIAL_USER);
    safeSet(KEYS.AUTH_TOKEN, 'stocksense_jwt_token_sample_abc123');
  },
};
