import { COLLECTIONS } from '../firebase/collections';
import { dbService, localStore } from './databaseService';
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
import { isFirebaseConfigured } from '../firebase/config';

export const seedService = {
  /**
   * Seeds all 13 collections with realistic GCET Hyderabad Hackathon 2026 data.
   */
  async seedAll(force = false): Promise<{ success: boolean; message: string }> {
    try {
      if (isFirebaseConfigured()) {
        const existingProducts = await dbService.getAll(COLLECTIONS.PRODUCTS);
        if (existingProducts.length > 0 && !force) {
          return { success: true, message: 'Firestore already populated with data.' };
        }

        console.info('[seedService] Seeding Firestore with industrial dataset...');
        for (const u of SEED_USERS) await dbService.set(COLLECTIONS.USERS, u.id, u);
        for (const w of SEED_WAREHOUSES) await dbService.set(COLLECTIONS.WAREHOUSES, w.id, w);
        for (const l of SEED_LOCATIONS) await dbService.set(COLLECTIONS.LOCATIONS, l.id, l);
        for (const c of SEED_CATEGORIES) await dbService.set(COLLECTIONS.CATEGORIES, c.id, c);
        for (const p of SEED_PRODUCTS) await dbService.set(COLLECTIONS.PRODUCTS, p.id, p);
        for (const s of SEED_STOCK_LEVELS) await dbService.set(COLLECTIONS.STOCK, s.id, s);
        for (const sl of SEED_STOCK_LEDGER) await dbService.set(COLLECTIONS.STOCK_LEDGER, sl.id, sl);
        for (const r of SEED_RECEIPTS) await dbService.set(COLLECTIONS.RECEIPTS, r.id, r);
        for (const d of SEED_DELIVERIES) await dbService.set(COLLECTIONS.DELIVERIES, d.id, d);
        for (const t of SEED_TRANSFERS) await dbService.set(COLLECTIONS.TRANSFERS, t.id, t);
        for (const a of SEED_ADJUSTMENTS) await dbService.set(COLLECTIONS.ADJUSTMENTS, a.id, a);
        for (const alt of SEED_ALERTS) await dbService.set(COLLECTIONS.ALERTS, alt.id, alt);
        for (const aud of SEED_AUDIT_LOGS) await dbService.set(COLLECTIONS.AUDIT_LOGS, aud.id, aud);

        return { success: true, message: 'Firestore successfully populated with all 13 collections.' };
      } else {
        localStore.initializeFromSeed();
        return { success: true, message: 'Local reactive store refreshed with seed data.' };
      }
    } catch (err: unknown) {
      console.error('[seedService] Error seeding dataset:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown seeding error',
      };
    }
  },
};
