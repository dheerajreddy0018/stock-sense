import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './config';
import {
  UserProfile,
  Product,
  Category,
  Warehouse,
  Location,
  StockLevel,
  Receipt,
  Delivery,
  Transfer,
  Adjustment,
  StockLedgerEntry,
  Alert,
  AuditLog,
} from '../types';

export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  WAREHOUSES: 'warehouses',
  LOCATIONS: 'locations',
  STOCK: 'stock',
  RECEIPTS: 'receipts',
  DELIVERIES: 'deliveries',
  TRANSFERS: 'transfers',
  ADJUSTMENTS: 'adjustments',
  STOCK_LEDGER: 'stockLedger',
  ALERTS: 'alerts',
  AUDIT_LOGS: 'auditLogs',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// Helper to get typed Firestore collection reference
export function getTypedCollection<T = DocumentData>(
  collectionName: CollectionName
): CollectionReference<T> | null {
  if (!db) return null;
  return collection(db, collectionName) as CollectionReference<T>;
}

// Pre-defined typed collection accessors for all 13 collections
export const collections = {
  users: () => getTypedCollection<UserProfile>(COLLECTIONS.USERS),
  products: () => getTypedCollection<Product>(COLLECTIONS.PRODUCTS),
  categories: () => getTypedCollection<Category>(COLLECTIONS.CATEGORIES),
  warehouses: () => getTypedCollection<Warehouse>(COLLECTIONS.WAREHOUSES),
  locations: () => getTypedCollection<Location>(COLLECTIONS.LOCATIONS),
  stock: () => getTypedCollection<StockLevel>(COLLECTIONS.STOCK),
  receipts: () => getTypedCollection<Receipt>(COLLECTIONS.RECEIPTS),
  deliveries: () => getTypedCollection<Delivery>(COLLECTIONS.DELIVERIES),
  transfers: () => getTypedCollection<Transfer>(COLLECTIONS.TRANSFERS),
  adjustments: () => getTypedCollection<Adjustment>(COLLECTIONS.ADJUSTMENTS),
  stockLedger: () => getTypedCollection<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER),
  alerts: () => getTypedCollection<Alert>(COLLECTIONS.ALERTS),
  auditLogs: () => getTypedCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS),
};
