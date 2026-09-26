export type OperationStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELLED';

// --- Receipts ---
export interface ReceiptItem {
  productId: string;
  sku: string;
  productName: string;
  quantityExpected: number;
  quantityReceived: number;
  unitPrice: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  supplierName: string;
  supplierContact?: string;
  warehouseId: string;
  warehouseName: string;
  targetLocationId: string;
  targetLocationName: string;
  scheduledDate: string;
  effectiveDate?: string;
  status: OperationStatus;
  items: ReceiptItem[];
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// --- Deliveries ---
export interface DeliveryItem {
  productId: string;
  sku: string;
  productName: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unitPrice: number;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  customerName: string;
  customerAddress?: string;
  warehouseId: string;
  warehouseName: string;
  sourceLocationId: string;
  sourceLocationName: string;
  scheduledDate: string;
  effectiveDate?: string;
  status: OperationStatus;
  items: DeliveryItem[];
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// --- Transfers ---
export type TransferStatus = 'DRAFT' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface TransferItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  sourceLocationId: string;
  sourceLocationName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  targetLocationId: string;
  targetLocationName: string;
  scheduledDate: string;
  effectiveDate?: string;
  status: TransferStatus;
  items: TransferItem[];
  trackingNote?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// --- Adjustments ---
export type AdjustmentReason =
  | 'CYCLE_COUNT'
  | 'DAMAGED'
  | 'EXPIRED'
  | 'THEFT'
  | 'DATA_CORRECTION'
  | 'SCRAP';

export type AdjustmentStatus = 'DRAFT' | 'APPLIED' | 'REJECTED';

export interface AdjustmentItem {
  productId: string;
  sku: string;
  productName: string;
  recordedQuantity: number;
  countedQuantity: number;
  differenceQuantity: number; // countedQuantity - recordedQuantity
}

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  reason: AdjustmentReason;
  status: AdjustmentStatus;
  items: AdjustmentItem[];
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// --- Alerts ---
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY' | 'CAPACITY_BREACH' | 'SYSTEM';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  type: AlertType;
  productId?: string;
  productName?: string;
  warehouseId?: string;
  warehouseName?: string;
  isRead: boolean;
  createdAt: string;
}

// --- Audit Logs ---
export interface AuditLog {
  id: string;
  action: string;
  entityType: 'PRODUCT' | 'STOCK' | 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT' | 'USER' | 'WAREHOUSE';
  entityId: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
}
