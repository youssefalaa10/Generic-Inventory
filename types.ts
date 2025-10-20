import { Blob } from "@google/genai";

export enum Role {
  SuperAdmin = 'Super Admin',
  Perfumer = 'Perfumer',
  Accountant = 'Accountant',
  BranchManager = 'Branch Manager',
  ShopAssistant = 'Shop Assistant',
  EcommerceManager = 'E-commerce Manager',
  Employee = 'Employee',
}

export type Permission = 
  | 'purchases:create' | 'purchases:read' | 'purchases:update' | 'purchases:delete'
  | 'sales:create' | 'sales:read' | 'sales:update' | 'sales:delete'
  | 'products:create' | 'products:read' | 'products:update' | 'products:delete'
  | 'employees:create' | 'employees:read' | 'employees:update' | 'employees:delete'
  | 'licenses:create' | 'licenses:read' | 'licenses:update' | 'licenses:delete'
  | 'branches:create' | 'branches:read' | 'branches:update' | 'branches:delete'
  | 'inventory:read' | 'inventory:transfer' | 'inventory:update' | 'inventory:adjust'
  | 'payroll:manage' | 'payroll:read'
  | 'reports:read:full' | 'reports:read:limited'
  | 'settings:manage'
  | 'manufacturing:create' | 'manufacturing:read' | 'manufacturing:tasks:manage'
  | 'integrations:manage'
  | 'advances:request' | 'advances:manage'
  | 'general_requests:request' | 'general_requests:manage';

export interface User {
  id: number;
  name: string;
  role: Role;
  permissions: Permission[];
  branchId?: number;
}

export interface Project {
  id: number;
  name: string;
}

export interface Branch {
  id: number;
  projectId: number;
  name: string;
}

export interface PurchaseItem {
  id: number;
  productName: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Supplier {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
}

export type Currency = 'KWD' | 'USD' | 'EUR';

export interface Purchase {
  id: number;
  branchId: number;
  brand: 'Arabiva' | 'Generic';
  supplier: Supplier;
  date: string;
  amount: number; // Final amount in KWD
  amountInCurrency: number;
  currency: Currency;
  exchangeRate: number;
  type: 'Local' | 'External';
  description: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  items: PurchaseItem[];
}

export interface SaleItem {
  id: number;
  productName: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'K-Net' | 'Credit' | 'MyFatoorah';

export interface Sale {
  id: number;
  branchId: number;
  brand: 'Arabiva' | 'Generic';
  invoiceNumber: string;
  customerId?: number;
  customerName: string;
  date: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  items: SaleItem[];
  sessionId?: number;
}

export type EmployeeAttachmentType = 'Passport' | 'ID' | 'CV' | 'Other';

export interface EmployeeAttachment {
    id: number;
    name: string;
    type: EmployeeAttachmentType;
    file: File;
    uploadDate: string;
}

export interface EmployeeBenefit {
    title: string;
    description: string;
    icon: string; // Name of the icon component
}

export interface EmployeeData {
    id: number;
    name:string;
    position: string;
    branchId: number;
    salary: number;
    allowances: number;
    advances: number;
    hireDate: string;
    annualLeaveDays: number; // Total entitlement for the year
    attachments?: EmployeeAttachment[];
    benefits?: EmployeeBenefit[];
}

export interface Report {
    name: string;
    description: string;
    requiredPermission: Permission;
}

export interface InvoiceData {
  vendor?: string;
  date?: string;
  amount?: number;
}

export type RenewableCategory = 'License' | 'Vehicle' | 'Permit' | 'Subscription' | 'Other';

export interface RenewableItem {
  id: number;
  category: RenewableCategory;
  name: string;
  identifier: string; // License number, plate number, etc.
  issueDate: string;
  expiryDate: string;
  documentFile?: File;
  remindersSent: {
    [day: number]: boolean;
  };
}

export interface RenewableData {
  category?: RenewableCategory;
  name?: string;
  identifier?: string;
  issueDate?: string;
  expiryDate?: string;
}


export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number; // Per piece for 'pcs', per gram for 'g', per ml for 'ml'
  baseUnit: 'pcs' | 'g' | 'ml';
  productLine?: string; // e.g., "Oud Collection", "Musk Series"
  fragranceNotes?: { // Optional for non-perfume items
    top: string;
    middle: string;
    base: string;
  };
  components?: { productId: number; quantity: number }[];
  barcode?: string;
  density?: number; // g/ml
}

export interface InventoryItem {
  branchId: number;
  productId: number;
  quantity: number;
  minStock: number;
  lotNumber?: string;
  expiryDate?: string;
}

export type AdjustmentReason = 'Damaged Goods' | 'Stock Count Correction' | 'Initial Stock' | 'Return to Supplier' | 'Other';

export interface InventoryAdjustmentLog {
  id: number;
  date: string;
  branchId: number;
  productId: number;
  adjustedByUserId: number;
  oldQuantity: number;
  newQuantity: number;
  reason: AdjustmentReason;
  notes?: string;
}


// HR Module Types
export type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'Unpaid';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: number;
    employeeId: number;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: RequestStatus;
}

export interface AdvanceRequest {
    id: number;
    employeeId: number;
    amount: number;
    reason: string;
    requestDate: string;
    status: RequestStatus;
}

export type GeneralRequestType = 'Salary Certificate' | 'Experience Certificate' | 'Information Update' | 'Other';
export interface GeneralRequest {
    id: number;
    employeeId: number;
    type: GeneralRequestType | string;
    details: string;
    requestDate: string;
    status: RequestStatus;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent';

export interface AttendanceRecord {
    id: number;
    employeeId: number;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    lateMinutes?: number;
}

export interface SalaryPayment {
    id: string; // e.g., "empId-month-year"
    employeeId: number;
    month: number;
    year: number;
    basicSalary: number;
    allowances: number;
    grossSalary: number;
    deductions: {
        advances: number;
        lateness: number;
        absence: number;
        unpaidLeave: number;
        total: number;
    };
    netSalary: number;
    paidDate: string;
    journalEntries: JournalEntry[];
}

export interface JournalEntry {
    account: string;
    debit: number;
    credit: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  branchId?: number;
  projectId?: number;
  addedBy: string;
}

// Finance Module Types
export type ExpenseCategory = 'Utilities' | 'Rent' | 'Salaries' | 'Marketing & Branding' | 'Raw Materials' | 'Packaging' | 'E-commerce Fees' | 'Lab Supplies' | 'Shipping & Delivery' | 'Government Fees' | 'Maintenance' | 'Other';

export interface Expense {
    id: number;
    date: string;
    branchId: number;
    category: ExpenseCategory;
    amount: number;
    description: string;
    paidFromAccountId: number;
}

export interface FinancialAccount {
    id: number;
    name: string;
    type: 'Bank' | 'Cash';
    branchId?: number;
    balance: number;
}

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string; // Account code, e.g., "101-01"
  name: string;
  type: AccountType;
  children?: Account[];
}


export interface POSSession {
  id: number;
  startTime: string;
  endTime?: string;
  status: 'Open' | 'Closed';
  openingBalance: number;
  closingBalance?: number;
  totalSalesValue: number; 
  salesIds: number[];
  branchId: number;
}

// Legacy Manufacturing Module Types - To be replaced
export type ProductionOrderStatus_Legacy = 'Pending' | 'In Progress' | 'Completed';

export interface ProductionOrder_Legacy {
  id: number;
  productId: number; // The composite product being manufactured
  quantity: number; // How many units to produce
  branchId: number;
  status: ProductionOrderStatus_Legacy;
  creationDate: string;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  timestamp: string; // ISO string
  text: string;
}

export type ProductionTaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface ProductionTask {
    id: number;
    name: string;
    productionOrderId: string; // Changed to string to match new ManufacturingOrder ID
    assignedToEmployeeId?: number;
    deadline?: string;
    status: ProductionTaskStatus;
    notes?: string;
    comments?: Comment[];
}


export interface ChatbotDataContext {
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  inventory: InventoryItem[];
  customers: Customer[];
  employees: EmployeeData[];
  branches: Branch[];
  expenses: Expense[];
}

export interface DailyBriefingContext {
  today: string;
  yesterdaySalesTotal: number;
  yesterdayInvoiceCount: number;
  topSellingProducts: { name: string; quantity: number; revenue: number; }[];
  lowStockItemsCount: number;
  criticalLowStockItems: { name: string; quantity: number; minStock: number; }[];
  pendingHRRequests: number;
  upcomingRenewals: { name: string; daysUntilExpiry: number; }[];
}

export interface SuggestedPurchaseOrderItem {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  recommendedQuantity: number;
  reasoning: string;
}

export interface PurchaseOrderSuggestionContext {
  branchName: string;
  forecastDays: number;
  inventory: {
    productId: number;
    productName: string;
    sku: string;
    currentStock: number;
    minStock: number;
    salesVelocityPerDay: number; // calculated from sales data
  }[];
}


// Perfume Manufacturing Types
export type Concentration = "EDT_15" | "EDP_20" | "EXTRAIT_30" | "OIL_100";

export type FormulaLine = {
  id: string;
  materialId: number;
  materialName: string;
  materialSku: string;
  kind: "AROMA_OIL" | "ETHANOL" | "DI_WATER" | "FIXATIVE" | "COLOR" | "ADDITIVE";
  percentage: number; // 0–100
  density?: number; // g/ml (optional)
};

export type ProcessLoss = {
  mixingLossPct: number;
  filtrationLossPct: number;
  fillingLossPct: number;
};

export type QCCheck = {
  appearance: string;
  clarity: "Clear" | "Slight Haze" | "Hazy";
  density?: number;
  refractiveIndex?: number;
  odorMatch: "Pass" | "Borderline" | "Fail";
  stabilityNotes?: string;
  result: "APPROVED" | "REJECTED" | "REWORK";
  attachments?: string[]; // URLs
};

export type PackagingItem = {
  productId: number;
  name: string;
  qtyPerUnit: number; // 1 sprayer/1 cap/2 stickers...
};

export interface ManufacturingOrder {
  id: string; // MO-YYYYMMDD-SEQ
  productName: string;
  manufacturingType: 'INTERNAL' | 'CONTRACT';
  responsibleEmployeeId?: number;
  concentration: Concentration;
  bottleSizeMl: number; // 30/50/100
  unitsRequested: number; // number of bottles
  batchCode: string; // auto-generated
  branchId: number; // Factory/Lab
  manufacturingDate?: string; // ISO
  expiryDate?: string; // ISO
  dueAt?: string; // ISO
  formula: FormulaLine[];
  processLoss: ProcessLoss;
  macerationDays: number;
  chilling?: { hours: number; temperatureC: number };
  filtration?: { stages: number; micron: number };
  qc?: QCCheck;
  packagingItems: PackagingItem[];
  costs: {
    materials: number;
    labor: number;
    overhead: number;
    packaging: number;
    other: number;
    total: number;
    perMl: number;
    perBottle: number;
    suggestedRetail: number;
  };
  yield: {
    theoreticalMl: number;
    expectedMl: number;
    actualMl?: number;
    expectedUnits: number;
    actualUnits?: number;
    yieldPercentage?: number;
  };
  distribution?: { id: string; locationName: string; units: number }[];
  status: "DRAFT" | "IN_PROGRESS" | "MACERATING" | "QC" | "PACKAGING" | "DONE" | "CLOSED";
};


// Integration Types
export interface EcommerceIntegrationSettings {
    isEnabled: boolean;
    apiUrl: string;
    apiKey: string;
    apiSecret: string;
    autoSyncCustomers: boolean;
    autoSyncSales: boolean;
    syncInterval: number; // in minutes
}

export interface PaymentGatewaySettings {
    isEnabled: boolean;
    apiKey: string;
}

export interface WhatsAppSettings {
    isEnabled: boolean;
    apiKey: string;
    phoneNumberId: string;
}

export type WebhookEvent = 'sale.created' | 'customer.created' | 'inventory.low_stock' | 'purchase.created';
export type Webhook = {
    event: WebhookEvent;
    url: string;
    isEnabled: boolean;
}
export interface N8nSettings {
    isEnabled: boolean;
    webhooks: Webhook[];
}

export interface IntegrationSettings {
    openCart: EcommerceIntegrationSettings;
    wooCommerce: EcommerceIntegrationSettings;
    myFatoorah: PaymentGatewaySettings;
    whatsapp: WhatsAppSettings;
    n8n: N8nSettings;
}

// Declare QRCode library from CDN for TypeScript
declare var QRCode: any;