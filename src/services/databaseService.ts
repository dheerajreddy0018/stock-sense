import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  WhereFilterOp,
  DocumentData,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS, CollectionName, getTypedCollection } from '../firebase/collections';
import {
  SEED_USERS,
  SEED_WAREHOUSES,
  SEED_LOCATIONS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_STOCK_LEVELS,
  SEED_STOCK_LEDGER,
  SEED_RECEIPTS,
  SEED_DELIVERIES,
  SEED_TRANSFERS,
  SEED_ADJUSTMENTS,
  SEED_ALERTS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';

// In-Memory / LocalStorage reactive store when Firebase is not connected or in Demo mode
class LocalDataStore {
  private store: Record<string, Record<string, DocumentData>> = {};
  private listeners: Record<string, Set<(items: DocumentData[]) => void>> = {};

  constructor() {
    this.initializeFromSeed();
  }

  public initializeFromSeed() {
    this.store = {
      [COLLECTIONS.USERS]: Object.fromEntries(SEED_USERS.map((u) => [u.id, u])),
      [COLLECTIONS.WAREHOUSES]: Object.fromEntries(SEED_WAREHOUSES.map((w) => [w.id, w])),
      [COLLECTIONS.LOCATIONS]: Object.fromEntries(SEED_LOCATIONS.map((l) => [l.id, l])),
      [COLLECTIONS.CATEGORIES]: Object.fromEntries(SEED_CATEGORIES.map((c) => [c.id, c])),
      [COLLECTIONS.PRODUCTS]: Object.fromEntries(SEED_PRODUCTS.map((p) => [p.id, p])),
      [COLLECTIONS.STOCK]: Object.fromEntries(SEED_STOCK_LEVELS.map((s) => [s.id, s])),
      [COLLECTIONS.STOCK_LEDGER]: Object.fromEntries(SEED_STOCK_LEDGER.map((l) => [l.id, l])),
      [COLLECTIONS.RECEIPTS]: Object.fromEntries(SEED_RECEIPTS.map((r) => [r.id, r])),
      [COLLECTIONS.DELIVERIES]: Object.fromEntries(SEED_DELIVERIES.map((d) => [d.id, d])),
      [COLLECTIONS.TRANSFERS]: Object.fromEntries(SEED_TRANSFERS.map((t) => [t.id, t])),
      [COLLECTIONS.ADJUSTMENTS]: Object.fromEntries(SEED_ADJUSTMENTS.map((a) => [a.id, a])),
      [COLLECTIONS.ALERTS]: Object.fromEntries(SEED_ALERTS.map((a) => [a.id, a])),
      [COLLECTIONS.AUDIT_LOGS]: Object.fromEntries(SEED_AUDIT_LOGS.map((a) => [a.id, a])),
    };
    this.notifyAll();
  }

  private notifyAll() {
    Object.keys(this.listeners).forEach((col) => {
      this.notify(col as CollectionName);
    });
  }

  private notify(collectionName: string) {
    const list = this.getAll(collectionName);
    this.listeners[collectionName]?.forEach((cb) => cb(list));
  }

  public getAll<T = DocumentData>(collectionName: string): T[] {
    return Object.values(this.store[collectionName] || {}) as T[];
  }

  public getById<T = DocumentData>(collectionName: string, id: string): T | null {
    return (this.store[collectionName]?.[id] as T) || null;
  }

  public set<T extends DocumentData>(collectionName: string, id: string, data: T): void {
    if (!this.store[collectionName]) this.store[collectionName] = {};
    this.store[collectionName][id] = { ...data, id };
    this.notify(collectionName);
  }

  public update<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): void {
    if (!this.store[collectionName]) this.store[collectionName] = {};
    const existing = this.store[collectionName][id] || {};
    this.store[collectionName][id] = { ...existing, ...data, id };
    this.notify(collectionName);
  }

  public delete(collectionName: string, id: string): void {
    if (this.store[collectionName]?.[id]) {
      delete this.store[collectionName][id];
      this.notify(collectionName);
    }
  }

  public subscribe(collectionName: string, callback: (items: DocumentData[]) => void): () => void {
    if (!this.listeners[collectionName]) {
      this.listeners[collectionName] = new Set();
    }
    this.listeners[collectionName].add(callback);
    // Send immediate initial data
    callback(this.getAll(collectionName));
    return () => {
      this.listeners[collectionName].delete(callback);
    };
  }
}

export const localStore = new LocalDataStore();

/**
 * Universal Database Service with transparent Firestore / LocalStore switching.
 * Every team member uses this service to ensure identical behaviour across environments.
 */
export const dbService = {
  async getAll<T = DocumentData>(collectionName: CollectionName): Promise<T[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection<T>(collectionName);
        if (!colRef) return localStore.getAll<T>(collectionName);
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T));
      } catch (err) {
        console.warn(`[dbService] Failed to fetch ${collectionName} from Firestore, falling back to local:`, err);
        return localStore.getAll<T>(collectionName);
      }
    }
    return localStore.getAll<T>(collectionName);
  },

  async getById<T = DocumentData>(collectionName: CollectionName, id: string): Promise<T | null> {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection<T>(collectionName);
        if (!colRef) return localStore.getById<T>(collectionName, id);
        const docRef = doc(colRef, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
      } catch (err) {
        console.warn(`[dbService] Failed to get doc ${id} from Firestore:`, err);
        return localStore.getById<T>(collectionName, id);
      }
    }
    return localStore.getById<T>(collectionName, id);
  },

  async set<T extends DocumentData>(collectionName: CollectionName, id: string, data: T): Promise<void> {
    localStore.set<T>(collectionName, id, data);
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection<T>(collectionName);
        if (colRef) {
          await setDoc(doc(colRef, id), data);
        }
      } catch (err) {
        console.error(`[dbService] Firestore setDoc failed for ${collectionName}/${id}:`, err);
      }
    }
  },

  async update<T extends DocumentData>(
    collectionName: CollectionName,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    localStore.update<T>(collectionName, id, data);
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection<T>(collectionName);
        if (colRef) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await updateDoc(doc(colRef, id) as any, data as any);
        }
      } catch (err) {
        console.error(`[dbService] Firestore updateDoc failed for ${collectionName}/${id}:`, err);
      }
    }
  },

  async delete(collectionName: CollectionName, id: string): Promise<void> {
    localStore.delete(collectionName, id);
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection(collectionName);
        if (colRef) {
          await deleteDoc(doc(colRef, id));
        }
      } catch (err) {
        console.error(`[dbService] Firestore deleteDoc failed for ${collectionName}/${id}:`, err);
      }
    }
  },

  async queryWhere<T = DocumentData>(
    collectionName: CollectionName,
    field: string,
    operator: WhereFilterOp,
    value: unknown
  ): Promise<T[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection<T>(collectionName);
        if (!colRef) return [];
        const q = query(colRef, where(field, operator, value));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T));
      } catch (err) {
        console.warn(`[dbService] Firestore query failed:`, err);
      }
    }
    // Fallback local query
    const all = localStore.getAll<T>(collectionName);
    return all.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (item as any)[field];
      if (operator === '==') return val === value;
      if (operator === '!=') return val !== value;
      if (operator === '>') return val > (value as any);
      if (operator === '>=') return val >= (value as any);
      if (operator === '<') return val < (value as any);
      if (operator === '<=') return val <= (value as any);
      return false;
    });
  },

  subscribe<T = DocumentData>(
    collectionName: CollectionName,
    callback: (items: T[]) => void
  ): () => void {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = getTypedCollection<T>(collectionName);
        if (colRef) {
          const unsubscribe = onSnapshot(
            colRef,
            (snapshot) => {
              const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
              callback(items);
            },
            (err) => {
              console.warn(`[dbService] Snapshot listener error on ${collectionName}:`, err);
            }
          );
          return unsubscribe;
        }
      } catch (err) {
        console.warn(`[dbService] Error setting up snapshot on ${collectionName}:`, err);
      }
    }
    return localStore.subscribe(collectionName, (items) => callback(items as T[]));
  },
};
