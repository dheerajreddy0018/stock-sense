# StockSense — Intelligent Real-Time Inventory & SLA Engine

> **Modern Modular ES Module Architecture** backed by IndexedDB persistence, interactive SVG sales analytics, 3-tier product ranking, operational SLA tracking, and zero build tool dependencies. Designed for concurrent development by 4 team members with clean Git branch boundaries.

---

## 🌟 Key Features & Capabilities

### 1. Executive Dashboard & Live Sales Performance Graph
* **Stock Health Breakdown**: Live visual gauge showing **Optimal**, **Low Stock Alert**, and **Out of Stock** counts across catalog lines.
* **Weekly Sales Velocity Graph**: Pure, responsive SVG bar & line graph tracking daily units moved and revenue earned from validated deliveries.
* **Real-Time KPIs**: Total registered SKUs, units across all locations, pending deliveries, pending receipts, and reorder alerts.
* **Recent Operations Feed**: Inbound/Outbound feed with quick filtering by operation type (`receipt`, `delivery`, `transfer`, `adjustment`).

### 2. Product Master & 3-Tier Ranking System
Every catalog SKU supports a 3-tier recognition and commission framework:
* **Title Rank (Lifetime / Career Milestone)**:
  * Tiers: **Diamond 💎**, **Platinum 👑**, **Gold 🥇**, **Silver 🥈**, **Bronze 🥉**.
  * Unlocked by cumulative volume or milestone package activations.
* **Pay Rank (Compensation / Margin Tier)**:
  * Tiers: **Diamond**, **Platinum**, **Gold**, **Silver**, **Bronze**.
  * Current payout qualification tier calculated based on active cycle sales performance.
* **Active Rank (Maintenance / Eligibility Status)**:
  * Statuses: **Active (Qualified)**, **Grace Period**, **Inactive**.
  * Indicates minimum activity threshold compliance for earnings distribution.
* **Initial Stock & Location Assignment**:
  * Set optional initial stock quantity and storage bin location during product registration, automatically logged to the ledger.
* **Multi-Filter Data Table**:
  * Filter products by Category, Stock Status, Title Rank, and Active Rank with instant search.

### 3. Categories with Multi-Product Selection & Accordions
* **Interactive Category Modal**:
  * Select multiple products to attach to categories with real-time SKU search, live inventory counts, and "Select All" / "Clear" buttons.
* **Collapsible Accordions**:
  * Clean, collapsible drawers for each category showing associated product cards with unit counts and stock badges, plus an Uncategorized drawer.

### 4. Operations & Scheduled Due Dates (SLA Monitoring)
Operations strictly organized in the workflow hierarchy:
1. **Receipts** (Inbound goods intake from suppliers with scheduled arrival dates)
2. **Deliveries** (Outbound dispatch to customers with fulfillment deadlines)
3. **Transfers** (Inter-warehouse and bin-to-bin internal transit)
4. **Due Dates** *(Centralized SLA Management Hub)*:
   * Aggregates all operations across the warehouse.
   * Urgency cards for **Overdue**, **Due Today**, **Upcoming**, and **Completed**.
   * Color-coded SLA badges: `Overdue (Xd ago)`, `Due Today`, `Due Tomorrow`, `Due in Xd`, `Done On Time`, `Done Late`.
   * Directly inspect, validate, or cancel operations from the Due Dates hub.
5. **Adjustments** (Physical inventory reconciliation with cycle count due dates)

### 5. Product Sales & Rank Analytics (`#/sales-ranks`)
* **Dedicated Analytics Hub**:
  * KPI summary cards: Total Dispatched Revenue, Units Moved, Average Order Value, and Top Title Tier Contribution.
  * Interactive SVG Sales Graph with metric switcher (**Revenue $** vs **Units**) and time range filter (**7 Days** vs **30 Days**).
  * **Revenue Share by Title Rank**: Progress bars showing sales contribution per rank tier.
  * **Leaderboard Table**: Ranked products table showing sales volume, revenue, Title Rank, Pay Rank, and Active Status.
  * One-click CSV export for reporting.

### 6. Traceability & Warehouses
* **Authoritative Stock Ledger**: Immutable double-entry transaction log recording every quantity delta (`before`, `delta`, `after`, timestamp, and user).
* **Automated Reorder Rules**: Minimum stock thresholds with automated badge alerts and notifications.
* **Warehouses & Bins**: Collapsible accordion cards for facilities, bins, and stored SKUs.

---

## 👥 4-Member Team Ownership & Modular Architecture

The application is structured into isolated ES modules allowing 4 developers to work concurrently on separate Git branches without merge conflicts:

| Member | Domain & Ownership | Directory / Files | Git Branch Recommendation |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Core, Integration & Layout** | `src/core/`, `src/components/`, `src/auth/`, `src/router/`, `src/pages/dashboard.js`, `src/pages/profile.js`, `src/app.js`, `src/main.js`, `server.js`, `package.json`, `index.html` | `feature/core-integration` |
| **Member 2** | **Catalog & Products** | `src/pages/products.js`, `src/pages/categories.js` | `feature/products-categories` |
| **Member 3** | **Warehouse Operations & SLA** | `src/pages/receipts.js`, `src/pages/deliveries.js`, `src/pages/transfers.js`, `src/pages/adjustments.js`, `src/pages/dueDates.js` | `feature/warehouse-operations` |
| **Member 4** | **Inventory Intelligence & Audit** | `src/pages/ledger.js`, `src/pages/reorder.js`, `src/pages/warehouses.js`, `src/pages/analytics.js` | `feature/inventory-intelligence` |

### Architecture Principles:
1. **Single Authoritative Stock Engine**: All inventory movements (receipts, deliveries, transfers, adjustments) MUST invoke `StockEngine` in `src/core/stockEngine.js`. No page directly modifies stock tables.
2. **Native ES Modules**: No bundler (Webpack/Vite) required. Code runs natively in modern browsers with standard `import`/`export`.
3. **Clean Inter-Module Contracts**: Pages register their renderers onto `PAGE_RENDERERS` in `src/router/router.js` and use shared UI helpers from `src/components/`.

---

## 📁 Repository Structure

```
stock-sense/
├── index.html                   # Clean, lightweight entry point
├── server.js                    # Zero-dependency Node.js static server with MIME types
├── package.json                 # Scripts and project metadata
├── README.md                    # Architecture and team guidelines
│
├── src/
│   ├── main.js                  # Application bootstrap entry point
│   ├── app.js                   # Application state, route wiring, and init
│   │
│   ├── core/                    # [Member 1] Core Data & Engine Layer
│   │   ├── db.js                # IndexedDB schema, connection & transaction helpers
│   │   ├── repository.js        # Generic CRUD & index repository
│   │   ├── stockEngine.js       # Centralized stock calculator & ledger auditor
│   │   ├── auth.js              # WebCrypto SHA-256 password hashing & sessions
│   │   ├── seed.js              # Comprehensive demo dataset generator
│   │   ├── utils.js             # Formatters, SLA date math, CSV export, ranks
│   │   └── index.js             # Core barrel export
│   │
│   ├── components/              # [Member 1] Shared UI Components
│   │   ├── common.js            # SVG icons and constants
│   │   ├── toast.js             # Toast notifications system
│   │   ├── modal.js             # Dialog, confirmation & detail slip modals
│   │   ├── dataTable.js         # Searchable, filterable, paginated data tables
│   │   ├── lineEditor.js        # Dynamic document line item editor
│   │   ├── sidebar.js           # Navigation bar component
│   │   ├── topbar.js            # Header, user badge & quick action buttons
│   │   ├── layout.js            # Responsive application shell chrome
│   │   └── index.js             # Components barrel export
│   │
│   ├── auth/                    # [Member 1] Authentication Screens
│   │   ├── authShell.js         # Shared auth container layout
│   │   ├── login.js             # Sign-in screen
│   │   ├── signup.js            # Registration screen
│   │   ├── forgotPassword.js    # Password recovery & reset screen
│   │   └── index.js             # Auth barrel export
│   │
│   ├── router/                  # [Member 1] Client-Side Router
│   │   └── router.js            # Hash-based SPA routing engine
│   │
│   ├── pages/                   # Feature Pages
│   │   ├── dashboard.js         # [Member 1] Executive dashboard & KPIs
│   │   ├── profile.js           # [Member 1] Settings & notifications panel
│   │   ├── products.js          # [Member 2] Catalog table & multi-rank editor
│   │   ├── categories.js        # [Member 2] Category manager & product drawers
│   │   ├── receipts.js          # [Member 3] Inbound goods intake
│   │   ├── deliveries.js        # [Member 3] Outbound order fulfillment
│   │   ├── transfers.js         # [Member 3] Inter-warehouse & bin movements
│   │   ├── dueDates.js          # [Member 3] Operations SLA & deadline monitoring
│   │   ├── adjustments.js       # [Member 3] Physical inventory reconciliations
│   │   ├── ledger.js            # [Member 4] Immutable audit log
│   │   ├── reorder.js           # [Member 4] Min-stock alerts & automated rules
│   │   ├── warehouses.js        # [Member 4] Warehouses, aisles & bins
│   │   ├── analytics.js         # [Member 4] Sales analytics & SVG graph
│   │   └── index.js             # Pages barrel export
│   │
│   └── styles/                  # Modular CSS Architecture
│       ├── main.css             # Master CSS bundle
│       ├── variables.css        # Color tokens, typography, dark theme
│       ├── base.css             # Resets, scrollbars, focus rings
│       ├── layout.css           # Shell, sidebar, topbar, mobile drawer
│       ├── components.css       # Buttons, badges, rank pills, cards
│       ├── forms.css            # Input controls, line editor grids
│       ├── tables.css           # Data tables, pagination, zebra stripes
│       ├── modals.css           # Overlays, slips, modals
│       ├── auth.css             # Auth card & branding
│       └── responsive.css       # Breakpoints & print media styles
│
└── scripts/                     # Developer Verification Utilities
    ├── validate_syntax.js       # Automated ES module syntax validator (Node vm)
    ├── test_engine.js           # Intelligence, rank & SLA unit tests
    └── test_stock_engine.js     # End-to-end stock engine & ledger integration test
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or later).
* No external npm package installations or build steps needed.

### Running the Application

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dheerajreddy0018/stock-sense.git
   cd stock-sense
   ```

2. **Start the server**:
   ```bash
   node server.js
   # or
   npm start
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Verification & Testing
Run automated checks from the terminal:
```bash
# Validate ES module syntax across all 38 files
node --experimental-vm-modules scripts/validate_syntax.js

# Test SLA due dates, 3-tier ranks, and sales graph generation
node scripts/test_engine.js

# Test authoritative StockEngine transaction flow (Receipt -> Delivery -> Transfer -> Adjustment -> Ledger)
node scripts/test_stock_engine.js
```

### Demo Accounts
The application automatically seeds a comprehensive demonstration dataset on first load:
* **Administrator**: `admin@stocksense.io` / `admin123`
* **Warehouse Staff**: `staff@stocksense.io` / `staff123`

---

## 📄 License
Licensed under the [MIT License](LICENSE).
