/**
 * Backend Types
 * 
 * This file contains all the types exported from the frontend for use in the backend.
 * It ensures type consistency between frontend and backend.
 * 
 * Includes API request and response types for Redux integration.
 */

// User and Authentication Types
export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
  Accountant = 'Accountant',
  Cashier = 'Cashier',
  Supervisor = 'Supervisor',
  InventoryManager = 'InventoryManager',
  ProductionManager = 'ProductionManager',
  SalesManager = 'SalesManager',
  PurchaseManager = 'PurchaseManager',
  HRManager = 'HRManager'
}

export enum Permission {
  // User management
  UserCreate = 'user:create',
  UserRead = 'user:read',
  UserUpdate = 'user:update',
  UserDelete = 'user:delete',
  
  // Product management
  ProductCreate = 'product:create',
  ProductRead = 'product:read',
  ProductUpdate = 'product:update',
  ProductDelete = 'product:delete',
  
  // Inventory management
  InventoryCreate = 'inventory:create',
  InventoryRead = 'inventory:read',
  InventoryUpdate = 'inventory:update',
  InventoryDelete = 'inventory:delete',
  
  // Sales management
  SaleCreate = 'sale:create',
  SaleRead = 'sale:read',
  SaleUpdate = 'sale:update',
  SaleDelete = 'sale:delete',
  
  // Purchase management
  PurchaseCreate = 'purchase:create',
  PurchaseRead = 'purchase:read',
  PurchaseUpdate = 'purchase:update',
  PurchaseDelete = 'purchase:delete',
  
  // Supplier management
  SupplierCreate = 'supplier:create',
  SupplierRead = 'supplier:read',
  SupplierUpdate = 'supplier:update',
  SupplierDelete = 'supplier:delete',
  
  // Customer management
  CustomerCreate = 'customer:create',
  CustomerRead = 'customer:read',
  CustomerUpdate = 'customer:update',
  CustomerDelete = 'customer:delete',
  
  // Report management
  ReportCreate = 'report:create',
  ReportRead = 'report:read',
  
  // Branch management
  BranchCreate = 'branch:create',
  BranchRead = 'branch:read',
  BranchUpdate = 'branch:update',
  BranchDelete = 'branch:delete',
  
  // Project management
  ProjectCreate = 'project:create',
  ProjectRead = 'project:read',
  ProjectUpdate = 'project:update',
  ProjectDelete = 'project:delete',
  
  // Employee management
  EmployeeCreate = 'employee:create',
  EmployeeRead = 'employee:read',
  EmployeeUpdate = 'employee:update',
  EmployeeDelete = 'employee:delete',
  
  // Expense management
  ExpenseCreate = 'expense:create',
  ExpenseRead = 'expense:read',
  ExpenseUpdate = 'expense:update',
  ExpenseDelete = 'expense:delete',
  
  // Finance management
  FinanceCreate = 'finance:create',
  FinanceRead = 'finance:read',
  FinanceUpdate = 'finance:update',
  FinanceDelete = 'finance:delete',
  
  // Manufacturing management
  ManufacturingCreate = 'manufacturing:create',
  ManufacturingRead = 'manufacturing:read',
  ManufacturingUpdate = 'manufacturing:update',
  ManufacturingDelete = 'manufacturing:delete',
  
  // POS management
  POSCreate = 'pos:create',
  POSRead = 'pos:read',
  POSUpdate = 'pos:update',
  POSDelete = 'pos:delete',
  
  // Settings management
  SettingsUpdate = 'settings:update',
  SettingsRead = 'settings:read',
  
  // Supply management
  SuppliesCreate = 'supplies:create',
  SuppliesRead = 'supplies:read',
  SuppliesUpdate = 'supplies:update',
  SuppliesDelete = 'supplies:delete'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  permissions: Permission[];
  branchId?: number;
  projectId?: number;
  isActive: boolean;
  lastLogin?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Completed' | 'On Hold';
  manager: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  manager?: string;
  isHeadOffice: boolean;
  isActive: boolean;
}

// Purchase Types
export interface PurchaseInvoiceItem {
  id: number;
  productId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxId?: number;
  total: number;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

export enum DocStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
  Completed = 'Completed'
}

export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  date: string;
  supplierId: number;
  items: PurchaseInvoiceItem[];
  totalAmount: number;
  status: DocStatus;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  dueDate?: string;
  notes?: string;
  attachment?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestItem {
  id: number;
  productId: number;
  quantity: number;
  estimatedUnitPrice?: number;
  notes?: string;
}

export interface PurchaseRequest {
  id: number;
  requestNumber: string;
  date: string;
  requesterUserId: number;
  branchId: number;
  items: PurchaseRequestItem[];
  status: DocStatus;
  approvedBy?: number;
  approvedAt?: string;
  notes?: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxId?: number;
  total: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  date: string;
  supplierId: number;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: DocStatus;
  expectedDeliveryDate?: string;
  notes?: string;
  attachment?: string;
  purchaseRequestIds?: number[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseReturnItem {
  id: number;
  productId: number;
  quantity: number;
  reason: string;
}

export interface PurchaseReturn {
  id: number;
  returnNumber: string;
  date: string;
  supplierId: number;
  originalInvoiceId: number;
  items: PurchaseReturnItem[];
  totalAmount: number;
  status: DocStatus;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebitNoteItem {
  id: number;
  productId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxId?: number;
  total: number;
}

export interface DebitNote {
  id: number;
  date: string;
  supplierId: number;
  items: DebitNoteItem[];
  amount: number;
  reason: string;
  debitNoteNumber?: string;
  notes?: string;
  purchaseReturnId?: number;
}

export interface RequestForQuotationItem {
  productId: number;
  quantity: number;
}

export interface RequestForQuotation {
  id: number;
  date: string;
  code?: string;
  supplierIds: number[];
  items: RequestForQuotationItem[];
  deadline: string;
  dueDate?: string;
  status: 'Draft' | 'Sent' | 'Closed';
  notes?: string;
  attachment?: string;
  purchaseRequestIds?: number[];
}

export interface PurchaseQuotationItem {
  productId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxId?: number;
  total: number;
}

export interface PurchaseQuotation {
  id: number;
  rfqId: number;
  supplierId: number;
  date: string;
  items: PurchaseQuotationItem[];
  totalAmount: number;
  status: 'Received' | 'Accepted' | 'Rejected';
  notes?: string;
  shippingCost?: number;
  discountAmount?: number;
}

export interface SupplierPayment {
  id: number;
  date: string;
  supplierId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Sales Types
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
  quotationId?: number;
}

export interface SalesQuotationItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesQuotation {
  id: number;
  quoteNumber: string;
  customerId: number;
  date: string;
  expiryDate: string;
  items: SalesQuotationItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
}

export interface SalesReturnItem {
  productId: number;
  quantity: number;
  reason: string;
}

export interface SalesReturn {
  id: number;
  returnNumber: string;
  date: string;
  originalInvoiceId: number;
  customerId: number;
  items: SalesReturnItem[];
  totalReturnedAmount: number;
  status: 'Draft' | 'Returned' | 'Completed';
}

export interface CreditNote {
  id: number;
  noteNumber: string;
  date: string;
  salesReturnId?: number;
  customerId: number;
  amount: number;
  reason: string;
  status: 'Open' | 'Applied' | 'Void';
}

export interface RecurringInvoice {
  id: number;
  customerId: number;
  startDate: string;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  items: SaleItem[]; // Re-use SaleItem
  totalAmount: number;
  nextInvoiceDate: string;
  status: 'Active' | 'Paused' | 'Ended';
}

export interface CustomerPayment {
  id: number;
  paymentNumber: string;
  date: string;
  customerId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  appliedToInvoiceId?: number;
  notes?: string;
}

// Employee Types
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
  name: string;
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

// Report Types
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

// Renewable Items Types
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

// Product Types
export interface Product {
  id: number;
  _id?: string; // For Redux products from API
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  baseUnit: 'pcs' | 'g' | 'ml';
  productLine?: string;
  fragranceNotes?: { top: string; middle: string; base: string; };
  components?: { productId: number; quantity: number }[];
  barcode?: string;
  density?: number; // g/ml
  
  // New detailed fields
  description?: string;
  brand?: string;
  unitTemplate?: string;
  purchasePrice?: number;
  taxId?: number;
  isTaxable?: boolean;
  lowestSellingPrice?: number;
  discountPercent?: number;
  hasExpiryDate?: boolean;
  trackInventory?: boolean;
  trackingType?: 'None' | 'Quantity';
  alertQuantity?: number;
  internalNotes?: string;
  tags?: string;
  status?: 'Active' | 'Inactive';
  supplierProductCode?: string;
  image?: string;
}

// Inventory Types
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

export interface InventoryMovement {
  id: string | number;
  date: string;
  type: string;
  quantityChange: number;
  quantityAfter: number;
  relatedDoc?: string;
  user?: string;
  branchId: number;
}

export interface InventoryVoucher {
  id: string;
  date: string;
  status: 'تمت الموافقة';
  description: string;
  details: string;
  createdBy: string;
  branch: string;
  type: 'up' | 'down';
}

export interface InventoryRequisitionItem {
  productId: number;
  quantity: number;
}

export interface InventoryRequisition {
  id: string;
  date: string;
  type: 'Purchase' | 'Transfer';
  warehouseId: string;
  items: InventoryRequisitionItem[];
  notes?: string;
  attachments?: any[];
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

// Customer Types
export interface Customer {
  id?: number | string; // Can be either number or string (MongoDB _id)
  _id?: string; // MongoDB _id field
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
export enum ExpenseCategory {
  Utilities = 'Utilities',
  Rent = 'Rent',
  Salaries = 'Salaries',
  MarketingBranding = 'Marketing & Branding',
  RawMaterials = 'Raw Materials',
  Packaging = 'Packaging',
  EcommerceFees = 'E-commerce Fees',
  LabSupplies = 'Lab Supplies',
  ShippingDelivery = 'Shipping & Delivery',
  GovernmentFees = 'Government Fees',
  Maintenance = 'Maintenance',
  Other = 'Other'
}

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

export interface GeneralLedgerEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  sourceType: 'Sale' | 'Purchase' | 'Expense' | 'Other';
  sourceId: number | string;
}

export interface JournalVoucherLine {
  id: number;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalVoucher {
  id: number;
  date: string;
  reference: string;
  lines: JournalVoucherLine[];
}

// POS Types
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

// Chatbot Types
export interface ChatbotDataContext {
  sales: Sale[];
  purchases: PurchaseInvoice[];
  products: Product[];
  inventory: InventoryItem[];
  customers: Customer[];
  employees: EmployeeData[];
  branches: Branch[];
  expenses: Expense[];
  suppliers: Supplier[];
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

export interface FormulaSuggestionContext {
  prompt: string;
  rawMaterials: {
    id: number;
    name: string;
    sku: string;
    baseUnit: 'g' | 'ml';
    availableQuantity: number;
  }[];
}

export interface NewProductIdeaContext {
  prompt: string;
  rawMaterials: {
    id: number;
    name: string;
    sku: string;
    baseUnit: 'g' | 'ml';
    availableQuantity: number;
  }[];
}

export interface NewProductIdeaResponse {
  productName: string;
  fragranceNotes: {
    top: string;
    middle: string;
    base: string;
  };
  formula: FormulaLine[];
}

export interface SuggestedPurchaseOrderItem {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  recommendedQuantity: number;
  reasoning: string;
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
}

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

export interface PurchaseApprovalTier {
  id: number;
  minAmount: number;
  approverRole: Role;
}

export interface PurchaseSettings {
  defaultPaymentTermsDays: number;
  defaultShippingPreference: 'Collect' | 'Delivery';
  isApprovalWorkflowEnabled: boolean;
  approvalTiers: PurchaseApprovalTier[];
}

// Supply Chain Types
export interface Supply {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  baseUnit: 'pcs' | 'g' | 'ml' | 'kg' | 'l';
  supplierId: number;
  description?: string;
  density?: number; // g/ml
  minStock?: number;
  reorderPoint?: number;
  leadTime?: number; // days
  createdAt: string;
  updatedAt: string;
}

// Supply Chain Item for incoming materials tracking
export interface SupplyChainItem {
  id: number;
  sku?: string;
  gtin?: string;
  batchNumber?: string;
  serialNumber?: string;
  productName: string;
  quantity: number;
  unit?: string;
  manufacturer?: string;
  originCountry?: string;
  manufactureDate?: string;
  expiryDate?: string;
  currentStatus?: string;
  transportMode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplyInventory {
  id?: number;
  supplyId: number;
  branchId: number;
  quantity: number;
  minStock?: number;
  reorderPoint?: number;
  lastMovementDate?: string;
}

export interface SupplyMovement {
  id: number;
  supplyId: number;
  branchId: number;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  referenceType?: 'PURCHASE' | 'PRODUCTION' | 'INVENTORY_ADJUSTMENT' | 'TRANSFER';
  referenceId?: number;
  notes?: string;
  createdBy: number;
}

// ============================================
// API REQUEST AND RESPONSE TYPES
// ============================================

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================
// AUTHENTICATION API
// ============================================

export namespace AuthAPI {
  // POST /api/auth/register
  export interface RegisterRequest {
    name: string
    email: string
    password: string
    role?: "admin" | "manager" | "employee"
  }

  export interface RegisterResponse {
    success: true
    token: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }

  // POST /api/auth/login
  export interface LoginRequest {
    email: string
    password: string
  }

  export interface LoginResponse {
    success: true
    token: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

// ============================================
// SALES API
// ============================================

export namespace SalesAPI {
  // GET /api/sales
  export interface GetAllSalesResponse extends ApiSuccessResponse<Sale[]> {}

  // POST /api/sales
  export interface CreateSaleRequest extends Omit<Sale, "_id" | "createdAt" | "updatedAt"> {}
  export interface CreateSaleResponse extends ApiSuccessResponse<Sale> {}

  // PUT /api/sales/:id
  export interface UpdateSaleRequest extends Partial<Omit<Sale, "_id" | "createdAt" | "updatedAt">> {}
  export interface UpdateSaleResponse extends ApiSuccessResponse<Sale> {}

  // GET /api/sales/:id
  export interface GetSaleResponse extends ApiSuccessResponse<Sale> {}

  // DELETE /api/sales/:id
  export interface DeleteSaleResponse extends ApiSuccessResponse<{ message: string }> {}
}

// ============================================
// PURCHASE INVOICE API
// ============================================

export namespace PurchaseInvoiceAPI {
  // GET /api/purchaseinvoices
  export interface GetAllPurchaseInvoicesResponse extends ApiSuccessResponse<PurchaseInvoice[]> {}

  // POST /api/purchaseinvoices
  export interface CreatePurchaseInvoiceRequest extends Omit<PurchaseInvoice, "_id" | "createdAt" | "updatedAt"> {}
  export interface CreatePurchaseInvoiceResponse extends ApiSuccessResponse<PurchaseInvoice> {}

  // PUT /api/purchaseinvoices/:id
  export interface UpdatePurchaseInvoiceRequest
    extends Partial<Omit<PurchaseInvoice, "_id" | "createdAt" | "updatedAt">> {}
  export interface UpdatePurchaseInvoiceResponse extends ApiSuccessResponse<PurchaseInvoice> {}

  // GET /api/purchaseinvoices/:id
  export interface GetPurchaseInvoiceResponse extends ApiSuccessResponse<PurchaseInvoice> {}
}

// ============================================
// PURCHASE ORDER API
// ============================================

export namespace PurchaseOrderAPI {
  // GET /api/purchaseorders
  export interface GetAllPurchaseOrdersResponse extends ApiSuccessResponse<PurchaseOrder[]> {}

  // POST /api/purchaseorders
  export interface CreatePurchaseOrderRequest extends Omit<PurchaseOrder, "_id" | "createdAt" | "updatedAt"> {}
  export interface CreatePurchaseOrderResponse extends ApiSuccessResponse<PurchaseOrder> {}

  // PUT /api/purchaseorders/:id
  export interface UpdatePurchaseOrderRequest extends Partial<Omit<PurchaseOrder, "_id" | "createdAt" | "updatedAt">> {}
  export interface UpdatePurchaseOrderResponse extends ApiSuccessResponse<PurchaseOrder> {}
}

// ============================================
// INVENTORY API
// ============================================

export namespace InventoryAPI {
  // GET /api/inventory
  export interface GetAllInventoryResponse extends ApiSuccessResponse<InventoryItem[]> {}

  // GET /api/inventory/branch/:branchId
  export interface GetBranchInventoryResponse extends ApiSuccessResponse<InventoryItem[]> {}

  // POST /api/inventory
  export interface CreateInventoryItemRequest extends Omit<InventoryItem, "_id" | "createdAt" | "updatedAt"> {}
  export interface CreateInventoryItemResponse extends ApiSuccessResponse<InventoryItem> {}

  // PUT /api/inventory/:id
  export interface UpdateInventoryItemRequest extends Partial<Omit<InventoryItem, "_id" | "createdAt" | "updatedAt">> {}
  export interface UpdateInventoryItemResponse extends ApiSuccessResponse<InventoryItem> {}
}

// ============================================
// INVENTORY REQUISITION API
// ============================================

export namespace InventoryRequisitionAPI {
  // GET /api/inventoryrequisitions
  export interface GetAllRequisitionsResponse extends ApiSuccessResponse<InventoryRequisition[]> {}

  // POST /api/inventoryrequisitions
  export interface CreateRequisitionRequest extends Omit<InventoryRequisition, "_id" | "createdAt" | "updatedAt"> {}
  export interface CreateRequisitionResponse extends ApiSuccessResponse<InventoryRequisition> {}

  // PUT /api/inventoryrequisitions/:id
  export interface UpdateRequisitionRequest
    extends Partial<Omit<InventoryRequisition, "_id" | "createdAt" | "updatedAt">> {}
  export interface UpdateRequisitionResponse extends ApiSuccessResponse<InventoryRequisition> {}
}

// ============================================
// SUPPLY CHAIN ITEMS API
// ============================================

export namespace SupplyChainItemsAPI {
  // GET /api/supply-chain
  export interface GetAllSupplyChainItemsResponse extends ApiSuccessResponse<SupplyChainItem[]> {}

  // POST /api/supply-chain
  export interface CreateSupplyChainItemRequest extends Omit<SupplyChainItem, "id" | "created_at" | "updated_at"> {}
  export interface CreateSupplyChainItemResponse extends ApiSuccessResponse<SupplyChainItem> {}

  // PUT /api/supply-chain/:id
  export interface UpdateSupplyChainItemRequest extends Partial<Omit<SupplyChainItem, "id" | "created_at" | "updated_at">> {}
  export interface UpdateSupplyChainItemResponse extends ApiSuccessResponse<SupplyChainItem> {}

  // GET /api/supply-chain/:id
  export interface GetSupplyChainItemResponse extends ApiSuccessResponse<SupplyChainItem> {}

  // DELETE /api/supply-chain/:id
  export interface DeleteSupplyChainItemResponse extends ApiSuccessResponse<{ message: string }> {}
}

// ============================================
// ADDITIONAL API ENDPOINTS
// ============================================

// Common pattern for all entity APIs
interface BaseEntityRequest<T> extends Omit<T, "id" | "_id" | "createdAt" | "updatedAt" | "created_at" | "updated_at"> {}
interface BaseEntityUpdateRequest<T> extends Partial<BaseEntityRequest<T>> {}

// Define a generic API namespace generator for consistent patterns
function createApiNamespace<T>(entityName: string) {
  return {
    [`GetAll${entityName}Response`]: {} as ApiSuccessResponse<T[]>,
    [`Create${entityName}Request`]: {} as BaseEntityRequest<T>,
    [`Create${entityName}Response`]: {} as ApiSuccessResponse<T>,
    [`Update${entityName}Request`]: {} as BaseEntityUpdateRequest<T>,
    [`Update${entityName}Response`]: {} as ApiSuccessResponse<T>,
    [`Get${entityName}Response`]: {} as ApiSuccessResponse<T>,
    [`Delete${entityName}Response`]: {} as ApiSuccessResponse<{ message: string }>
  };
}

// Appointments API
export interface Appointment {
  id: string | number;
  patientId: string | number;
  doctorId: string | number;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  notes?: string;
}

export namespace AppointmentsAPI {
  export interface GetAllAppointmentsResponse extends ApiSuccessResponse<Appointment[]> {}
  export interface CreateAppointmentRequest extends BaseEntityRequest<Appointment> {}
  export interface CreateAppointmentResponse extends ApiSuccessResponse<Appointment> {}
  export interface UpdateAppointmentRequest extends BaseEntityUpdateRequest<Appointment> {}
  export interface UpdateAppointmentResponse extends ApiSuccessResponse<Appointment> {}
  export interface GetAppointmentResponse extends ApiSuccessResponse<Appointment> {}
  export interface DeleteAppointmentResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Blog Posts API
export interface BlogPost {
  id: string | number;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  tags?: string[];
  featured?: boolean;
  imageUrl?: string;
}

export namespace BlogPostsAPI {
  export interface GetAllBlogPostsResponse extends ApiSuccessResponse<BlogPost[]> {}
  export interface CreateBlogPostRequest extends BaseEntityRequest<BlogPost> {}
  export interface CreateBlogPostResponse extends ApiSuccessResponse<BlogPost> {}
  export interface UpdateBlogPostRequest extends BaseEntityUpdateRequest<BlogPost> {}
  export interface UpdateBlogPostResponse extends ApiSuccessResponse<BlogPost> {}
  export interface GetBlogPostResponse extends ApiSuccessResponse<BlogPost> {}
  export interface DeleteBlogPostResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Branches API - Already defined in the main types

// Branch Inventories API
export namespace BranchInventoriesAPI {
  export interface GetAllBranchInventoriesResponse extends ApiSuccessResponse<InventoryItem[]> {}
  export interface CreateBranchInventoryRequest extends BaseEntityRequest<InventoryItem> {}
  export interface CreateBranchInventoryResponse extends ApiSuccessResponse<InventoryItem> {}
  export interface UpdateBranchInventoryRequest extends BaseEntityUpdateRequest<InventoryItem> {}
  export interface UpdateBranchInventoryResponse extends ApiSuccessResponse<InventoryItem> {}
  export interface GetBranchInventoryResponse extends ApiSuccessResponse<InventoryItem> {}
  export interface DeleteBranchInventoryResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Communications API
export interface Communication {
  id: string | number;
  type: 'Email' | 'SMS' | 'Push' | 'InApp';
  recipient: string;
  subject?: string;
  content: string;
  sentAt: string;
  status: 'Sent' | 'Failed' | 'Pending';
  metadata?: Record<string, any>;
}

export namespace CommunicationsAPI {
  export interface GetAllCommunicationsResponse extends ApiSuccessResponse<Communication[]> {}
  export interface CreateCommunicationRequest extends BaseEntityRequest<Communication> {}
  export interface CreateCommunicationResponse extends ApiSuccessResponse<Communication> {}
  export interface UpdateCommunicationRequest extends BaseEntityUpdateRequest<Communication> {}
  export interface UpdateCommunicationResponse extends ApiSuccessResponse<Communication> {}
  export interface GetCommunicationResponse extends ApiSuccessResponse<Communication> {}
  export interface DeleteCommunicationResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Contact Us API
export interface ContactUs {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
  status: 'New' | 'InProgress' | 'Resolved';
}

export namespace ContactUsAPI {
  export interface GetAllContactUsResponse extends ApiSuccessResponse<ContactUs[]> {}
  export interface CreateContactUsRequest extends BaseEntityRequest<ContactUs> {}
  export interface CreateContactUsResponse extends ApiSuccessResponse<ContactUs> {}
  export interface UpdateContactUsRequest extends BaseEntityUpdateRequest<ContactUs> {}
  export interface UpdateContactUsResponse extends ApiSuccessResponse<ContactUs> {}
  export interface GetContactUsResponse extends ApiSuccessResponse<ContactUs> {}
  export interface DeleteContactUsResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Credit Notes API - Already defined in the main types

// Customer Payments API - Already defined in the main types

// Customers API - Already defined in the main types

// Departments API
export interface Department {
  id: string | number;
  name: string;
  description?: string;
  managerId?: string | number;
  parentDepartmentId?: string | number;
}

export namespace DepartmentsAPI {
  export interface GetAllDepartmentsResponse extends ApiSuccessResponse<Department[]> {}
  export interface CreateDepartmentRequest extends BaseEntityRequest<Department> {}
  export interface CreateDepartmentResponse extends ApiSuccessResponse<Department> {}
  export interface UpdateDepartmentRequest extends BaseEntityUpdateRequest<Department> {}
  export interface UpdateDepartmentResponse extends ApiSuccessResponse<Department> {}
  export interface GetDepartmentResponse extends ApiSuccessResponse<Department> {}
  export interface DeleteDepartmentResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Doctors API
export interface Doctor {
  id: string | number;
  name: string;
  specialization: string;
  licenseNumber: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  availability?: {
    days: string[];
    hours: string;
  };
}

export namespace DoctorsAPI {
  export interface GetAllDoctorsResponse extends ApiSuccessResponse<Doctor[]> {}
  export interface CreateDoctorRequest extends BaseEntityRequest<Doctor> {}
  export interface CreateDoctorResponse extends ApiSuccessResponse<Doctor> {}
  export interface UpdateDoctorRequest extends BaseEntityUpdateRequest<Doctor> {}
  export interface UpdateDoctorResponse extends ApiSuccessResponse<Doctor> {}
  export interface GetDoctorResponse extends ApiSuccessResponse<Doctor> {}
  export interface DeleteDoctorResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Drinks API
export interface Drink {
  id: string | number;
  name: string;
  category: string;
  price: number;
  ingredients?: string[];
  available: boolean;
}

export namespace DrinksAPI {
  export interface GetAllDrinksResponse extends ApiSuccessResponse<Drink[]> {}
  export interface CreateDrinkRequest extends BaseEntityRequest<Drink> {}
  export interface CreateDrinkResponse extends ApiSuccessResponse<Drink> {}
  export interface UpdateDrinkRequest extends BaseEntityUpdateRequest<Drink> {}
  export interface UpdateDrinkResponse extends ApiSuccessResponse<Drink> {}
  export interface GetDrinkResponse extends ApiSuccessResponse<Drink> {}
  export interface DeleteDrinkResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Employees API - Already defined in the main types

// Expenses API - Already defined in the main types

// Financial Accounts API - Already defined in the main types

// Inventory Items API - Already defined in the main types

// Inventory Requisitions API - Already defined in the main types

// Inventory Vouchers API - Already defined in the main types

// Manufacturing Orders API - Already defined in the main types

// Newsletter API
export interface Newsletter {
  id: string | number;
  title: string;
  content: string;
  sentDate: string;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
}

export namespace NewsletterAPI {
  export interface GetAllNewslettersResponse extends ApiSuccessResponse<Newsletter[]> {}
  export interface CreateNewsletterRequest extends BaseEntityRequest<Newsletter> {}
  export interface CreateNewsletterResponse extends ApiSuccessResponse<Newsletter> {}
  export interface UpdateNewsletterRequest extends BaseEntityUpdateRequest<Newsletter> {}
  export interface UpdateNewsletterResponse extends ApiSuccessResponse<Newsletter> {}
  export interface GetNewsletterResponse extends ApiSuccessResponse<Newsletter> {}
  export interface DeleteNewsletterResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Nurses API
export interface Nurse {
  id: string | number;
  name: string;
  licenseNumber: string;
  department: string;
  shift: 'Morning' | 'Evening' | 'Night';
  contactInfo: {
    email: string;
    phone: string;
  };
}

export namespace NursesAPI {
  export interface GetAllNursesResponse extends ApiSuccessResponse<Nurse[]> {}
  export interface CreateNurseRequest extends BaseEntityRequest<Nurse> {}
  export interface CreateNurseResponse extends ApiSuccessResponse<Nurse> {}
  export interface UpdateNurseRequest extends BaseEntityUpdateRequest<Nurse> {}
  export interface UpdateNurseResponse extends ApiSuccessResponse<Nurse> {}
  export interface GetNurseResponse extends ApiSuccessResponse<Nurse> {}
  export interface DeleteNurseResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Pages Content API
export interface PageContent {
  id: string | number;
  pageKey: string;
  title: string;
  content: string;
  metaDescription?: string;
  lastUpdated: string;
  publishStatus: 'Draft' | 'Published';
}

export namespace PagesContentAPI {
  export interface GetAllPagesContentResponse extends ApiSuccessResponse<PageContent[]> {}
  export interface CreatePageContentRequest extends BaseEntityRequest<PageContent> {}
  export interface CreatePageContentResponse extends ApiSuccessResponse<PageContent> {}
  export interface UpdatePageContentRequest extends BaseEntityUpdateRequest<PageContent> {}
  export interface UpdatePageContentResponse extends ApiSuccessResponse<PageContent> {}
  export interface GetPageContentResponse extends ApiSuccessResponse<PageContent> {}
  export interface DeletePageContentResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Products API - Already defined in the main types

// Profiles API
export interface Profile {
  id: string | number;
  userId: string | number;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: Record<string, any>;
}

export namespace ProfilesAPI {
  export interface GetAllProfilesResponse extends ApiSuccessResponse<Profile[]> {}
  export interface CreateProfileRequest extends BaseEntityRequest<Profile> {}
  export interface CreateProfileResponse extends ApiSuccessResponse<Profile> {}
  export interface UpdateProfileRequest extends BaseEntityUpdateRequest<Profile> {}
  export interface UpdateProfileResponse extends ApiSuccessResponse<Profile> {}
  export interface GetProfileResponse extends ApiSuccessResponse<Profile> {}
  export interface DeleteProfileResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Prompts API
export interface Prompt {
  id: string | number;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  createdBy: string | number;
  createdAt: string;
}

export namespace PromptsAPI {
  export interface GetAllPromptsResponse extends ApiSuccessResponse<Prompt[]> {}
  export interface CreatePromptRequest extends BaseEntityRequest<Prompt> {}
  export interface CreatePromptResponse extends ApiSuccessResponse<Prompt> {}
  export interface UpdatePromptRequest extends BaseEntityUpdateRequest<Prompt> {}
  export interface UpdatePromptResponse extends ApiSuccessResponse<Prompt> {}
  export interface GetPromptResponse extends ApiSuccessResponse<Prompt> {}
  export interface DeletePromptResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Purchase Invoices API - Already defined in the main types

// Recurring Invoices API - Already defined in the main types

// Sales API - Already defined in the main types

// Sales Quotations API - Already defined in the main types

// Sales Returns API - Already defined in the main types

// Scans API
export interface Scan {
  id: string | number;
  patientId: string | number;
  type: string;
  date: string;
  result: string;
  doctorId: string | number;
  notes?: string;
  imageUrl?: string;
}

export namespace ScansAPI {
  export interface GetAllScansResponse extends ApiSuccessResponse<Scan[]> {}
  export interface CreateScanRequest extends BaseEntityRequest<Scan> {}
  export interface CreateScanResponse extends ApiSuccessResponse<Scan> {}
  export interface UpdateScanRequest extends BaseEntityUpdateRequest<Scan> {}
  export interface UpdateScanResponse extends ApiSuccessResponse<Scan> {}
  export interface GetScanResponse extends ApiSuccessResponse<Scan> {}
  export interface DeleteScanResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Stock Adjustments API
export interface StockAdjustment {
  id: string | number;
  productId: string | number;
  branchId: string | number;
  quantity: number;
  reason: string;
  adjustedBy: string | number;
  date: string;
  notes?: string;
}

export namespace StockAdjustmentsAPI {
  export interface GetAllStockAdjustmentsResponse extends ApiSuccessResponse<StockAdjustment[]> {}
  export interface CreateStockAdjustmentRequest extends BaseEntityRequest<StockAdjustment> {}
  export interface CreateStockAdjustmentResponse extends ApiSuccessResponse<StockAdjustment> {}
  export interface UpdateStockAdjustmentRequest extends BaseEntityUpdateRequest<StockAdjustment> {}
  export interface UpdateStockAdjustmentResponse extends ApiSuccessResponse<StockAdjustment> {}
  export interface GetStockAdjustmentResponse extends ApiSuccessResponse<StockAdjustment> {}
  export interface DeleteStockAdjustmentResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Stock Movements API
export interface StockMovement {
  id: string | number;
  productId: string | number;
  fromBranchId?: string | number;
  toBranchId?: string | number;
  quantity: number;
  type: 'Transfer' | 'Adjustment' | 'Sale' | 'Purchase' | 'Return';
  referenceId?: string | number;
  date: string;
  notes?: string;
}

export namespace StockMovementsAPI {
  export interface GetAllStockMovementsResponse extends ApiSuccessResponse<StockMovement[]> {}
  export interface CreateStockMovementRequest extends BaseEntityRequest<StockMovement> {}
  export interface CreateStockMovementResponse extends ApiSuccessResponse<StockMovement> {}
  export interface UpdateStockMovementRequest extends BaseEntityUpdateRequest<StockMovement> {}
  export interface UpdateStockMovementResponse extends ApiSuccessResponse<StockMovement> {}
  export interface GetStockMovementResponse extends ApiSuccessResponse<StockMovement> {}
  export interface DeleteStockMovementResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Suppliers API - Already defined in the main types

// Supply Chains API
export namespace SupplyChainsAPI {
  export interface GetAllSupplyChainsResponse extends ApiSuccessResponse<SupplyChainItem[]> {}
  export interface CreateSupplyChainRequest extends BaseEntityRequest<SupplyChainItem> {}
  export interface CreateSupplyChainResponse extends ApiSuccessResponse<SupplyChainItem> {}
  export interface UpdateSupplyChainRequest extends BaseEntityUpdateRequest<SupplyChainItem> {}
  export interface UpdateSupplyChainResponse extends ApiSuccessResponse<SupplyChainItem> {}
  export interface GetSupplyChainResponse extends ApiSuccessResponse<SupplyChainItem> {}
  export interface DeleteSupplyChainResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Supply Orders API
export interface SupplyOrder {
  id: string | number;
  supplierId: string | number;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: {
    productId: string | number;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  notes?: string;
}

export namespace SupplyOrdersAPI {
  export interface GetAllSupplyOrdersResponse extends ApiSuccessResponse<SupplyOrder[]> {}
  export interface CreateSupplyOrderRequest extends BaseEntityRequest<SupplyOrder> {}
  export interface CreateSupplyOrderResponse extends ApiSuccessResponse<SupplyOrder> {}
  export interface UpdateSupplyOrderRequest extends BaseEntityUpdateRequest<SupplyOrder> {}
  export interface UpdateSupplyOrderResponse extends ApiSuccessResponse<SupplyOrder> {}
  export interface GetSupplyOrderResponse extends ApiSuccessResponse<SupplyOrder> {}
  export interface DeleteSupplyOrderResponse extends ApiSuccessResponse<{ message: string }> {}
}

// Users API
export namespace UsersAPI {
  export interface GetAllUsersResponse extends ApiSuccessResponse<User[]> {}
  export interface CreateUserRequest extends BaseEntityRequest<User> {}
  export interface CreateUserResponse extends ApiSuccessResponse<User> {}
  export interface UpdateUserRequest extends BaseEntityUpdateRequest<User> {}
  export interface UpdateUserResponse extends ApiSuccessResponse<User> {}
  export interface GetUserResponse extends ApiSuccessResponse<User> {}
  export interface DeleteUserResponse extends ApiSuccessResponse<{ message: string }> {}
}
