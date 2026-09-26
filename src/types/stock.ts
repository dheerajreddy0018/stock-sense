export type StockMovementType =
  | 'OPENING_STOCK'
  | 'RECEIPT'
  | 'DELIVERY'
  | 'INTERNAL_TRANSFER_IN'
  | 'INTERNAL_TRANSFER_OUT'
  | 'ADJUSTMENT_POSITIVE'
  | 'ADJUSTMENT_NEGATIVE';

export interface StockLevel {
  id: string; // Typically `${productId}_${warehouseId}_${locationId}`
  productId: string;
  warehouseId: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minAlertLevel: number;
  maxCapacity: number;
  updatedAt: string;
}

export interface StockLedgerEntry {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  movementType: StockMovementType;
  quantityDelta: number; // positive or negative
  balanceBefore: number;
  balanceAfter: number;
  referenceType: 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT' | 'INITIAL' | 'MANUAL';
  referenceId: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  notes?: string;
}

export interface InventoryHealthScore {
  score: number; // 0 to 100
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  totalSKUs: number;
  healthyStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  turnoverRatio: number;
  recommendations: string[];
}
