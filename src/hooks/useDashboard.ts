import { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/databaseService';
import { COLLECTIONS } from '../firebase/collections';
import {
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
  InventoryHealthScore,
  StockPulseItem,
} from '../types';
import { calculateInventoryHealthMetrics } from '../utils/stockCalculations';
import { SEED_STOCK_PULSE } from '../data/seedData';

export interface DashboardMetrics {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  scheduledTransfersCount: number;
  inventoryValue: number;
  health: InventoryHealthScore;
}

export function useDashboard(selectedWarehouseId: string = 'ALL') {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<StockLedgerEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to real-time collections
  useEffect(() => {
    setLoading(true);

    const unsubProd = dbService.subscribe<Product>(COLLECTIONS.PRODUCTS, setProducts);
    const unsubCat = dbService.subscribe<Category>(COLLECTIONS.CATEGORIES, setCategories);
    const unsubWh = dbService.subscribe<Warehouse>(COLLECTIONS.WAREHOUSES, setWarehouses);
    const unsubLoc = dbService.subscribe<Location>(COLLECTIONS.LOCATIONS, setLocations);
    const unsubStock = dbService.subscribe<StockLevel>(COLLECTIONS.STOCK, setStockLevels);
    const unsubRcp = dbService.subscribe<Receipt>(COLLECTIONS.RECEIPTS, setReceipts);
    const unsubDel = dbService.subscribe<Delivery>(COLLECTIONS.DELIVERIES, setDeliveries);
    const unsubTrf = dbService.subscribe<Transfer>(COLLECTIONS.TRANSFERS, setTransfers);
    const unsubAdj = dbService.subscribe<Adjustment>(COLLECTIONS.ADJUSTMENTS, setAdjustments);
    const unsubLdg = dbService.subscribe<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER, setLedgerEntries);
    const unsubAlt = dbService.subscribe<Alert>(COLLECTIONS.ALERTS, setAlerts);

    setLoading(false);

    return () => {
      unsubProd();
      unsubCat();
      unsubWh();
      unsubLoc();
      unsubStock();
      unsubRcp();
      unsubDel();
      unsubTrf();
      unsubAdj();
      unsubLdg();
      unsubAlt();
    };
  }, []);

  // Filtered Stock Levels based on active warehouse
  const filteredStockLevels = useMemo(() => {
    if (selectedWarehouseId === 'ALL') return stockLevels;
    return stockLevels.filter((s) => s.warehouseId === selectedWarehouseId);
  }, [stockLevels, selectedWarehouseId]);

  // Aggregate stock by Product
  const productStockMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredStockLevels.forEach((item) => {
      map[item.productId] = (map[item.productId] || 0) + item.quantity;
    });
    return map;
  }, [filteredStockLevels]);

  // Compute all 8 KPIs directly from actual data
  const metrics: DashboardMetrics = useMemo(() => {
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inventoryValue = 0;

    products.forEach((p) => {
      const stock =
        selectedWarehouseId === 'ALL'
          ? p.currentStock ?? productStockMap[p.id] ?? 0
          : productStockMap[p.id] ?? 0;

      totalStockUnits += stock;
      inventoryValue += stock * (p.costPrice || 0);

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= p.minStockAlert) {
        lowStockCount++;
      }
    });

    const pendingReceiptsCount = receipts.filter(
      (r) =>
        (selectedWarehouseId === 'ALL' || r.warehouseId === selectedWarehouseId) &&
        (r.status === 'WAITING' || r.status === 'READY')
    ).length;

    const pendingDeliveriesCount = deliveries.filter(
      (d) =>
        (selectedWarehouseId === 'ALL' || d.warehouseId === selectedWarehouseId) &&
        (d.status === 'WAITING' || d.status === 'READY')
    ).length;

    const scheduledTransfersCount = transfers.filter(
      (t) =>
        (selectedWarehouseId === 'ALL' ||
          t.sourceWarehouseId === selectedWarehouseId ||
          t.targetWarehouseId === selectedWarehouseId) &&
        (t.status === 'IN_TRANSIT' || t.status === 'DRAFT')
    ).length;

    const health = calculateInventoryHealthMetrics(products, productStockMap);

    return {
      totalProducts: products.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      pendingReceiptsCount,
      pendingDeliveriesCount,
      scheduledTransfersCount,
      inventoryValue,
      health,
    };
  }, [products, productStockMap, receipts, deliveries, transfers, selectedWarehouseId]);

  // Stock Movement Chart Data (from real Stock Ledger)
  const stockMovementData = useMemo(() => {
    const filteredLedger =
      selectedWarehouseId === 'ALL'
        ? ledgerEntries
        : ledgerEntries.filter((l) => l.warehouseId === selectedWarehouseId);

    // Group by date
    const dateMap: Record<string, { date: string; inward: number; outward: number; net: number }> =
      {};

    filteredLedger.forEach((entry) => {
      const dateKey = new Date(entry.timestamp).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, inward: 0, outward: 0, net: 0 };
      }

      if (entry.quantityDelta > 0) {
        dateMap[dateKey].inward += entry.quantityDelta;
      } else {
        dateMap[dateKey].outward += Math.abs(entry.quantityDelta);
      }
      dateMap[dateKey].net += entry.quantityDelta;
    });

    const list = Object.values(dateMap);
    return list.length > 0
      ? list
      : [
          { date: '20 Sep', inward: 50, outward: 0, net: 50 },
          { date: '22 Sep', inward: 30, outward: 30, net: 0 },
          { date: '24 Sep', inward: 0, outward: 25, net: -25 },
          { date: '25 Sep', inward: 15, outward: 0, net: 15 },
          { date: '26 Sep', inward: 0, outward: 0, net: 0 },
        ];
  }, [ledgerEntries, selectedWarehouseId]);

  // Incoming vs Outgoing Data
  const incomingOutgoingData = useMemo(() => {
    const totalIncomingUnits = receipts
      .filter((r) => selectedWarehouseId === 'ALL' || r.warehouseId === selectedWarehouseId)
      .reduce((sum, r) => sum + r.items.reduce((s, i) => s + (i.quantityExpected || 0), 0), 0);

    const totalOutgoingUnits = deliveries
      .filter((d) => selectedWarehouseId === 'ALL' || d.warehouseId === selectedWarehouseId)
      .reduce((sum, d) => sum + d.items.reduce((s, i) => s + (i.quantityOrdered || 0), 0), 0);

    const totalTransferredUnits = transfers
      .filter(
        (t) =>
          selectedWarehouseId === 'ALL' ||
          t.sourceWarehouseId === selectedWarehouseId ||
          t.targetWarehouseId === selectedWarehouseId
      )
      .reduce((sum, t) => sum + t.items.reduce((s, i) => s + (i.quantity || 0), 0), 0);

    return [
      { name: 'Incoming (Receipts)', units: totalIncomingUnits, fill: '#06b6d4' },
      { name: 'Outgoing (Deliveries)', units: totalOutgoingUnits, fill: '#f59e0b' },
      { name: 'Transfers (Inter-hub)', units: totalTransferredUnits, fill: '#6366f1' },
    ];
  }, [receipts, deliveries, transfers, selectedWarehouseId]);

  // Inventory by Category Data
  const categoryBreakdownData = useMemo(() => {
    const catMap: Record<string, { name: string; value: number; count: number }> = {};

    categories.forEach((cat) => {
      catMap[cat.id] = { name: cat.name, value: 0, count: 0 };
    });

    products.forEach((prod) => {
      const stock = productStockMap[prod.id] ?? prod.currentStock ?? 0;
      const targetCat = catMap[prod.categoryId] || {
        name: prod.categoryName || 'Other',
        value: 0,
        count: 0,
      };
      targetCat.value += stock * (prod.costPrice || 0);
      targetCat.count += stock;
      catMap[prod.categoryId] = targetCat;
    });

    return Object.values(catMap).filter((c) => c.count > 0 || c.value > 0);
  }, [categories, products, productStockMap]);

  // Stock Pulse Pipeline Items
  const stockPulseItems: StockPulseItem[] = useMemo(() => {
    return SEED_STOCK_PULSE;
  }, []);

  return {
    loading,
    products,
    categories,
    warehouses,
    locations,
    stockLevels: filteredStockLevels,
    receipts,
    deliveries,
    transfers,
    adjustments,
    ledgerEntries,
    alerts,
    metrics,
    stockMovementData,
    incomingOutgoingData,
    categoryBreakdownData,
    stockPulseItems,
  };
}
