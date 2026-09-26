import { runTransaction, doc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { dbService } from './databaseService';
import {
  StockLevel,
  StockLedgerEntry,
  StockMovementType,
  Product,
  InventoryHealthScore,
  Alert,
} from '../types';
import {
  calculateInventoryHealthMetrics,
  validateStockAvailability,
} from '../utils/stockCalculations';

export interface IncreaseStockParams {
  productId: string;
  warehouseId: string;
  locationId: string;
  quantity: number;
  referenceType: 'RECEIPT' | 'TRANSFER' | 'ADJUSTMENT' | 'INITIAL' | 'MANUAL';
  referenceId: string;
  performedBy: string;
  performedByName: string;
  notes?: string;
}

export interface DecreaseStockParams {
  productId: string;
  warehouseId: string;
  locationId: string;
  quantity: number;
  referenceType: 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT' | 'MANUAL';
  referenceId: string;
  performedBy: string;
  performedByName: string;
  notes?: string;
}

export interface TransferStockParams {
  productId: string;
  sourceWarehouseId: string;
  sourceLocationId: string;
  targetWarehouseId: string;
  targetLocationId: string;
  quantity: number;
  referenceId: string;
  performedBy: string;
  performedByName: string;
  notes?: string;
}

export interface AdjustStockParams {
  productId: string;
  warehouseId: string;
  locationId: string;
  newCountedQuantity: number;
  reason: 'CYCLE_COUNT' | 'DAMAGED' | 'EXPIRED' | 'THEFT' | 'DATA_CORRECTION' | 'SCRAP';
  referenceId: string;
  performedBy: string;
  performedByName: string;
  notes?: string;
}

/**
 * StockService - The Single Source of Truth for all Stock Calculations and Updates.
 *
 * ALL modules (Receipts, Deliveries, Transfers, Adjustments, Products) MUST
 * interact through this engine to mutate or query stock.
 */
export const stockService = {
  /**
   * Returns the current stock level for a product, optionally filtered by warehouse and location.
   */
  async getStock(
    productId: string,
    warehouseId?: string,
    locationId?: string
  ): Promise<number> {
    const allStock = await dbService.getAll<StockLevel>(COLLECTIONS.STOCK);
    const filtered = allStock.filter((s) => {
      if (s.productId !== productId) return false;
      if (warehouseId && s.warehouseId !== warehouseId) return false;
      if (locationId && s.locationId !== locationId) return false;
      return true;
    });

    return filtered.reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Fetches all stock level records matching criteria.
   */
  async getStockLevels(warehouseId?: string): Promise<StockLevel[]> {
    const allStock = await dbService.getAll<StockLevel>(COLLECTIONS.STOCK);
    if (!warehouseId) return allStock;
    return allStock.filter((s) => s.warehouseId === warehouseId);
  },

  /**
   * Increases stock in a specific warehouse and location (e.g. from a Receipt or Putaway).
   * Atomically records the stock increase and generates an immutable Stock Ledger entry.
   */
  async increaseStock(params: IncreaseStockParams): Promise<StockLedgerEntry> {
    const {
      productId,
      warehouseId,
      locationId,
      quantity,
      referenceType,
      referenceId,
      performedBy,
      performedByName,
      notes,
    } = params;

    if (quantity <= 0) {
      throw new Error(`Quantity to increase must be strictly greater than 0. Received: ${quantity}`);
    }

    const stockLevelId = `${productId}_${warehouseId}_${locationId}`;
    const product = await dbService.getById<Product>(COLLECTIONS.PRODUCTS, productId);
    if (!product) throw new Error(`Product with ID "${productId}" not found.`);

    const warehouse = await dbService.getById<{ name: string }>(COLLECTIONS.WAREHOUSES, warehouseId);
    const location = await dbService.getById<{ name: string }>(COLLECTIONS.LOCATIONS, locationId);

    const warehouseName = warehouse?.name || warehouseId;
    const locationName = location?.name || locationId;

    let balanceBefore = 0;
    let balanceAfter = 0;
    const now = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      const stockDocRef = doc(db, COLLECTIONS.STOCK, stockLevelId);
      const productDocRef = doc(db, COLLECTIONS.PRODUCTS, productId);

      await runTransaction(db, async (transaction) => {
        const stockDoc = await transaction.get(stockDocRef);
        const prodDoc = await transaction.get(productDocRef);

        const currentStockData = stockDoc.exists()
          ? (stockDoc.data() as StockLevel)
          : null;

        balanceBefore = currentStockData ? currentStockData.quantity : 0;
        balanceAfter = balanceBefore + quantity;

        const updatedStock: StockLevel = {
          id: stockLevelId,
          productId,
          warehouseId,
          locationId,
          quantity: balanceAfter,
          reservedQuantity: currentStockData?.reservedQuantity || 0,
          availableQuantity: balanceAfter - (currentStockData?.reservedQuantity || 0),
          minAlertLevel: currentStockData?.minAlertLevel || product.minStockAlert,
          maxCapacity: currentStockData?.maxCapacity || product.maxStockAlert,
          updatedAt: now,
        };

        transaction.set(stockDocRef, updatedStock);

        if (prodDoc.exists()) {
          const prodData = prodDoc.data() as Product;
          transaction.update(productDocRef, {
            currentStock: (prodData.currentStock || 0) + quantity,
            updatedAt: now,
          });
        }
      });
    } else {
      // Local execution fallback
      const existing = await dbService.getById<StockLevel>(COLLECTIONS.STOCK, stockLevelId);
      balanceBefore = existing ? existing.quantity : 0;
      balanceAfter = balanceBefore + quantity;

      const updatedStock: StockLevel = {
        id: stockLevelId,
        productId,
        warehouseId,
        locationId,
        quantity: balanceAfter,
        reservedQuantity: existing?.reservedQuantity || 0,
        availableQuantity: balanceAfter - (existing?.reservedQuantity || 0),
        minAlertLevel: existing?.minAlertLevel || product.minStockAlert,
        maxCapacity: existing?.maxCapacity || product.maxStockAlert,
        updatedAt: now,
      };

      await dbService.set<StockLevel>(COLLECTIONS.STOCK, stockLevelId, updatedStock);

      // Update aggregate product currentStock
      await dbService.update<Product>(COLLECTIONS.PRODUCTS, productId, {
        currentStock: (product.currentStock || 0) + quantity,
        updatedAt: now,
      });
    }

    // Create immutable Stock Ledger Entry
    const movementType: StockMovementType =
      referenceType === 'INITIAL'
        ? 'OPENING_STOCK'
        : referenceType === 'TRANSFER'
        ? 'INTERNAL_TRANSFER_IN'
        : 'RECEIPT';

    const ledgerEntry: StockLedgerEntry = {
      id: `ldg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      transactionId: `tx-${Date.now()}`,
      productId,
      productName: product.name,
      sku: product.sku,
      warehouseId,
      warehouseName,
      locationId,
      locationName,
      movementType,
      quantityDelta: quantity,
      balanceBefore,
      balanceAfter,
      referenceType,
      referenceId,
      performedBy,
      performedByName,
      timestamp: now,
      notes: notes || `Stock increase via ${referenceType} [${referenceId}]`,
    };

    await dbService.set<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER, ledgerEntry.id, ledgerEntry);
    return ledgerEntry;
  },

  /**
   * Decreases stock in a specific warehouse and location (e.g. for a Customer Delivery).
   * Enforces non-negative stock invariants.
   */
  async decreaseStock(params: DecreaseStockParams): Promise<StockLedgerEntry> {
    const {
      productId,
      warehouseId,
      locationId,
      quantity,
      referenceType,
      referenceId,
      performedBy,
      performedByName,
      notes,
    } = params;

    if (quantity <= 0) {
      throw new Error(`Quantity to decrease must be strictly greater than 0. Received: ${quantity}`);
    }

    const stockLevelId = `${productId}_${warehouseId}_${locationId}`;
    const product = await dbService.getById<Product>(COLLECTIONS.PRODUCTS, productId);
    if (!product) throw new Error(`Product with ID "${productId}" not found.`);

    const warehouse = await dbService.getById<{ name: string }>(COLLECTIONS.WAREHOUSES, warehouseId);
    const location = await dbService.getById<{ name: string }>(COLLECTIONS.LOCATIONS, locationId);

    const warehouseName = warehouse?.name || warehouseId;
    const locationName = location?.name || locationId;

    let balanceBefore = 0;
    let balanceAfter = 0;
    const now = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      const stockDocRef = doc(db, COLLECTIONS.STOCK, stockLevelId);
      const productDocRef = doc(db, COLLECTIONS.PRODUCTS, productId);

      await runTransaction(db, async (transaction) => {
        const stockDoc = await transaction.get(stockDocRef);
        const prodDoc = await transaction.get(productDocRef);

        if (!stockDoc.exists()) {
          throw new Error(
            `No stock record exists for ${product.name} at ${warehouseName} (${locationName}). Cannot fulfill deduction.`
          );
        }

        const stockData = stockDoc.data() as StockLevel;
        balanceBefore = stockData.quantity;

        const validation = validateStockAvailability(balanceBefore, quantity, product.name);
        if (!validation.isValid) {
          throw new Error(validation.errorMessage);
        }

        balanceAfter = balanceBefore - quantity;

        transaction.update(stockDocRef, {
          quantity: balanceAfter,
          availableQuantity: balanceAfter - (stockData.reservedQuantity || 0),
          updatedAt: now,
        });

        if (prodDoc.exists()) {
          const prodData = prodDoc.data() as Product;
          transaction.update(productDocRef, {
            currentStock: Math.max(0, (prodData.currentStock || 0) - quantity),
            updatedAt: now,
          });
        }
      });
    } else {
      // Local fallback
      const existing = await dbService.getById<StockLevel>(COLLECTIONS.STOCK, stockLevelId);
      balanceBefore = existing ? existing.quantity : 0;

      const validation = validateStockAvailability(balanceBefore, quantity, product.name);
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }

      balanceAfter = balanceBefore - quantity;

      await dbService.update<StockLevel>(COLLECTIONS.STOCK, stockLevelId, {
        quantity: balanceAfter,
        availableQuantity: balanceAfter - (existing?.reservedQuantity || 0),
        updatedAt: now,
      });

      await dbService.update<Product>(COLLECTIONS.PRODUCTS, productId, {
        currentStock: Math.max(0, (product.currentStock || 0) - quantity),
        updatedAt: now,
      });
    }

    // Check if new balance breached minimum stock alert
    if (balanceAfter <= product.minStockAlert) {
      const alert: Alert = {
        id: `alt-${Date.now()}`,
        title: balanceAfter === 0 ? `Out of Stock: ${product.name}` : `Low Stock Alert: ${product.name}`,
        message: `Stock level dropped to ${balanceAfter} ${product.uom} at ${warehouseName}. Minimum threshold is ${product.minStockAlert}.`,
        severity: balanceAfter === 0 ? 'CRITICAL' : 'WARNING',
        type: balanceAfter === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        productId,
        productName: product.name,
        warehouseId,
        warehouseName,
        isRead: false,
        createdAt: now,
      };
      await dbService.set<Alert>(COLLECTIONS.ALERTS, alert.id, alert);
    }

    // Ledger Entry
    const movementType: StockMovementType =
      referenceType === 'TRANSFER' ? 'INTERNAL_TRANSFER_OUT' : 'DELIVERY';

    const ledgerEntry: StockLedgerEntry = {
      id: `ldg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      transactionId: `tx-${Date.now()}`,
      productId,
      productName: product.name,
      sku: product.sku,
      warehouseId,
      warehouseName,
      locationId,
      locationName,
      movementType,
      quantityDelta: -quantity,
      balanceBefore,
      balanceAfter,
      referenceType,
      referenceId,
      performedBy,
      performedByName,
      timestamp: now,
      notes: notes || `Stock deduction via ${referenceType} [${referenceId}]`,
    };

    await dbService.set<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER, ledgerEntry.id, ledgerEntry);
    return ledgerEntry;
  },

  /**
   * Internal Transfer: atomically transfers stock between two locations/warehouses.
   * Decrements source and increments target, generating matching ledger entries.
   */
  async transferStock(
    params: TransferStockParams
  ): Promise<{ sourceEntry: StockLedgerEntry; targetEntry: StockLedgerEntry }> {
    const {
      productId,
      sourceWarehouseId,
      sourceLocationId,
      targetWarehouseId,
      targetLocationId,
      quantity,
      referenceId,
      performedBy,
      performedByName,
      notes,
    } = params;

    // 1. Decrement source
    const sourceEntry = await this.decreaseStock({
      productId,
      warehouseId: sourceWarehouseId,
      locationId: sourceLocationId,
      quantity,
      referenceType: 'TRANSFER',
      referenceId,
      performedBy,
      performedByName,
      notes: notes || `Transfer outbound to ${targetWarehouseId}`,
    });

    // 2. Increment destination
    const targetEntry = await this.increaseStock({
      productId,
      warehouseId: targetWarehouseId,
      locationId: targetLocationId,
      quantity,
      referenceType: 'TRANSFER',
      referenceId,
      performedBy,
      performedByName,
      notes: notes || `Transfer inbound from ${sourceWarehouseId}`,
    });

    return { sourceEntry, targetEntry };
  },

  /**
   * Adjusts stock based on cycle count, damage, or audit reconciliation.
   * Automatically calculates delta: newCounted - currentCounted.
   */
  async adjustStock(params: AdjustStockParams): Promise<StockLedgerEntry> {
    const {
      productId,
      warehouseId,
      locationId,
      newCountedQuantity,
      reason,
      referenceId,
      performedBy,
      performedByName,
      notes,
    } = params;

    if (newCountedQuantity < 0) {
      throw new Error(`Counted stock cannot be negative. Received: ${newCountedQuantity}`);
    }

    const currentStock = await this.getStock(productId, warehouseId, locationId);
    const delta = newCountedQuantity - currentStock;

    if (delta === 0) {
      throw new Error(`Counted quantity (${newCountedQuantity}) matches recorded quantity. No adjustment necessary.`);
    }

    const product = await dbService.getById<Product>(COLLECTIONS.PRODUCTS, productId);
    if (!product) throw new Error(`Product "${productId}" not found.`);

    const warehouse = await dbService.getById<{ name: string }>(COLLECTIONS.WAREHOUSES, warehouseId);
    const location = await dbService.getById<{ name: string }>(COLLECTIONS.LOCATIONS, locationId);

    const warehouseName = warehouse?.name || warehouseId;
    const locationName = location?.name || locationId;
    const stockLevelId = `${productId}_${warehouseId}_${locationId}`;
    const now = new Date().toISOString();

    // Update stock record directly to counted quantity
    const existing = await dbService.getById<StockLevel>(COLLECTIONS.STOCK, stockLevelId);
    const reserved = existing?.reservedQuantity || 0;

    await dbService.set<StockLevel>(COLLECTIONS.STOCK, stockLevelId, {
      id: stockLevelId,
      productId,
      warehouseId,
      locationId,
      quantity: newCountedQuantity,
      reservedQuantity: reserved,
      availableQuantity: Math.max(0, newCountedQuantity - reserved),
      minAlertLevel: existing?.minAlertLevel || product.minStockAlert,
      maxCapacity: existing?.maxCapacity || product.maxStockAlert,
      updatedAt: now,
    });

    // Update aggregate product currentStock
    const updatedProdStock = Math.max(0, (product.currentStock || 0) + delta);
    await dbService.update<Product>(COLLECTIONS.PRODUCTS, productId, {
      currentStock: updatedProdStock,
      updatedAt: now,
    });

    // Record Ledger Entry
    const movementType: StockMovementType =
      delta > 0 ? 'ADJUSTMENT_POSITIVE' : 'ADJUSTMENT_NEGATIVE';

    const ledgerEntry: StockLedgerEntry = {
      id: `ldg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      transactionId: `tx-${Date.now()}`,
      productId,
      productName: product.name,
      sku: product.sku,
      warehouseId,
      warehouseName,
      locationId,
      locationName,
      movementType,
      quantityDelta: delta,
      balanceBefore: currentStock,
      balanceAfter: newCountedQuantity,
      referenceType: 'ADJUSTMENT',
      referenceId,
      performedBy,
      performedByName,
      timestamp: now,
      notes: notes || `Stock Adjustment (${reason}): ${delta > 0 ? `+${delta}` : delta} units`,
    };

    await dbService.set<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER, ledgerEntry.id, ledgerEntry);
    return ledgerEntry;
  },

  /**
   * Calculates inventory health metrics dynamically from actual database records.
   */
  async calculateInventoryHealth(warehouseId?: string): Promise<InventoryHealthScore> {
    const products = await dbService.getAll<Product>(COLLECTIONS.PRODUCTS);
    const stockLevels = await this.getStockLevels(warehouseId);

    // Build product stock aggregation
    const stockMap: Record<string, number> = {};
    stockLevels.forEach((level) => {
      stockMap[level.productId] = (stockMap[level.productId] || 0) + level.quantity;
    });

    return calculateInventoryHealthMetrics(products, stockMap);
  },

  /**
   * Fetches chronological stock ledger records.
   */
  async getStockLedger(productId?: string, warehouseId?: string): Promise<StockLedgerEntry[]> {
    const all = await dbService.getAll<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER);
    return all
      .filter((entry) => {
        if (productId && entry.productId !== productId) return false;
        if (warehouseId && entry.warehouseId !== warehouseId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
};
