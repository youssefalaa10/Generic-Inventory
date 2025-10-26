
export enum Role {
  SuperAdmin = 'SuperAdmin',
  Perfumer = 'Perfumer',
  Accountant = 'Accountant',
  BranchManager = 'BranchManager',
  ShopAssistant = 'ShopAssistant',
  EcommerceManager = 'EcommerceManager',
  Employee = 'Employee',
}

export type Permission = 
  | 'all'
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
  | 'general_requests:request' | 'general_requests:manage'
  | 'supplychain:read' | 'supplychain:write';

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
  project?: string;
  code?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    manager?: string;
  };
  status?: 'active' | 'inactive' | 'suspended';
  openingDate?: string;
  closingDate?: string;
  description?: string;
  businessType?: 'retail' | 'wholesale' | 'warehouse' | 'office' | 'factory' | 'lab';
  capacity?: {
    maxEmployees?: number;
    maxInventory?: number;
    maxCustomers?: number;
  };
  budget?: {
    monthly?: number;
    annual?: number;
  };
  operatingHours?: {
    monday?: { open: string; close: string; isOpen: boolean };
    tuesday?: { open: string; close: string; isOpen: boolean };
    wednesday?: { open: string; close: string; isOpen: boolean };
    thursday?: { open: string; close: string; isOpen: boolean };
    friday?: { open: string; close: string; isOpen: boolean };
    saturday?: { open: string; close: string; isOpen: boolean };
    sunday?: { open: string; close: string; isOpen: boolean };
  };
  createdBy?: string;
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseInvoiceItem {
  id: number;
  productName: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
  discountPercent?: number;
  taxPercent?: number;
}

export interface Supplier {
    id: number;
    code?: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    balance: number; // Positive for money owed to them, negative for credit
}

export type Currency = 'KWD' | 'USD' | 'EUR';

export type DocStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Confirmed' | 'Billed' | 'Paid' | 'Overdue' | 'Returned' | 'Cancelled' | 'Closed' | 'Sent' | 'Accepted' | 'Expired' | 'Open' | 'Applied' | 'Void' | 'Active' | 'Paused' | 'Ended' | 'Completed';


export interface PurchaseInvoice {
  id: number;
  branchId: number;
  brand: 'Arabiva' | 'Generic';
  supplierId: number;
  date: string;
  amount: number; // Final amount in KWD
  amountInCurrency: number;
  currency: Currency;
  exchangeRate: number;
  type: 'Local' | 'External';
  description: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  items: PurchaseInvoiceItem[];
  purchaseOrderId?: number;
  notes?: string;
  attachments?: string;
  templateId?: string;
}

export interface PurchaseRequestItem {
    productId: number;
    quantity: number;
    notes?: string;
}
export interface PurchaseRequest {
    id: number;
    name?: string; // "مسمى"
    date: string;
    dueDate?: string;
    requestedByUserId: number;
    branchId: number;
    items: PurchaseRequestItem[];
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Ordered';
    notes?: string;
    attachment?: string;
}

export interface PurchaseOrderItem {
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
    date: string;
    supplierId: number;
    items: PurchaseOrderItem[];
    totalAmount: number;
    status: 'Draft' | 'Confirmed' | 'Billed' | 'Completed' | 'Cancelled';
    quotationId?: number;
    notes?: string;
    shippingCost?: number;
    discountAmount?: number;
    templateId?: string;
    validUntil?: string;
    currency?: Currency;
}

export interface PurchaseReturnItem {
    productId: number;
    quantity: number;
    reason: string;
    description?: string;
    unitPrice: number;
    discountPercent?: number;
    taxId?: number;
    total: number;
}
export interface PurchaseReturn {
    id: number;
    date: string;
    supplierId: number;
    returnNumber?: string;
    items: PurchaseReturnItem[];
    totalReturnedAmount: number;
    status: 'Draft' | 'Returned';
    notes?: string;
    shippingCost?: number;
    discountAmount?: number;
    purchaseInvoiceId?: number; // Link to original invoice
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
  source?: 'In-Store' | 'Website' | string;
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
  _id?: string; // For Redux products from API
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  baseUnit: 'pcs' | 'g' | 'ml';
  productLine?: string;
  fragranceNotes?: { top: string; middle: string; base: string; };
  components?: { productId: number; quantity: number; note?: string }[];
  variants?: { name: string; type: 'single' | 'multi'; options: string[] }[];
  barcode?: string;
  density?: number; // g/ml
  supplierId?: number;
  
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
    warehouseId: number;
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
    ai?: { isEnabled: boolean; provider: string };
}

// WhatsApp logs
export interface WhatsappLog {
  id: number;
  customerId: number;
  date: string;
  message: string;
  status: 'Sent' | 'Delivered' | 'Read';
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

// Declare QRCode library from CDN for TypeScript
declare var QRCode: any;