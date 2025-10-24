# Generic Inventory Management Server

A Node.js Express server with TypeScript for managing inventory, stock movements, scans, and supply chain data.

## ✅ **Server Status: RUNNING**

The server is currently running on `http://localhost:4100` with all API endpoints available.

## Features

- **Inventory Management**: CRUD operations for inventory items
- **Stock Movements**: Track all stock in/out/adjustment movements
- **QR Code Scanning**: Process and store scan data
- **Supply Chain**: Track products through the supply chain with Arabic field names
- **Supply Orders**: Manage purchase orders and deliveries
- **CSV Import/Export**: Bulk data operations
- **RESTful API**: Complete API endpoints for all operations
- **MongoDB Integration**: Robust data persistence with Mongoose
- **TypeScript**: Full type safety and IntelliSense support

## Quick Start

### 1. **Server is Already Running** ✅
```bash
# Server is running on http://localhost:4100
curl http://localhost:4100/
```

### 2. **Install MongoDB (Required for Full Functionality)**
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. **Test API Endpoints**
```bash
# Health check
curl http://localhost:4100/health

# Inventory endpoints (requires MongoDB)
curl http://localhost:4100/api/inventory
curl http://localhost:4100/api/inventory/stats
```

## API Endpoints

### **Available Now (Server Running):**
- `GET /` - API information and endpoints
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check

### **Requires MongoDB Connection:**
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PATCH /api/inventory/:id/adjust-stock` - Adjust stock quantity
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/stats` - Get inventory statistics
- `POST /api/inventory/import` - Import from CSV
- `GET /api/inventory/export` - Export to CSV

### **Stock Movements:**
- `GET /api/movements` - Get all stock movements
- `POST /api/movements` - Create new movement
- `GET /api/movements/:id` - Get single movement
- `GET /api/movements/export` - Export movements to CSV

### **QR Code Scans:**
- `GET /api/scans` - Get all scan records
- `POST /api/scans` - Create new scan record
- `POST /api/scans/process-qr` - Process QR code data
- `POST /api/scans/bridge` - Bridge scan data from external sources
- `PATCH /api/scans/:id/status` - Update scan status
- `GET /api/scans/pending` - Get pending scans
- `GET /api/scans/stats` - Get scan statistics
- `GET /api/scans/export` - Export scans to CSV

### **Supply Orders:**
- `GET /api/orders` - Get all supply orders
- `POST /api/orders` - Create new supply order
- `PUT /api/orders/:id` - Update supply order
- `DELETE /api/orders/:id` - Delete supply order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/overdue` - Get overdue orders
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/export` - Export orders to CSV

### **Supply Chain (Arabic Fields):**
- `GET /api/supply-chain` - Get all supply chain records
- `POST /api/supply-chain` - Create new supply chain record
- `PUT /api/supply-chain/:id` - Update supply chain record
- `DELETE /api/supply-chain/:id` - Delete supply chain record
- `GET /api/supply-chain/status/:status` - Get records by status
- `GET /api/supply-chain/product/:skuOrGtin` - Get records by product
- `GET /api/supply-chain/stats` - Get supply chain statistics
- `GET /api/supply-chain/export` - Export to CSV

## Supply Chain Schema (Arabic Fields)

The supply chain model uses Arabic field names as requested:

- `الوقت` - Time
- `المعرف` - ID
- `رمز_SKU` - SKU Code
- `رمز_GTin` - GTIN Code
- `رقم_الدفعة` - Batch Number
- `الرقم_التسلسلي` - Serial Number
- `اسم_المنتج` - Product Name
- `الكمية` - Quantity
- `الوحدة` - Unit
- `الشركة_المصنعة` - Manufacturer
- `بلد_المنشأ` - Origin Country
- `تاريخ_التصنيع` - Manufacture Date
- `تاريخ_الانتهاء` - Expiry Date
- `الحالة_الحالية` - Current Status
- `وسيلة_النقل` - Transport Mode

## Frontend Integration

Your inventory management interface can now connect to these endpoints:

```javascript
// Example API calls for your inventory interface
const API_BASE = 'http://localhost:4100/api';

// Get all inventory items
const items = await fetch(`${API_BASE}/inventory`).then(r => r.json());

// Add new item
const newItem = await fetch(`${API_BASE}/inventory`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'أكياس هدايا',
    type: 'supplies',
    currentStock: 174,
    minimumStock: 40,
    unit: 'قطعة',
    costPerUnit: 1.50,
    location: 'A1-01'
  })
}).then(r => r.json());

// Adjust stock
const adjustment = await fetch(`${API_BASE}/inventory/${itemId}/adjust-stock`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 10,
    notes: 'إضافة مخزون',
    reference_type: 'تعديل يدوي'
  })
}).then(r => r.json());
```

## Environment Variables

```env
NODE_ENV=development
PORT=4100
HOST=localhost
MONGODB_URI=mongodb://localhost:27017/generic_inventory
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
LOG_LEVEL=info
LOG_FORMAT=combined
API_VERSION=v1
API_PREFIX=/api
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

## Database Models

- **InventoryItem**: Core inventory items with SKU, barcode, stock levels
- **StockMovement**: All stock movements (in/out/adjustment)
- **Scan**: QR code scan records with parsed data
- **SupplyOrder**: Purchase orders with items and status tracking
- **SupplyChain**: Supply chain tracking with Arabic field names

## Development Commands

```bash
# Server is already running, but if you need to restart:
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Next Steps

1. **Install MongoDB** to enable full API functionality
2. **Connect your frontend** to the API endpoints
3. **Test the inventory management** features
4. **Use the supply chain endpoints** for Arabic field tracking

The server is ready and waiting for your inventory management interface to connect! 🚀
