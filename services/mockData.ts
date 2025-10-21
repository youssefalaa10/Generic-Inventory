// FIX: Added RecurringInvoice to the import list.
// FIX: Added InventoryVoucher and InventoryRequisition to import to support new mock data.
import { User, Role, Permission, Project, Branch, PurchaseInvoice, Sale, EmployeeData, RenewableItem, Product, InventoryItem, LeaveRequest, AttendanceRecord, Customer, FinancialAccount, Expense, POSSession, ProductionOrder_Legacy, InventoryAdjustmentLog, ProductionTask, ManufacturingOrder, Account, IntegrationSettings, WebhookEvent, AdvanceRequest, GeneralRequest, Supplier, PurchaseRequest, PurchaseOrder, PurchaseReturn, SupplierPayment, DebitNote, RequestForQuotation, PurchaseQuotation, ExpenseCategory, SalesQuotation, SalesReturn, CreditNote, CustomerPayment, RecurringInvoice, InventoryVoucher, InventoryRequisition, PurchaseSettings, JournalVoucher } from '../types';
import { PERMISSIONS } from '../constants';

export const USERS: User[] = [
    { id: 1, name: 'أحمد (المالك)', role: Role.SuperAdmin, permissions: PERMISSIONS[Role.SuperAdmin] },
    { id: 2, name: 'خالد (صانع عطور)', role: Role.Perfumer, permissions: PERMISSIONS[Role.Perfumer], branchId: 4 },
    { id: 3, name: 'علي (محاسب)', role: Role.Accountant, permissions: PERMISSIONS[Role.Accountant] },
    { id: 4, name: 'سارة (مدير فرع)', role: Role.BranchManager, permissions: PERMISSIONS[Role.BranchManager], branchId: 1 },
    { id: 5, name: 'محمد (بائع)', role: Role.ShopAssistant, permissions: PERMISSIONS[Role.ShopAssistant], branchId: 1 },
    { id: 6, name: 'نورة (مديرة تسويق)', role: Role.EcommerceManager, permissions: PERMISSIONS[Role.EcommerceManager], branchId: 4 },
    { id: 7, name: 'منيرة (موظفة)', role: Role.Employee, permissions: PERMISSIONS[Role.Employee], branchId: 1 },
];

export const PROJECTS: Project[] = [
    { id: 1, name: 'Generic Perfumes' },
    { id: 2, name: 'Arabiva' },
];

export const BRANCHES: Branch[] = [
    { id: 1, projectId: 2, name: 'Arabiva - السالمية' },
    { id: 2, projectId: 2, name: 'Arabiva - الفحيحيل' },
    { id: 3, projectId: 2, name: 'Arabiva - الجهراء' },
    { id: 4, projectId: 1, name: 'Generic - Online & Manufacturing' }
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 1, name: 'مورد العطور الدولي', contactPerson: 'علي رضا', email: 'ali.reza@international-perfumes.com', phone: '+971 4 123 4567', address: 'دبي, الإمارات العربية المتحدة', balance: 3500 },
    { id: 2, name: 'مصنع الزجاجيات المحلي', contactPerson: 'سالم مبارك', email: 'salem@kuwait-glass.com', phone: '+965 2222 3333', address: 'الصليبية, الكويت', balance: 0 },
    { id: 3, name: 'مطابع النخبة', contactPerson: 'فاطمة أحمد', email: 'info@elite-print.kw', phone: '+965 1800 123', address: 'الشويخ الصناعية, الكويت', balance: -200 }, // Credit balance
];


export const PRODUCTS: Product[] = [
    // Raw Materials - Oils
    { id: 1, name: 'زيت الورد الدمشقي', sku: 'RM-OIL-001', category: 'Raw Material', unitPrice: 15, baseUnit: 'g', density: 0.98, trackInventory: true, hasExpiryDate: true },
    { id: 2, name: 'زيت العود الكمبودي', sku: 'RM-OIL-002', category: 'Raw Material', unitPrice: 40, baseUnit: 'g', density: 0.95, trackInventory: true, hasExpiryDate: true },
    { id: 3, name: 'زيت المسك الأبيض', sku: 'RM-OIL-003', category: 'Raw Material', unitPrice: 5, baseUnit: 'g', density: 1.05, trackInventory: true, hasExpiryDate: true },
    { id: 102, name: 'زيت العنبر والفانيلا', sku: 'RM-OIL-004', category: 'Raw Material', unitPrice: 8, baseUnit: 'g', density: 1.02, trackInventory: true, hasExpiryDate: true },

    // Raw Materials - Chemicals
    { id: 7, name: 'كحول عطور 96%', sku: 'RM-CHEM-001', category: 'Raw Material', unitPrice: 0.1, baseUnit: 'ml', density: 0.82, trackInventory: true },
    { id: 101, name: 'ماء مقطر', sku: 'RM-CHEM-002', category: 'Raw Material', unitPrice: 0.01, baseUnit: 'ml', density: 1.0, trackInventory: true },
    { id: 103, name: 'مثبت - مسك كيتون', sku: 'RM-CHEM-003', category: 'Raw Material', unitPrice: 0.2, baseUnit: 'g', density: 1.32, trackInventory: true },
    
    // Packaging
    { id: 4, name: 'زجاجة عطر 50مل (شفاف)', sku: 'PKG-BTL-001', category: 'Packaging', unitPrice: 2.5, baseUnit: 'pcs', trackInventory: true },
    { id: 5, name: 'زجاجة عطر 100مل (أسود)', sku: 'PKG-BTL-002', category: 'Packaging', unitPrice: 3.5, baseUnit: 'pcs', trackInventory: true },
    { id: 6, name: 'علبة كرتون فاخرة (أسود)', sku: 'PKG-BOX-001', category: 'Packaging', unitPrice: 1, baseUnit: 'pcs', trackInventory: true },
    { id: 201, name: 'بخاخ ذهبي 18مم', sku: 'PKG-SPR-001', category: 'Packaging', unitPrice: 0.25, baseUnit: 'pcs', trackInventory: true },
    { id: 202, name: 'غطاء مغناطيسي أسود', sku: 'PKG-CAP-001', category: 'Packaging', unitPrice: 0.4, baseUnit: 'pcs', trackInventory: true },
    
    // Finished Goods - Arabiva
    { 
        id: 8, 
        name: 'Arabiva Oud Royal 50ml',
        productLine: "Oud Collection",
        fragranceNotes: { top: 'Saffron', middle: 'Rose, Oud', base: 'Amber, Musk' },
        sku: 'ARB-FG-001', 
        category: 'Finished Good', 
        unitPrice: 45,
        baseUnit: 'pcs',
        trackInventory: true,
        hasExpiryDate: true,
        components: [
            { productId: 2, quantity: 3 },  // 3g Oud
            { productId: 1, quantity: 1 },  // 1g Rose
            { productId: 7, quantity: 46 }, // 46ml Alcohol
            { productId: 4, quantity: 1 },  // 1 50ml Bottle
            { productId: 6, quantity: 1 },  // 1 Luxury Box
            { productId: 201, quantity: 1 }, // 1 Sprayer
        ]
    },
    // Finished Goods - Generic
    { 
        id: 9, 
        name: 'Generic Pure Musk Oil 12ml', 
        productLine: "Pure Oils",
        fragranceNotes: { top: 'White Musk', middle: 'Powdery Notes', base: 'Sandalwood' },
        sku: 'GEN-FG-001', 
        category: 'Finished Good', 
        unitPrice: 12,
        baseUnit: 'pcs',
        trackInventory: true,
        hasExpiryDate: true,
        // This is a simple oil, but packaging is still a component
        components: [
            { productId: 3, quantity: 12 },  // 12g White Musk
        ]
    },
];

export const INVENTORY: InventoryItem[] = [
    // Branch 1: Arabiva - السالمية
    { branchId: 1, productId: 8, quantity: 50, minStock: 10, expiryDate: '2025-06-30' }, // Arabiva Oud Royal
    
    // Branch 4: Generic - Online & Manufacturing
    { branchId: 4, productId: 1, quantity: 5000, minStock: 1000, expiryDate: '2026-01-15' }, // Rose Oil
    { branchId: 4, productId: 2, quantity: 2500, minStock: 500, expiryDate: '2025-09-01' }, // Oud Oil
    { branchId: 4, productId: 3, quantity: 10000, minStock: 2000 }, // Musk Oil - no expiry
    { branchId: 4, productId: 7, quantity: 50000, minStock: 10000 }, // Alcohol - no expiry
    { branchId: 4, productId: 4, quantity: 2000, minStock: 500 }, // 50ml Bottle
    { branchId: 4, productId: 5, quantity: 1500, minStock: 500 }, // 100ml Bottle
    { branchId: 4, productId: 6, quantity: 5000, minStock: 1000 }, // Box
    { branchId: 4, productId: 9, quantity: 200, minStock: 50, expiryDate: '2025-07-20' }, // Generic Pure Musk Oil
];

export const INVENTORY_ADJUSTMENT_LOGS: InventoryAdjustmentLog[] = [];

export const CUSTOMERS: Customer[] = [
  { id: 1, name: 'شركة الأفق للتجارة', email: 'contact@alofoq.com', phone: '+96522445566', address: 'مدينة الكويت، برج التجارية', balance: 1500.50, branchId: 1, projectId: 2, addedBy: 'سارة (مدير فرع)' },
  { id: 2, name: 'مؤسسة النور للعطور', email: 'sales@alnoor-perfumes.kw', phone: '+96599887766', address: 'حولي، شارع تونس', balance: -250.00, branchId: 4, projectId: 1, addedBy: 'Automatic' },
  { id: 3, name: 'محلات العاصمة', email: 'info@capitalstores.com', phone: '+96555112233', address: 'الفروانية، مجمع غاليريا', balance: 0, branchId: 2, projectId: 2, addedBy: 'محمد (بائع)' },
  { id: 4, name: 'زبون نقدي عام', email: 'cash@customer.com', phone: 'N/A', address: 'N/A', balance: 0, addedBy: 'System' },
];


export const MOCK_PURCHASE_INVOICES: PurchaseInvoice[] = [
    { 
        id: 1, branchId: 4, brand: 'Generic', supplierId: 1, 
        date: '2024-03-15', 
        amountInCurrency: 37000,
        currency: 'USD',
        exchangeRate: 0.30,
        amount: 11100, // 37000 USD * 0.30 = 11,100 KWD
        type: 'External', 
        description: 'شحنة زيوت عطرية للمصنع', 
        paymentStatus: 'Paid',
        items: [
            { id: 1, productName: 'زيت الورد الدمشقي', productId: 1, quantity: 1000, unitPrice: 10, total: 10000 },
            { id: 2, productName: 'زيت العود الكمبودي', productId: 2, quantity: 500, unitPrice: 35, total: 17500 },
        ]
    },
    { 
        id: 2, branchId: 4, brand: 'Generic', supplierId: 2, 
        date: '2024-03-20',
        amountInCurrency: 3500,
        currency: 'KWD',
        exchangeRate: 1,
        amount: 3500, 
        type: 'Local', 
        description: 'زجاجات عطور للتصنيع', 
        paymentStatus: 'Pending',
        items: [
            { id: 4, productName: 'زجاجة عطر 50مل (شفاف)', productId: 4, quantity: 1000, unitPrice: 2.5, total: 2500 },
        ]
    },
];

export const MOCK_PURCHASE_REQUESTS: PurchaseRequest[] = [
    { id: 1, date: '2024-07-20', requestedByUserId: 2, branchId: 4, items: [{ productId: 1, quantity: 500, notes: 'Urgent for new batch' }], status: 'Approved' },
    { id: 2, date: '2024-07-22', requestedByUserId: 4, branchId: 1, items: [{ productId: 6, quantity: 1000 }], status: 'Pending Approval' },
];

export const MOCK_RFQS: RequestForQuotation[] = [
    { id: 1, date: '2024-07-21', purchaseRequestIds: [1], supplierIds: [1, 2], items: [{ productId: 1, quantity: 500 }], deadline: '2024-07-28', status: 'Sent' }
];
export const MOCK_QUOTATIONS: PurchaseQuotation[] = [
    { id: 1, rfqId: 1, supplierId: 1, date: '2024-07-23', items: [{ productId: 1, quantity: 500, unitPrice: 14.5, total: 7250 }], totalAmount: 7250, status: 'Received' }
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    { id: 1001, date: '2024-07-21', supplierId: 1, items: [{ productId: 1, quantity: 500, unitPrice: 14.5, total: 7250 }], totalAmount: 7250, status: 'Confirmed' },
    { id: 1002, date: '2024-07-25', supplierId: 2, items: [{ productId: 4, quantity: 2000, unitPrice: 2.4, total: 4800 }], totalAmount: 4800, status: 'Draft' },
];

export const MOCK_PURCHASE_RETURNS: PurchaseReturn[] = [];
export const MOCK_DEBIT_NOTES: DebitNote[] = [];
export const MOCK_SUPPLIER_PAYMENTS: SupplierPayment[] = [
    { id: 1, date: '2024-04-01', supplierId: 1, amount: 11100, paymentMethod: 'Card', notes: 'Payment for INV-1' }
];


export const SALES: Sale[] = [
    { id: 101, branchId: 1, brand: 'Arabiva', invoiceNumber: 'INV-A-001', customerId: 4, customerName: 'زبون نقدي عام', date: '2024-07-22', totalAmount: 90, paymentMethod: 'K-Net', paymentStatus: 'Paid', sessionId: 1, items: [
        { id: 1, productName: 'Arabiva Oud Royal 50ml', productId: 8, quantity: 2, unitPrice: 45, total: 90 },
    ]},
    { id: 102, branchId: 4, brand: 'Generic', invoiceNumber: 'INV-G-001', customerId: 4, customerName: 'زبون نقدي عام', date: '2024-07-22', totalAmount: 24, paymentMethod: 'Card', paymentStatus: 'Paid', sessionId: 1, items: [
        { id: 2, productName: 'Generic Pure Musk Oil 12ml', productId: 9, quantity: 2, unitPrice: 12, total: 24 },
    ]},
];

export const MOCK_SALES_QUOTATIONS: SalesQuotation[] = [
    { id: 1, quoteNumber: 'QT-2024-001', customerId: 1, date: '2024-07-20', expiryDate: '2024-08-20', items: [{ productId: 8, productName: 'Arabiva Oud Royal 50ml', quantity: 10, unitPrice: 40, total: 400 }], totalAmount: 400, status: 'Sent' },
    { id: 2, quoteNumber: 'QT-2024-002', customerId: 2, date: '2024-07-22', expiryDate: '2024-07-29', items: [{ productId: 9, productName: 'Generic Pure Musk Oil 12ml', quantity: 50, unitPrice: 10, total: 500 }], totalAmount: 500, status: 'Accepted' },
];

export const MOCK_SALES_RETURNS: SalesReturn[] = [
    { id: 1, returnNumber: 'RTN-S-001', date: '2024-07-25', originalInvoiceId: 101, customerId: 4, items: [{productId: 8, quantity: 1, reason: 'Damaged box'}], totalReturnedAmount: 45, status: 'Returned' }
];

export const MOCK_CREDIT_NOTES: CreditNote[] = [
    { id: 1, noteNumber: 'CN-2024-001', date: '2024-07-25', salesReturnId: 1, customerId: 4, amount: 45, reason: 'Credit for returned item from invoice #101', status: 'Open' }
];

export const MOCK_RECURRING_INVOICES: RecurringInvoice[] = [];

export const MOCK_CUSTOMER_PAYMENTS: CustomerPayment[] = [
    { id: 1, paymentNumber: 'PAY-C-001', date: '2024-07-28', customerId: 1, amount: 500, paymentMethod: 'Card', appliedToInvoiceId: undefined, notes: 'Payment on account' }
];

// FIX: Added mock data for inventory vouchers and requisitions.
export const MOCK_INVENTORY_VOUCHERS: InventoryVoucher[] = [
    {
        id: 'VO-2024-001',
        date: '2024-07-20',
        status: 'تمت الموافقة',
        description: 'إذن صرف مواد خام لأمر تصنيع MO-20240728-001',
        details: 'صرف 900g زيت عنبر، 100g مثبت',
        createdBy: 'خالد (صانع عطور)',
        branch: 'Generic - Online & Manufacturing',
        type: 'down'
    },
    {
        id: 'VO-2024-002',
        date: '2024-07-22',
        status: 'تمت الموافقة',
        description: 'إذن إضافة بضاعة تامة الصنع',
        details: 'إضافة 97 وحدة من Arabiva EDP 50ml - Amber Vanilla',
        createdBy: 'خالد (صانع عطور)',
        branch: 'Generic - Online & Manufacturing',
        type: 'up'
    }
];

export const MOCK_INVENTORY_REQUISITIONS: InventoryRequisition[] = [
    {
        id: 'REQ-001',
        date: '2024-07-25',
        type: 'Transfer',
        warehouseId: 4, // Manufacturing
        items: [
            { productId: 8, quantity: 50 } // Arabiva Oud Royal
        ],
        notes: 'تحويل بضاعة جاهزة لفرع السالمية'
    },
    {
        id: 'REQ-002',
        date: '2024-07-26',
        type: 'Purchase',
        warehouseId: 4, // Manufacturing
        items: [
            { productId: 1, quantity: 1000 }, // Rose oil
            { productId: 4, quantity: 2000 }, // 50ml Bottle
        ],
        notes: 'طلب شراء مواد خام ناقصة'
    }
];


export const EMPLOYEES: EmployeeData[] = [
    { 
        id: 1, 
        name: 'علي حسن', 
        position: 'مدير فرع', 
        branchId: 2, 
        salary: 1200, 
        allowances: 200, 
        advances: 0, 
        hireDate: '2022-01-15', 
        annualLeaveDays: 30, 
        attachments: [],
        benefits: [
            { title: 'تأمين صحي شامل', description: 'تغطية كاملة لك ولعائلتك من الدرجة الأولى.', icon: 'ShieldCheckIcon' },
            { title: 'مكافآت أداء سنوية', description: 'مكافآت مجزية بناءً على تقييم الأداء السنوي.', icon: 'CurrencyDollarIcon' },
            { title: 'فرص تدريب وتطوير', description: 'دورات تدريبية مدفوعة لتطوير المهارات المهنية.', icon: 'AcademicCapIcon' }
        ]
    },
    { 
        id: 2, 
        name: 'منيرة خالد', 
        position: 'بائعة', 
        branchId: 1, 
        salary: 650, 
        allowances: 50, 
        advances: 100, 
        hireDate: '2022-03-01', 
        annualLeaveDays: 30, 
        attachments: [],
        benefits: [
            { title: 'تأمين صحي', description: 'تغطية أساسية للموظف.', icon: 'ShieldCheckIcon' },
            { title: 'بدل مواصلات', description: 'بدل شهري لتغطية تكاليف النقل.', icon: 'TruckIcon' }
        ]
    },
    { 
        id: 3, 
        name: 'سالم أحمد', 
        position: 'محاسب', 
        branchId: 4, 
        salary: 800, 
        allowances: 100, 
        advances: 0, 
        hireDate: '2021-11-20', 
        annualLeaveDays: 30, 
        attachments: [],
        benefits: [
            { title: 'تأمين صحي', description: 'تغطية أساسية للموظف.', icon: 'ShieldCheckIcon' },
            { title: 'دورات مالية متخصصة', description: 'الوصول إلى ورش عمل ودورات في المحاسبة والمالية.', icon: 'AcademicCapIcon' }
        ]
    },
    { 
        id: 4, 
        name: 'جاسم محمد', 
        position: 'صانع عطور', 
        branchId: 4, 
        salary: 1500, 
        allowances: 250, 
        advances: 0, 
        hireDate: '2023-02-10', 
        annualLeaveDays: 30, 
        attachments: [],
        benefits: [
            { title: 'تأمين صحي شامل', description: 'تغطية كاملة لك ولعائلتك.', icon: 'ShieldCheckIcon' },
            { title: 'مكافأة ابتكار', description: 'مكافأة خاصة عند تطوير عطور جديدة ناجحة.', icon: 'SparklesIcon' },
            { title: 'بدل أدوات ومختبر', description: 'ميزانية سنوية لشراء أدوات ومواد للتجارب الشخصية.', icon: 'BeakerIcon' }
        ]
    },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
    { id: 1, employeeId: 2, leaveType: 'Annual', startDate: '2024-07-10', endDate: '2024-07-12', totalDays: 3, reason: 'Vacation', status: 'Pending' },
    { id: 2, employeeId: 3, leaveType: 'Sick', startDate: '2024-06-05', endDate: '2024-06-05', totalDays: 1, reason: 'Flu', status: 'Approved' },
    { id: 3, employeeId: 4, leaveType: 'Unpaid', startDate: '2024-07-20', endDate: '2024-07-21', totalDays: 2, reason: 'Personal', status: 'Approved' },
];

export const MOCK_ADVANCE_REQUESTS: AdvanceRequest[] = [
    { id: 1, employeeId: 2, amount: 200, reason: 'مصاريف طارئة', requestDate: new Date().toISOString().split('T')[0], status: 'Pending' },
];
export const MOCK_GENERAL_REQUESTS: GeneralRequest[] = [
    { id: 1, employeeId: 3, type: 'Salary Certificate', details: 'مطلوب شهادة راتب موجهة إلى بنك الكويت الوطني', requestDate: new Date().toISOString().split('T')[0], status: 'Approved' }
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const dayBefore = new Date(today);
dayBefore.setDate(today.getDate() - 2);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
    { id: 1, employeeId: 1, date: formatDate(yesterday), status: 'Present' },
    { id: 2, employeeId: 2, date: formatDate(yesterday), status: 'Late', lateMinutes: 25 },
    { id: 3, employeeId: 3, date: formatDate(yesterday), status: 'Present' },
    { id: 4, employeeId: 4, date: formatDate(yesterday), status: 'Absent' },
    { id: 5, employeeId: 1, date: formatDate(dayBefore), status: 'Present' },
    { id: 6, employeeId: 2, date: formatDate(dayBefore), status: 'Present' },
    { id: 7, employeeId: 3, date: formatDate(dayBefore), status: 'Late', lateMinutes: 40 },
    { id: 8, employeeId: 4, date: formatDate(dayBefore), status: 'Present' },
];


const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

const defaultReminders = { 30: false, 15: false, 7: false, 3: false };

export const MOCK_RENEWABLES: RenewableItem[] = [
    { id: 1, category: 'License', name: 'رخصة تجارية (Arabiva)', identifier: 'COM-12345', issueDate: '2023-08-01', expiryDate: getFutureDate(150), remindersSent: { ...defaultReminders } },
    { id: 2, category: 'Permit', name: 'رخصة صحية (Generic Manufacturing)', identifier: 'HEA-67890', issueDate: '2023-09-15', expiryDate: getFutureDate(25), remindersSent: { ...defaultReminders } },
    { id: 5, category: 'License', name: 'علامة تجارية Arabiva', identifier: 'TM-ABCDE', issueDate: '2024-01-05', expiryDate: getFutureDate(2), remindersSent: { 30: true, 15: true, 7: true, 3: false } },
];

export const FINANCIAL_ACCOUNTS: FinancialAccount[] = [
    { id: 1, name: 'حساب البنك الوطني - Generic', type: 'Bank', branchId: 4, balance: 125000 },
    { id: 2, name: 'حساب البنك الوطني - Arabiva', type: 'Bank', branchId: 1, balance: 75000 },
    { id: 4, name: 'حساب بنك وربة - الشركة', type: 'Bank', balance: 92300 },
    { id: 5, name: 'خزينة فرع السالمية', type: 'Cash', branchId: 1, balance: 1500 },
];

export const EXPENSES: Expense[] = [
    // FIX: Used ExpenseCategory enum members instead of string literals to ensure type safety.
    { id: 1, date: '2024-07-01', branchId: 1, category: ExpenseCategory.Rent, amount: 1500, description: 'إيجار شهر يوليو - فرع السالمية', paidFromAccountId: 2 },
    { id: 2, date: '2024-07-05', branchId: 4, category: ExpenseCategory.MarketingBranding, amount: 800, description: 'حملة إعلانية انستغرام (Generic)', paidFromAccountId: 1 },
    { id: 3, date: '2024-07-10', branchId: 2, category: ExpenseCategory.Utilities, amount: 250, description: 'فاتورة كهرباء وماء', paidFromAccountId: 3 },
    { id: 4, date: '2024-07-12', branchId: 4, category: ExpenseCategory.EcommerceFees, amount: 120, description: 'رسوم بوابة الدفع', paidFromAccountId: 1 },
];

export const SESSIONS: POSSession[] = [
    { id: 1, startTime: '2024-07-20T09:00:00Z', endTime: '2024-07-20T17:00:00Z', status: 'Closed', openingBalance: 100, closingBalance: 800, totalSalesValue: 700, salesIds: [101, 102], branchId: 1 },
    { id: 2, startTime: '2024-07-21T09:00:00Z', status: 'Open', openingBalance: 100, totalSalesValue: 0, salesIds: [], branchId: 1 },
    { id: 3, startTime: '2024-07-21T10:48:00+03:00', endTime: '2024-07-21T22:00:00+03:00', status: 'Closed', openingBalance: 150, closingBalance: 500, totalSalesValue: 350, salesIds: [], branchId: 2},
];

export const PRODUCTION_ORDERS: ProductionOrder_Legacy[] = [
    { id: 1, productId: 8, quantity: 10, branchId: 1, status: 'Pending', creationDate: '2024-07-20' },
];

export const MANUFACTURING_ORDERS_MOCK: ManufacturingOrder[] = [
    {
        id: "MO-20240728-001",
        productName: "Arabiva EDP 50ml – Amber Vanilla",
        manufacturingType: 'INTERNAL',
        responsibleEmployeeId: 4, // Jassim Mohammed (Perfumer)
        concentration: "EDP_20",
        bottleSizeMl: 50,
        unitsRequested: 100,
        batchCode: "AMBVAN-20240728-001",
        branchId: 4, // Manufacturing branch
        manufacturingDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        formula: [
            { id: "1", materialId: 102, materialName: 'زيت العنبر والفانيلا', materialSku: 'RM-OIL-004', kind: "AROMA_OIL", percentage: 18, density: 1.02 },
            { id: "2", materialId: 103, materialName: 'مثبت - مسك كيتون', materialSku: 'RM-CHEM-003', kind: "FIXATIVE", percentage: 2, density: 1.32 },
            { id: "3", materialId: 7, materialName: 'كحول عطور 96%', materialSku: 'RM-CHEM-001', kind: "ETHANOL", percentage: 78, density: 0.82 },
            { id: "4", materialId: 101, materialName: 'ماء مقطر', materialSku: 'RM-CHEM-002', kind: "DI_WATER", percentage: 2, density: 1.0 },
        ],
        processLoss: { mixingLossPct: 0.5, filtrationLossPct: 1, fillingLossPct: 1.5 },
        macerationDays: 14,
        chilling: { hours: 12, temperatureC: 4 },
        filtration: { stages: 1, micron: 1 },
        qc: {
            appearance: 'Clear, light amber liquid',
            clarity: "Clear",
            odorMatch: "Pass",
            result: "APPROVED",
        },
        packagingItems: [
            { productId: 4, name: 'زجاجة عطر 50مل (شفاف)', qtyPerUnit: 1 },
            { productId: 201, name: 'بخاخ ذهبي 18مم', qtyPerUnit: 1 },
        ],
        costs: {
            materials: 0, labor: 0, overhead: 0, packaging: 0, other: 0,
            total: 0, perMl: 0, perBottle: 0, suggestedRetail: 0
        },
        yield: {
            theoreticalMl: 5000,
            expectedMl: 4850,
            expectedUnits: 97
        },
        distribution: [],
        status: "DRAFT",
    }
];


export const PRODUCTION_TASKS: ProductionTask[] = [
    { 
        id: 1, 
        name: 'خلط زيت العنبر مع الكحول', 
        productionOrderId: "MO-20240728-001", 
        assignedToEmployeeId: 4, 
        deadline: '2024-07-23', 
        status: 'In Progress',
        comments: [
            { id: 1, userId: 1, userName: 'أحمد (المالك)', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), text: 'يرجى التأكد من درجة حرارة الغرفة قبل البدء.' }
        ]
    },
    { id: 2, name: 'تعبئة الزجاجات', productionOrderId: "MO-20240728-001", status: 'To Do', comments: [] },
    { id: 3, name: 'تغليف وتجهيز', productionOrderId: "MO-20240728-001", status: 'To Do', comments: [] },
];

export const branchSessionsMock = [
  {
    branchName: "Arabiva 1",
    totalSales: 318.400,
    sessions: [
      {
        sessionId: "515",
        openTime: "2025-10-19T09:00:00+03:00",
        closeTime: "2025-10-19T23:00:00+03:00",
        totalSales: 318.400,
        cash: 180.000,
        knet: 138.400,
        invoicesCount: 11,
        cashier: "Hassan Ahmed",
        device: "Shop 1 #000001",
        note: "جلسة صباحية"
      }
    ]
  },
  {
    branchName: "Arabiva 2",
    totalSales: 204.300,
    sessions: [
      {
        sessionId: "518",
        openTime: "2025-10-19T10:48:00+03:00",
        closeTime: "2025-10-19T22:00:00+03:00",
        totalSales: 204.300,
        cash: 82.000,
        knet: 122.300,
        invoicesCount: 8,
        cashier: "Mohamed Gamal",
        device: "Shop 2 #000002",
        note: "ورديّة 518"
      }
    ]
  }
];

export const CHART_OF_ACCOUNTS: Account[] = [
    { id: '1', name: 'الأصول', type: 'Asset', children: [
        { id: '1-1000', name: 'الأصول المتداولة', type: 'Asset', children: [
            { id: '1-1100', name: 'النقدية وما في حكمها', type: 'Asset', children: [
                { id: '1-1110', name: 'خزائن', type: 'Asset' },
                { id: '1-1120', name: 'حسابات بنكية', type: 'Asset' },
            ]},
            { id: '1-1200', name: 'الذمم المدينة', type: 'Asset' },
            { id: '1-1300', name: 'المخزون', type: 'Asset', children: [
                 { id: '1-1310', name: 'مواد خام - زيوت', type: 'Asset' },
                 { id: '1-1320', name: 'مواد خام - تغليف وكحول', type: 'Asset' },
                 { id: '1-1330', name: 'بضاعة تامة الصنع - عطور', type: 'Asset' },
            ]},
            { id: '1-1400', name: 'مصاريف مدفوعة مقدماً', type: 'Asset' },
        ]},
        { id: '1-2000', name: 'الأصول الثابتة', type: 'Asset', children: [
            { id: '1-2100', name: 'أثاث ومعدات', type: 'Asset' },
            { id: '1-2200', name: 'سيارات', type: 'Asset' },
        ]},
    ]},
    { id: '2', name: 'الالتزامات', type: 'Liability', children: [
        { id: '2-1000', name: 'الالتزامات المتداولة', type: 'Liability', children: [
            { id: '2-1100', name: 'الذمم الدائنة', type: 'Liability' },
            { id: '2-1200', name: 'قروض قصيرة الأجل', type: 'Liability' },
        ]},
    ]},
    { id: '3', name: 'حقوق الملكية', type: 'Equity', children: [
        { id: '3-1000', name: 'رأس المال', type: 'Equity' },
        { id: '3-2000', name: 'الأرباح المحتجزة', type: 'Equity' },
    ]},
    { id: '4', name: 'الإيرادات', type: 'Revenue', children: [
        { id: '4-1000', name: 'إيرادات المبيعات', type: 'Revenue', children: [
            { id: '4-1100', name: 'مبيعات - براند Arabiva', type: 'Revenue' },
            { id: '4-1200', name: 'مبيعات - براند Generic Perfumes', type: 'Revenue' },
        ]},
        { id: '4-2000', name: 'إيرادات أخرى', type: 'Revenue' },
    ]},
    { id: '5', name: 'المصروفات', type: 'Expense', children: [
        { id: '5-1000', name: 'تكلفة البضاعة المباعة', type: 'Expense' },
        { id: '5-2000', name: 'مصروفات تشغيلية', type: 'Expense', children: [
            { id: '5-2100', name: 'رواتب وأجور', type: 'Expense' },
            { id: '5-2200', name: 'إيجارات', type: 'Expense' },
            { id: '5-2300', name: 'كهرباء وماء', type: 'Expense' },
        ]},
        { id: '5-3000', name: 'مصروفات التسويق', type: 'Expense', children: [
            { id: '5-3100', name: 'تسويق - براند Arabiva', type: 'Expense' },
            { id: '5-3200', name: 'تسويق - براند Generic Perfumes', type: 'Expense' },
        ]},
    ]},
];

export const MOCK_JOURNAL_VOUCHERS: JournalVoucher[] = [
    {
        id: 1,
        date: '2024-07-25',
        reference: 'قيد تسوية إيجار مدفوع مقدماً لشهر يوليو',
        lines: [
            { id: 1, accountId: '5-2200', debit: 1500, credit: 0, description: 'مصروف إيجار شهر يوليو' },
            { id: 2, accountId: '1-1400', debit: 0, credit: 1500, description: 'تخفيض رصيد الإيجار المدفوع مقدماً' },
        ]
    },
    {
        id: 2,
        date: '2024-07-20',
        reference: 'تحويل مبلغ من حساب البنك إلى الخزينة',
        lines: [
            { id: 3, accountId: '1-1110', debit: 1000, credit: 0, description: 'إيداع في خزينة فرع السالمية' },
            { id: 4, accountId: '1-1120', debit: 0, credit: 1000, description: 'سحب من حساب البنك' },
        ]
    }
];


const generateWebhookUrl = (event: WebhookEvent) => {
    // In a real app, this would be a unique, secure URL from the backend
    const uniqueId = Math.random().toString(36).substring(2, 10);
    return `https://api.yourdomain.com/webhooks/n8n/${event}/${uniqueId}`;
};

export const MOCK_INTEGRATION_SETTINGS: IntegrationSettings = {
    openCart: {
        isEnabled: false,
        apiUrl: '',
        apiKey: '',
        apiSecret: '',
        autoSyncCustomers: true,
        autoSyncSales: true,
        syncInterval: 60,
    },
    wooCommerce: {
        isEnabled: false,
        apiUrl: '',
        apiKey: '',
        apiSecret: '',
        autoSyncCustomers: true,
        autoSyncSales: true,
        syncInterval: 60,
    },
    myFatoorah: {
        isEnabled: false,
        apiKey: '',
    },
    whatsapp: {
        isEnabled: false,
        apiKey: '',
        phoneNumberId: '',
    },
    n8n: {
        isEnabled: true,
        webhooks: [
            { event: 'sale.created', url: generateWebhookUrl('sale.created'), isEnabled: true },
            { event: 'customer.created', url: generateWebhookUrl('customer.created'), isEnabled: true },
            { event: 'inventory.low_stock', url: generateWebhookUrl('inventory.low_stock'), isEnabled: false },
            { event: 'purchase.created', url: generateWebhookUrl('purchase.created'), isEnabled: false },
        ]
    }
};

export const MOCK_PURCHASE_SETTINGS: PurchaseSettings = {
  defaultPaymentTermsDays: 30,
  defaultShippingPreference: 'Delivery',
  isApprovalWorkflowEnabled: true,
  approvalTiers: [
    { id: 1, minAmount: 0, approverRole: Role.BranchManager },
    { id: 2, minAmount: 5000, approverRole: Role.Accountant },
    { id: 3, minAmount: 20000, approverRole: Role.SuperAdmin },
  ]
};