export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  icon?: string;
  productCount?: number;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  managerName: string;
  contactEmail: string;
  capacity: number; // In cubic meters or max units
  currentUtilization?: number;
  isActive: boolean;
  locationCount?: number;
}

export type LocationType = 'INTERNAL' | 'INPUT' | 'OUTPUT' | 'SCRAP' | 'TRANSIT';

export interface Location {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  code: string;
  name: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  type: LocationType;
  capacity?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  uom: string; // Unit of measure: 'pcs', 'kg', 'boxes', 'm'
  costPrice: number;
  sellingPrice: number;
  minStockAlert: number;
  maxStockAlert: number;
  currentStock: number; // Aggregate across all warehouses/locations
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockPulseStage =
  | 'SUPPLIER'
  | 'RECEIPT'
  | 'WAREHOUSE'
  | 'TRANSFER'
  | 'LOCATION'
  | 'DELIVERY';

export interface StockPulseStep {
  stage: StockPulseStage;
  title: string;
  subtitle: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED';
  timestamp?: string;
  details?: Record<string, string | number>;
}

export interface StockPulseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  supplierName: string;
  receiptNumber: string;
  warehouseName: string;
  transferNumber?: string;
  locationName: string;
  deliveryNumber?: string;
  customerName?: string;
  currentStage: StockPulseStage;
  steps: StockPulseStep[];
  updatedAt: string;
}
