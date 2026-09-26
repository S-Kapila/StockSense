# StockSense — Enterprise Inventory Management System (MVP)

A production-ready Inventory Management Web Application built with **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and a resilient **localStorage mock backend**.

---

## ⚡ Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 (Custom color palette, dark mode support)
- **Icons**: Lucide React
- **Persistence**: `localStorage` Mock Backend with automated seed state

---

## 🚀 Getting Started

### Prerequisites
- Node.js $\ge$ 18
- npm $\ge$ 9

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Open `http://localhost:3000` (or the port indicated in your terminal) in your browser.

---

## 🎯 Features Checklist

### 1. Authentication
- Email / password signup & signin with localStorage token persistence
- **1-Click Demo Evaluation Login**:
  - `Admin` (Sarah Jenkins - Warehouse Admin)
  - `Manager` (David Vance - Inventory Manager)
  - `Operator` (Elena Rostova - Logistics Operator)
- Profile view with token diagnostics and logout

### 2. Dashboard
- **Color-coded KPI Cards**:
  - Total Products (Healthy status)
  - Low Stock Items (Red critical alert)
  - Pending Receipts (Inbound awaiting intake)
  - Pending Deliveries (Outbound awaiting dispatch)
- **Multi-Location Stock Distribution**:
  - Visual distribution across **Main Warehouse**, **Production Floor**, and **Storage Rack**
- **Operations Live Stream**:
  - Status filter tabs: `All`, `Draft`, `Ready`, `Done`
  - Inline 1-click **Receive** and **Dispatch** actions
- **Low Stock Watchlist**:
  - Immediate notification for SKUs below threshold

### 3. Products Module
- Product catalog table with Name, SKU, Category, UOM, and Total Stock
- **Stock by Location**: Exact breakdowns for Main Warehouse, Production Floor, and Storage Rack
- Search products by SKU and Name
- Filter by Category and Stock Level (Healthy, Low Stock Alert, Out of Stock)
- Add, Edit, and Delete products with modal validation

### 4. Receipts (Incoming Stock)
- Create receipt with supplier name, PO number, and line items
- Dynamic item line builder with destination location routing
- Real-time stock replenishment and KPI update upon completing intake
- Itemized manifest inspection modal

### 5. Deliveries (Outgoing Stock)
- Create delivery order with customer name and order number
- Line item builder with source location selection
- **Stock availability validation**: prevents dispatching more than currently available
- Automatic stock deduction and instant KPI sync upon dispatch

### 6. Stock Ledger (Audit Trail)
- Immutable transaction log (`RECEIPT`, `DELIVERY`, `TRANSFER`, `ADJUSTMENT`)
- Records timestamp, reference number, SKU, product, movement details, quantity delta (+/-), and resulting balance
- Filter by transaction type
- **Export to CSV**: Download standard CSV audit reports directly in the browser

### 7. Internal Transfers (Bonus)
- Move stock between warehouse zones without affecting overall inventory totals
- Full source availability validation

### 8. Visual Polish & Settings
- Dark / Light mode toggle
- Responsive desktop and mobile drawer navigation
- Toast notifications for success, warning, error, and info
- **Reset to Sample Data**: One-click restore button in Settings to return to default sample dataset
