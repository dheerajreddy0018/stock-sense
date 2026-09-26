# StockSense — Intelligent Modular Inventory Management System

**Event:** Odoo × GCET Hyderabad Hackathon 2026  
**Project:** StockSense  
**Team Leader & Core Architecture:** Member 1  
**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, Recharts, Lucide React

---

## 🌟 Executive Overview & Architecture

StockSense is a modular, high-reliability inventory management platform engineered for multi-warehouse industrial operations. It centralizes real-time stock operations across Products, Receipts, Customer Deliveries, Inter-Hub Internal Transfers, Physical Cycle Count Adjustments, Multi-location Warehouses, and an Immutable Cryptographic Stock Ledger.

### 📐 The Core Stock Calculation Engine (Single Source of Truth)

To eliminate calculation discrepancies across developer modules, all inventory mutations pass through `stockService`:

$$\text{Current Stock} = \text{Opening Stock} + \text{Receipts} - \text{Deliveries} + \text{Transfer In} - \text{Transfer Out} \pm \text{Adjustments}$$

#### Invariants Enforced:
1. **Zero Negative Stock:** Transactional rollback if available inventory is insufficient for a delivery or transfer.
2. **ACID Transactions:** Powered by Cloud Firestore transactions (`runTransaction`).
3. **Double-Entry Ledger:** Every stock mutation automatically posts an immutable entry to `stockLedger`.
4. **No Duplicate Implementations:** Other developer modules do not execute manual stock arithmetic; they simply invoke `stockService`.

---

## ⚡ Signature Features

### 1. "Stock Pulse"
A real-time material flow pipeline tracker visualizing the life stages of any batch or consignment:
$$\text{Supplier} \longrightarrow \text{Receipt} \longrightarrow \text{Warehouse} \longrightarrow \text{Transfer} \longrightarrow \text{Location} \longrightarrow \text{Delivery}$$

### 2. "Inventory Story"
A reusable visual narrative timeline component (`<InventoryStory productId={id} />`) that can be embedded inside Product sheets, Receipts, or Deliveries to show the complete human-readable lifecycle of any SKU.

---

## 👥 Team Module Integration Guide

### 📦 Member 2 — Products & Catalog (`src/features/products/`)
- **Import types:** `import { Product, Category } from '@/types';`
- **Database access:** `import { dbService } from '@/services';`
- **Stock queries:** `import { stockService } from '@/services';`
  - Get current stock: `const stock = await stockService.getStock(productId, warehouseId);`
- **Embed Story:** `<InventoryStory productId={product.id} />`

### 🔄 Member 3 — Stock Operations (`src/features/receipts/`, `deliveries/`, `transfers/`, `adjustments/`)
- **Receipt Inwarding:**
  ```ts
  import { stockService } from '@/services';
  await stockService.increaseStock({
    productId,
    warehouseId,
    locationId,
    quantity,
    referenceType: 'RECEIPT',
    referenceId: receiptNumber,
    performedBy: user.id,
    performedByName: user.displayName,
    notes: 'PO Inward Dock Putaway',
  });
  ```
- **Delivery Fulfillment:**
  ```ts
  await stockService.decreaseStock({
    productId,
    warehouseId,
    locationId,
    quantity,
    referenceType: 'DELIVERY',
    referenceId: deliveryNumber,
    performedBy: user.id,
    performedByName: user.displayName,
  });
  ```
- **Inter-Hub Transfers:**
  ```ts
  await stockService.transferStock({
    productId,
    sourceWarehouseId,
    sourceLocationId,
    targetWarehouseId,
    targetLocationId,
    quantity,
    referenceId: transferNumber,
    performedBy: user.id,
    performedByName: user.displayName,
  });
  ```
- **Physical Adjustments (Cycle Counts / Scrap):**
  ```ts
  await stockService.adjustStock({
    productId,
    warehouseId,
    locationId,
    newCountedQuantity,
    reason: 'CYCLE_COUNT', // 'DAMAGED' | 'EXPIRED' | 'THEFT' | 'DATA_CORRECTION'
    referenceId: adjustmentNumber,
    performedBy: user.id,
    performedByName: user.displayName,
  });
  ```

### 📊 Member 4 — Stock Ledger & Analytics (`src/features/ledger/`, `insights/`)
- **Query Ledger:**
  ```ts
  import { stockService } from '@/services';
  const history = await stockService.getStockLedger(productId, warehouseId);
  ```
- **Calculate Real-Time Health:**
  ```ts
  const health = await stockService.calculateInventoryHealth(warehouseId);
  // Returns: { score, status, healthyStockCount, lowStockCount, outOfStockCount, turnoverRatio, recommendations }
  ```

---

## 🔐 Authentication & RBAC

Three predefined roles are supported:
- `ADMIN`: Unrestricted system configuration and master adjustments.
- `INVENTORY_MANAGER`: Inventory management, stock reconciliations, and reordering.
- `WAREHOUSE_STAFF`: Receiving dock putaway and dispatch operations.

### Reusable Guards:
- `<ProtectedRoute>`: Restricts route to authenticated users.
- `<RoleGuard allowedRoles={['ADMIN', 'INVENTORY_MANAGER']}>`: Restricts critical actions.

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (Optional for Demo Mode)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials.
> **Note:** If no credentials are supplied or `VITE_USE_DEMO_MODE=true`, StockSense runs in **Zero-Config Demo Mode** utilizing the realistic GCET Hyderabad industrial seed dataset!

### 3. Start Local Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
