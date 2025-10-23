



import React, { useState, useMemo, useEffect } from 'react';
// FIX: Changed to a named import for Sidebar as the module does not have a default export.
import { Sidebar } from './components/Sidebar';
// FIX: Changed to a named import for Header as the module does not have a default export.
import { Header } from './components/Header';
import Dashboard from './pages/Dashboard';
import PurchaseInvoices from './pages/PurchaseInvoices';
import SalesInvoices from './pages/Sales';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UsersPage from './pages/UsersPage';
import Licenses from './pages/Licenses';
import Branches from './pages/Branches';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginScreen from './pages/LoginScreen';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Salaries from './pages/Salaries';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import FinancialAccounts from './pages/FinancialAccounts';
import POS from './pages/POS';
import POSSessions from './pages/POSSessions';
import ManufacturingOrderPage from './pages/ManufacturingOrderPage';
import ProductionTasks from './pages/ProductionTasks';
import ChartOfAccountsPage from './pages/ChartOfAccountsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AIChatbot from './components/AIChatbot';
import EmployeePortal from './pages/EmployeePortal';
import AdvanceRequestsPage from './pages/AdvanceRequestsPage';
import GeneralRequestsPage from './pages/GeneralRequestsPage';
import ProductModal from './components/ProductModal';
import PermissionsViewModal from './components/PermissionsViewModal';
import Suppliers from './pages/Suppliers';
import PurchaseRequests from './pages/PurchaseRequests';
import RequestForQuotations from './pages/RequestForQuotations';
import PurchaseQuotations from './pages/PurchaseQuotations';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseReturns from './pages/PurchaseReturns';
import DebitNotes from './pages/DebitNotes';
import SupplierPayments from './pages/SupplierPayments';
import SettingsPurchases from './pages/SettingsPurchases';
import SettingsSuppliers from './pages/SettingsSuppliers';
import SalesQuotations from './pages/SalesQuotations';
import SalesReturns from './pages/SalesReturns';
import CreditNotes from './pages/CreditNotes';
import RecurringInvoices from './pages/RecurringInvoices';
import CustomerPayments from './pages/CustomerPayments';
// FIX: Add import for SettingsSales to resolve component not found error.
import SettingsSales from './pages/SettingsSales';


import { User, Role, PurchaseInvoice, Sale, EmployeeData, RenewableItem, Branch, Product, InventoryItem, LeaveRequest, AttendanceRecord, SalaryPayment, RequestStatus, Customer, Expense, FinancialAccount, POSSession, ManufacturingOrder, ChatbotDataContext, InventoryAdjustmentLog, AdjustmentReason, ProductionTask, Account, IntegrationSettings, AdvanceRequest, GeneralRequest, Supplier, PurchaseRequest, PurchaseOrder, PurchaseReturn, SupplierPayment, DebitNote, RequestForQuotation, PurchaseQuotation, SalesQuotation, SalesReturn, CreditNote, RecurringInvoice, CustomerPayment } from './types';
import { USERS as MOCK_USERS, MOCK_PURCHASE_INVOICES, SALES as MOCK_SALES, EMPLOYEES as MOCK_EMPLOYEES, MOCK_RENEWABLES, BRANCHES as MOCK_BRANCHES, PRODUCTS as MOCK_PRODUCTS, INVENTORY as MOCK_INVENTORY, LEAVE_REQUESTS as MOCK_LEAVE_REQUESTS, ATTENDANCE_RECORDS as MOCK_ATTENDANCE, CUSTOMERS as MOCK_CUSTOMERS, EXPENSES as MOCK_EXPENSES, FINANCIAL_ACCOUNTS as MOCK_FINANCIAL_ACCOUNTS, SESSIONS as MOCK_SESSIONS, MANUFACTURING_ORDERS_MOCK as MOCK_PRODUCTION_ORDERS, INVENTORY_ADJUSTMENT_LOGS as MOCK_ADJUSTMENT_LOGS, PRODUCTION_TASKS as MOCK_PRODUCTION_TASKS, CHART_OF_ACCOUNTS as MOCK_CHART_OF_ACCOUNTS, MOCK_INTEGRATION_SETTINGS, MOCK_ADVANCE_REQUESTS, MOCK_GENERAL_REQUESTS, MOCK_SUPPLIERS, MOCK_PURCHASE_REQUESTS, MOCK_PURCHASE_ORDERS, MOCK_PURCHASE_RETURNS, MOCK_SUPPLIER_PAYMENTS, MOCK_DEBIT_NOTES, MOCK_RFQS, MOCK_QUOTATIONS, MOCK_SALES_QUOTATIONS, MOCK_SALES_RETURNS, MOCK_CREDIT_NOTES, MOCK_RECURRING_INVOICES, MOCK_CUSTOMER_PAYMENTS } from './services/mockData';
import { ToastProvider, useToasts } from './components/Toast';

export const AuthContext = React.createContext<{ user: User | null; login: (role: Role) => void; logout: () => void; }>({
    user: null,
    login: () => {},
    logout: () => {},
});

type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
    const { addToast } = useToasts();
    const [user, setUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState('Dashboard');
    const [theme, setTheme] = useState<Theme>('dark');

    // Centralized Data State
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(MOCK_PURCHASE_INVOICES);
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
    const [employees, setEmployees] = useState<EmployeeData[]>(MOCK_EMPLOYEES);
    const [renewables, setRenewables] = useState<RenewableItem[]>(MOCK_RENEWABLES);
    const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
    const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(MOCK_FINANCIAL_ACCOUNTS);
    const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>(MOCK_CHART_OF_ACCOUNTS);
    const [settings, setSettings] = useState({ 
        salesTarget: 50000,
        renewalReminders: { days: [30, 15, 7, 3] } 
    });
    const [posSessions, setPosSessions] = useState<POSSession[]>(MOCK_SESSIONS);
    const [productionOrders, setProductionOrders] = useState<ManufacturingOrder[]>(MOCK_PRODUCTION_ORDERS);
    const [inventoryAdjustmentLogs, setInventoryAdjustmentLogs] = useState<InventoryAdjustmentLog[]>(MOCK_ADJUSTMENT_LOGS);
    const [productionTasks, setProductionTasks] = useState<ProductionTask[]>(MOCK_PRODUCTION_TASKS);
    const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(MOCK_INTEGRATION_SETTINGS);
    const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>(MOCK_ADVANCE_REQUESTS);
    const [generalRequests, setGeneralRequests] = useState<GeneralRequest[]>(MOCK_GENERAL_REQUESTS);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [viewingPermissionsFor, setViewingPermissionsFor] = useState<User | null>(null);

    // Purchase Module State
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(MOCK_PURCHASE_REQUESTS);
    const [rfqs, setRfqs] = useState<RequestForQuotation[]>(MOCK_RFQS);
    const [purchaseQuotations, setPurchaseQuotations] = useState<PurchaseQuotation[]>(MOCK_QUOTATIONS);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(MOCK_PURCHASE_RETURNS);
    const [debitNotes, setDebitNotes] = useState<DebitNote[]>(MOCK_DEBIT_NOTES);
    const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(MOCK_SUPPLIER_PAYMENTS);
    
    // Sales Module State
    const [salesQuotations, setSalesQuotations] = useState<SalesQuotation[]>(MOCK_SALES_QUOTATIONS);
    const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(MOCK_SALES_RETURNS);
    const [creditNotes, setCreditNotes] = useState<CreditNote[]>(MOCK_CREDIT_NOTES);
    const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>(MOCK_RECURRING_INVOICES);
    const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(MOCK_CUSTOMER_PAYMENTS);

    const activeSession = useMemo(() => posSessions.find(s => s.status === 'Open' && s.branchId === user?.branchId), [posSessions, user]);
    
     useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    const authContextValue = useMemo(() => ({
        user,
        login: (role: Role) => {
            const loggedInUser = users.find(u => u.role === role);
            if (loggedInUser) {
                setUser(loggedInUser);
                switch (role) {
                    case Role.ShopAssistant:
                        setActiveView('POS/Start');
                        break;
                    case Role.Perfumer:
                        setActiveView('Manufacturing/Orders');
                        break;
                    case Role.Employee:
                        setActiveView('MyProfile');
                        break;
                    default:
                        setActiveView('Dashboard');
                        break;
                }
            }
        },
        logout: () => {
            setUser(null);
        }
    }), [user, users]);
    
    useEffect(() => {
        if (user) { 
            checkAndSendRenewalReminders();
            const interval = setInterval(() => {
                checkAndSendRenewalReminders();
            }, 60 * 1000 * 5); 
            return () => clearInterval(interval);
        }
    }, [user, renewables, settings.renewalReminders.days]);


    const checkAndSendRenewalReminders = (): boolean => {
        const today = new Date();
        today.setHours(0,0,0,0);
        let remindersSentInSession = false;
        const reminderDays = settings.renewalReminders.days.sort((a, b) => b - a);
        
        const updatedRenewables = renewables.map(item => {
            const expiry = new Date(item.expiryDate);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let newRemindersSent = {...(item.remindersSent || {})};
            let reminderTriggered = false;

            // Only check for reminders if the item has not expired yet
            if (diffDays >= 0) {
                for (const day of reminderDays) {
                    if (diffDays <= day && !newRemindersSent[day]) {
                        addToast(`تنبيه: "${item.name}" ينتهي خلال ${day} يوم أو أقل.`, 'info');
                        newRemindersSent[day] = true;
                        reminderTriggered = true;
                        break; // Send only the most urgent, unmet reminder for this item per check
                    }
                }
            }

            if (reminderTriggered) {
                remindersSentInSession = true;
                return { ...item, remindersSent: newRemindersSent };
            }
            return item;
        });

        if (remindersSentInSession) {
            setRenewables(updatedRenewables);
        }
        return remindersSentInSession;
    };


    // CRUD Handlers
    const handleSaveUser = (userToSave: User) => {
        setUsers(prev => {
            const exists = prev.some(u => u.id === userToSave.id);
            if (exists) {
                return prev.map(u => u.id === userToSave.id ? userToSave : u);
            }
            const newUser = { ...userToSave, id: Date.now() };
            return [...prev, newUser];
        });
    };

    const handleOpenProductModal = (product: Partial<Product>) => {
        setEditingProduct(product);
    };

    const handleCloseProductModal = () => {
        setEditingProduct(null);
    };

    const handleSaveProduct = (productToSave: Product) => {
        setProducts(prev => {
            const exists = prev.some(p => p.id === productToSave.id);
            if (exists) {
                return prev.map(p => p.id === productToSave.id ? productToSave : p);
            }
            const newProduct = { ...productToSave, id: Date.now() };
            return [...prev, newProduct];
        });
    };

    const handleSaveAndCloseProductModal = (productToSave: Product) => {
        handleSaveProduct(productToSave);
        addToast(`تم ${productToSave.id ? 'تحديث' : 'إضافة'} المنتج بنجاح!`, 'success');
        handleCloseProductModal();
    };

    const handleSavePurchaseInvoice = (invoice: PurchaseInvoice) => {
        setPurchaseInvoices(prev => {
            const exists = prev.some(p => p.id === invoice.id);
            if (exists) {
                return prev.map(p => p.id === invoice.id ? invoice : p);
            }
            const newInvoice = { ...invoice, id: Date.now() };
            setInventory(prevInv => {
                const newInv = [...prevInv];
                newInvoice.items.forEach(item => {
                    const invIndex = newInv.findIndex(i => i.branchId === newInvoice.branchId && i.productId === item.productId);
                    if (invIndex > -1) {
                        newInv[invIndex].quantity += item.quantity;
                    } else {
                        newInv.push({ branchId: newInvoice.branchId, productId: item.productId, quantity: item.quantity, minStock: 0 });
                    }
                });
                return newInv;
            });
            return [...prev, newInvoice];
        });
    };
    
    const handleSaveSale = (sale: Sale) => {
        setSales(prev => {
            const exists = prev.some(s => s.id === sale.id);
            if (exists) {
                return prev.map(s => s.id === sale.id ? sale : s);
            }

            const newSale = { ...sale, id: Date.now(), invoiceNumber: `INV-${sale.brand === 'Arabiva' ? 'A' : 'G'}-${Date.now()}` };

            if (activeSession) {
                newSale.sessionId = activeSession.id;
                setPosSessions(prevSessions => prevSessions.map(s =>
                    s.id === activeSession.id
                    ? { ...s, salesIds: [...s.salesIds, newSale.id] }
                    : s
                ));
            }

            setInventory(prevInv => {
                const newInv = [...prevInv];
                newSale.items.forEach(item => {
                    const productDetails = products.find(p => p.id === item.productId);

                    if (productDetails?.components && productDetails.components.length > 0) {
                        // Composite product: deduct components from inventory
                        productDetails.components.forEach(component => {
                            const invIndex = newInv.findIndex(i => i.branchId === newSale.branchId && i.productId === component.productId);
                            if (invIndex > -1) {
                                newInv[invIndex].quantity -= component.quantity * item.quantity;
                            }
                        });
                    } else {
                        // Simple product: deduct item itself from inventory
                        const invIndex = newInv.findIndex(i => i.branchId === newSale.branchId && i.productId === item.productId);
                        if (invIndex > -1) {
                            newInv[invIndex].quantity -= item.quantity;
                        }
                    }
                });
                return newInv;
            });
            return [...prev, newSale];
        });
    };

    const handleSaveSalesQuotation = (quotation: SalesQuotation) => {
        setSalesQuotations(prev => {
            const exists = prev.some(q => q.id === quotation.id);
            if (exists) {
                return prev.map(q => (q.id === quotation.id ? quotation : q));
            }
            const newQuote = { ...quotation, id: Date.now(), quoteNumber: `QT-${Date.now()}` };
            return [...prev, newQuote];
        });
    };

    const handleConvertQuoteToInvoice = (quotation: SalesQuotation) => {
        const customer = customers.find(c => c.id === quotation.customerId);
        if (!customer || !user?.branchId) {
            addToast('Customer not found or user has no branch.', 'error');
            return;
        }

        const newSale: Omit<Sale, 'id' | 'invoiceNumber'> = {
            brand: 'Arabiva', // Or determine dynamically
            branchId: user.branchId,
            customerName: customer.name,
            customerId: customer.id,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'Credit',
            paymentStatus: 'Pending',
            items: quotation.items.map(item => ({...item, id: Date.now() + Math.random() })),
            totalAmount: quotation.totalAmount,
            quotationId: quotation.id,
        };
        handleSaveSale(newSale as Sale);
        setSalesQuotations(prev => prev.map(q => q.id === quotation.id ? { ...q, status: 'Accepted' } : q));
        addToast(`تم تحويل عرض السعر #${quotation.quoteNumber} إلى فاتورة.`, 'success');
    };

    const handleSaveEmployee = (employee: EmployeeData) => {
        setEmployees(prev => {
            const exists = prev.some(e => e.id === employee.id);
            return exists ? prev.map(e => e.id === employee.id ? employee : e) : [...prev, { ...employee, id: Date.now() }];
        })
    }
    
    const handleDeleteEmployee = (employeeId: number) => {
        setEmployees(prev => prev.filter(e => e.id !== employeeId));
    }

    const handleSaveBranch = (branch: Branch) => {
         setBranches(prev => {
            const exists = prev.some(b => b.id === branch.id);
            return exists ? prev.map(b => b.id === branch.id ? branch : b) : [...prev, { ...branch, id: Date.now() }];
        })
    }
    
    const handleSaveSupplier = (supplier: Supplier) => {
         setSuppliers(prev => {
            const exists = prev.some(s => s.id === supplier.id);
            return exists ? prev.map(s => s.id === supplier.id ? supplier : s) : [...prev, { ...supplier, id: Date.now() }];
        })
    }

    const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
        setInventory(prev => prev.map(item => 
            (item.branchId === updatedItem.branchId && item.productId === updatedItem.productId)
            ? updatedItem
            : item
        ));
    }
    
    const handleTransferInventory = (data: { sourceBranchId: number; destinationBranchId: number; productId: number; quantity: number; }) => {
        const { sourceBranchId, destinationBranchId, productId, quantity } = data;
        
        setInventory(prevInv => {
            const newInv = [...prevInv];
            let transactionSuccess = true;
    
            // 1. Deduct from source
            const sourceIndex = newInv.findIndex(i => i.branchId === sourceBranchId && i.productId === productId);
            if (sourceIndex > -1 && newInv[sourceIndex].quantity >= quantity) {
                newInv[sourceIndex] = { ...newInv[sourceIndex], quantity: newInv[sourceIndex].quantity - quantity };
            } else {
                addToast('Source branch has insufficient stock for transfer.', 'error');
                transactionSuccess = false;
            }
    
            if (!transactionSuccess) {
                return prevInv; // Abort if deduction failed
            }
            
            // 2. Add to destination
            const destinationIndex = newInv.findIndex(i => i.branchId === destinationBranchId && i.productId === productId);
            if (destinationIndex > -1) {
                 newInv[destinationIndex] = { ...newInv[destinationIndex], quantity: newInv[destinationIndex].quantity + quantity };
            } else {
                // If item doesn't exist in destination, create it
                const sourceItem = prevInv.find(i => i.branchId === sourceBranchId && i.productId === productId);
                newInv.push({
                    branchId: destinationBranchId,
                    productId: productId,
                    quantity: quantity,
                    minStock: sourceItem?.minStock || 0, // Carry over minStock setting or default to 0
                });
            }
            addToast('تم تحويل المخزون بنجاح!', 'success');
            return newInv;
        });
    };

    const handleAdjustInventory = (data: { branchId: number; productId: number; newQuantity: number; reason: AdjustmentReason; notes?: string; }) => {
        const { branchId, productId, newQuantity, reason, notes } = data;

        let oldQuantity = 0;
        const inventoryItem = inventory.find(i => i.branchId === branchId && i.productId === productId);
        if (inventoryItem) {
            oldQuantity = inventoryItem.quantity;
        } else if (reason === 'Initial Stock') {
            oldQuantity = 0;
        }
        else {
            addToast('Product not found in branch inventory.', 'error');
            return;
        }

        // Create log entry
        const newLogEntry: InventoryAdjustmentLog = {
            id: Date.now(),
            date: new Date().toISOString(),
            branchId,
            productId,
            adjustedByUserId: user?.id || 0,
            oldQuantity,
            newQuantity,
            reason,
            notes,
        };

        setInventoryAdjustmentLogs(prev => [...prev, newLogEntry]);

        // Update inventory state
        setInventory(prev => {
            const itemIndex = prev.findIndex(item => item.branchId === branchId && item.productId === productId);
            if (itemIndex > -1) {
                const newInv = [...prev];
                newInv[itemIndex] = { ...newInv[itemIndex], quantity: newQuantity };
                return newInv;
            } else {
                 return [...prev, { branchId, productId, quantity: newQuantity, minStock: 0 }];
            }
        });
        
        addToast('Inventory adjusted successfully!', 'success');
    };

    const handleRecordAttendance = (records: AttendanceRecord[]) => {
        setAttendance(prev => {
            const newRecords = [...prev];
            records.forEach(record => {
                const index = newRecords.findIndex(r => r.date === record.date && r.employeeId === record.employeeId);
                if (index > -1) {
                    newRecords[index] = record;
                } else {
                    newRecords.push({ ...record, id: Date.now() });
                }
            });
            return newRecords;
        });
        addToast('Attendance recorded!', 'success');
    };
    
    const handleSaveLeaveRequest = (request: LeaveRequest, newStatus?: RequestStatus) => {
        setLeaveRequests(prev => {
            const exists = prev.some(r => r.id === request.id);
            if (exists) {
                return prev.map(r => r.id === request.id ? { ...r, status: newStatus || r.status } : r);
            }
            return [...prev, { ...request, id: Date.now(), status: 'Pending' }];
        });
    };

    const handleSaveAdvanceRequest = (request: AdvanceRequest, newStatus?: RequestStatus) => {
        setAdvanceRequests(prev => {
            const exists = prev.some(r => r.id === request.id);
            if (exists) {
                return prev.map(r => r.id === request.id ? { ...r, status: newStatus || r.status } : r);
            }
            return [...prev, { ...request, id: Date.now(), status: 'Pending' }];
        });
    };

    const handleSaveGeneralRequest = (request: GeneralRequest, newStatus?: RequestStatus) => {
        setGeneralRequests(prev => {
            const exists = prev.some(r => r.id === request.id);
            if (exists) {
                return prev.map(r => r.id === request.id ? { ...r, status: newStatus || r.status } : r);
            }
            return [...prev, { ...request, id: Date.now(), status: 'Pending' }];
        });
    };
    
    const handleRunPayroll = (year: number, month: number) => {
        const newPayments: SalaryPayment[] = employees.map(emp => {
            const id = `${emp.id}-${month}-${year}`;
            
            // Calculate deductions
            const monthAttendance = attendance.filter(a => {
                const aDate = new Date(a.date);
                return a.employeeId === emp.id && aDate.getFullYear() === year && aDate.getMonth() === month - 1;
            });
            
            const unpaidLeave = leaveRequests.filter(r => {
                const rDate = new Date(r.startDate);
                return r.employeeId === emp.id && r.status === 'Approved' && r.leaveType === 'Unpaid' && rDate.getFullYear() === year && rDate.getMonth() === month -1;
            }).reduce((sum, r) => sum + r.totalDays, 0);

            const lateMinutes = monthAttendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
            const absentDays = monthAttendance.filter(a => a.status === 'Absent').length;
            
            const salaryPerDay = emp.salary / 30;
            const salaryPerHour = salaryPerDay / 8;
            
            const deductions = {
                advances: emp.advances,
                lateness: Math.floor(lateMinutes / 30) * salaryPerHour,
                absence: absentDays * salaryPerDay,
                unpaidLeave: unpaidLeave * salaryPerDay,
                total: 0
            };
            deductions.total = deductions.advances + deductions.lateness + deductions.absence + deductions.unpaidLeave;
            
            const grossSalary = emp.salary + emp.allowances;
            const netSalary = grossSalary - deductions.total;

            const payment: SalaryPayment = {
                id,
                employeeId: emp.id,
                month,
                year,
                basicSalary: emp.salary,
                allowances: emp.allowances,
                grossSalary,
                deductions,
                netSalary,
                paidDate: new Date().toISOString().split('T')[0],
                journalEntries: [
                    { account: 'مصروف الرواتب', debit: grossSalary, credit: 0 },
                    { account: 'ذمم السلف', debit: 0, credit: deductions.advances },
                    { account: 'الرواتب المستحقة', debit: 0, credit: netSalary },
                ]
            };
            return payment;
        });
        
        setSalaryPayments(newPayments);
        addToast(`Payroll for ${month}/${year} completed!`, 'success');
    };

    const handleSaveCustomer = (customer: Customer): Customer => {
        let savedCustomer = customer;
        setCustomers(prev => {
            const exists = prev.some(c => c.id === customer.id);
            if (exists) {
                const updated = prev.map(c => {
                    if (c.id === customer.id) {
                        savedCustomer = customer;
                        return customer;
                    }
                    return c;
                });
                return updated;
            }
            const newCustomer = { 
                ...customer, 
                id: Date.now(),
                addedBy: user?.name || 'System'
            };
            savedCustomer = newCustomer;
            return [...prev, newCustomer];
        });
        return savedCustomer;
    };
    
    const handleSaveExpense = (expense: Expense) => {
        const originalExpense = expenses.find(e => e.id === expense.id);
        const isNew = !originalExpense;

        setFinancialAccounts(prev => prev.map(acc => {
            let newBalance = acc.balance;
            if (isNew) {
                if (acc.id === expense.paidFromAccountId) {
                    newBalance -= expense.amount;
                }
            } else {
                const amountDifference = expense.amount - originalExpense.amount;
                if (originalExpense.paidFromAccountId === expense.paidFromAccountId) {
                    if (acc.id === expense.paidFromAccountId) {
                        newBalance -= amountDifference;
                    }
                } else {
                    if (acc.id === originalExpense.paidFromAccountId) {
                        newBalance += originalExpense.amount;
                    }
                    if (acc.id === expense.paidFromAccountId) {
                        newBalance -= expense.amount;
                    }
                }
            }
            return { ...acc, balance: newBalance };
        }));

        setExpenses(prev => {
            if (isNew) {
                return [...prev, { ...expense, id: Date.now() }];
            }
            return prev.map(e => e.id === expense.id ? expense : e);
        });

        addToast('Expense saved successfully!', 'success');
    };
    
    // POS Session Handlers
    const handleStartSession = (openingBalance: number) => {
        if (activeSession) {
            addToast('There is already an active session.', 'error');
            return;
        }
        if (!user?.branchId) {
            addToast('User is not assigned to a branch.', 'error');
            return;
        }
        const newSession: POSSession = {
            id: Date.now(),
            startTime: new Date().toISOString(),
            status: 'Open',
            openingBalance,
            salesIds: [],
            totalSalesValue: 0,
            branchId: user.branchId,
        };
        setPosSessions(prev => [...prev, newSession]);
        addToast('Session started successfully!', 'success');
        setActiveView('POS/Start');
    };

    const handleCloseSession = (closingBalance: number) => {
        if (!activeSession) {
            addToast('No active session to close.', 'error');
            return;
        }

        const salesInSession = sales.filter(s => activeSession.salesIds.includes(s.id));
        const totalSalesValue = salesInSession.reduce((sum, s) => sum + s.totalAmount, 0);

        const updatedSession: POSSession = {
            ...activeSession,
            status: 'Closed',
            endTime: new Date().toISOString(),
            closingBalance,
            totalSalesValue,
        };
        setPosSessions(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s));
        addToast('Session closed successfully.', 'success');
    };

    const handleSaveProductionOrder = (order: ManufacturingOrder) => {
        const originalOrder = productionOrders.find(o => o.id === order.id);
    
        setProductionOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            return exists ? prev.map(o => (o.id === order.id ? order : o)) : [...prev, order];
        });
    
        if (order.status === 'DONE' && originalOrder?.status !== 'DONE') {
            setInventory(prevInv => {
                let newInv = [...prevInv];

                // 1. Deduct raw materials from formula
                const totalVolume = order.yield.theoreticalMl;
                order.formula.forEach(line => {
                    const productDetails = products.find(p => p.id === line.materialId);
                    if (!productDetails) {
                        console.warn(`Product details not found for material ID ${line.materialId}`);
                        return;
                    }

                    const volumeMl = (line.percentage / 100) * totalVolume;
                    const density = line.density || productDetails.density || 1;
                    const quantityG = volumeMl * density;

                    let quantityToDeduct = 0;
                    if (productDetails.baseUnit === 'g') {
                        quantityToDeduct = quantityG;
                    } else if (productDetails.baseUnit === 'ml') {
                        quantityToDeduct = volumeMl;
                    } else {
                        console.warn(`Unsupported base unit '${productDetails.baseUnit}' for formula deduction.`);
                        return;
                    }

                    const invIndex = newInv.findIndex(i => i.branchId === order.branchId && i.productId === line.materialId);
                    if (invIndex > -1) {
                        newInv[invIndex].quantity -= quantityToDeduct;
                    }
                });

                // 2. Deduct packaging items
                const unitsProduced = order.yield.actualUnits || order.unitsRequested;
                order.packagingItems.forEach(item => {
                    const quantityToDeduct = item.qtyPerUnit * unitsProduced;
                    const invIndex = newInv.findIndex(i => i.branchId === order.branchId && i.productId === item.productId);
                    if (invIndex > -1) {
                        newInv[invIndex].quantity -= quantityToDeduct;
                    }
                });
                
                return newInv;
            });
            addToast(`Order ${order.id} completed. Inventory updated.`, 'success');
        } else {
             addToast(`Order ${order.id} status updated to ${order.status}.`, 'info');
        }
    };

    const handleSaveProductionTask = (task: ProductionTask) => {
        setProductionTasks(prev => {
            const exists = prev.some(t => t.id === task.id);
            return exists ? prev.map(t => t.id === task.id ? task : t) : [...prev, { ...task, id: Date.now() }];
        });
    };

    const handleSaveIntegrations = (newSettings: IntegrationSettings) => {
        setIntegrationSettings(newSettings);
        addToast('تم حفظ إعدادات التكامل بنجاح!', 'success');
    };

    const chatbotDataContext: ChatbotDataContext = useMemo(() => ({
        sales,
        purchases: purchaseInvoices,
        products,
        inventory,
        customers,
        employees,
        branches,
        expenses,
        suppliers,
    }), [sales, purchaseInvoices, products, inventory, customers, employees, branches, expenses, suppliers]);

    const lowStockItemsCount = useMemo(() => inventory.filter(i => i.quantity <= i.minStock && i.minStock > 0).length, [inventory]);
    const pendingLeaveRequestsCount = useMemo(() => leaveRequests.filter(r => r.status === 'Pending').length, [leaveRequests]);
    const pendingAdvanceRequestsCount = useMemo(() => advanceRequests.filter(r => r.status === 'Pending').length, [advanceRequests]);
    const pendingGeneralRequestsCount = useMemo(() => generalRequests.filter(r => r.status === 'Pending').length, [generalRequests]);
    const totalPendingHRRequests = pendingLeaveRequestsCount + pendingAdvanceRequestsCount + pendingGeneralRequestsCount;


    const sessionsForView = (user?.role === Role.BranchManager || user?.role === Role.ShopAssistant)
    ? posSessions.filter(s => s.branchId === user.branchId)
    : posSessions;

    // --- Role-based Data Filtering ---
    const isBranchScopedUser = useMemo(() =>
        user?.role === Role.BranchManager || user?.role === Role.ShopAssistant,
        [user]
    );

    const salesForView = useMemo(() => isBranchScopedUser ? sales.filter(s => s.branchId === user!.branchId) : sales, [sales, user, isBranchScopedUser]);
    const purchaseInvoicesForView = useMemo(() => isBranchScopedUser ? purchaseInvoices.filter(p => p.branchId === user!.branchId) : purchaseInvoices, [purchaseInvoices, user, isBranchScopedUser]);
    const inventoryForView = useMemo(() => isBranchScopedUser ? inventory.filter(i => i.branchId === user!.branchId) : inventory, [inventory, user, isBranchScopedUser]);
    const employeesForView = useMemo(() => isBranchScopedUser ? employees.filter(e => e.branchId === user!.branchId) : employees, [employees, user, isBranchScopedUser]);
    const expensesForView = useMemo(() => isBranchScopedUser ? expenses.filter(e => e.branchId === user!.branchId) : expenses, [expenses, user, isBranchScopedUser]);


    if (!user) {
        return (
            <AuthContext.Provider value={authContextValue}>
                <LoginScreen />
            </AuthContext.Provider>
        );
    }
    
    const renderView = () => {
        if (activeView.startsWith('MyProfile')) return <EmployeePortal user={user} employees={employees} leaveRequests={leaveRequests} advanceRequests={advanceRequests} generalRequests={generalRequests} attendance={attendance} salaryPayments={salaryPayments} onSaveLeaveRequest={handleSaveLeaveRequest} onSaveAdvanceRequest={handleSaveAdvanceRequest} onSaveGeneralRequest={handleSaveGeneralRequest} />;
        // FIX: Pass suppliers to Dashboard
        if (activeView.startsWith('Dashboard')) return <Dashboard sales={salesForView} purchases={purchaseInvoicesForView} employees={employeesForView} inventory={inventoryForView} products={products} branches={branches} settings={settings} accounts={chartOfAccounts} expenses={expensesForView} renewables={renewables} leaveRequests={leaveRequests} advanceRequests={advanceRequests} generalRequests={generalRequests} suppliers={suppliers} />;
        
        // Sales Module
        if (activeView.startsWith('Sales/Invoices') || activeView === 'Sales') return <SalesInvoices sales={salesForView} onSave={handleSaveSale} branches={branches} products={products} inventory={inventoryForView} customers={customers} />;
        if (activeView.startsWith('Sales/Quotations')) return <SalesQuotations quotations={salesQuotations} onSave={handleSaveSalesQuotation} onConvertToInvoice={handleConvertQuoteToInvoice} customers={customers} products={products} />;
        if (activeView.startsWith('Sales/Returns')) return <SalesReturns returns={salesReturns} sales={sales} customers={customers} />;
        if (activeView.startsWith('Sales/CreditNotes')) return <CreditNotes notes={creditNotes} customers={customers} />;
        if (activeView.startsWith('Sales/Recurring')) return <RecurringInvoices invoices={recurringInvoices} customers={customers} />;
        if (activeView.startsWith('Sales/Payments')) return <CustomerPayments payments={customerPayments} customers={customers} />;

        // Purchases Module
        if (activeView.startsWith('Purchases/Invoices')) return <PurchaseInvoices invoices={purchaseInvoicesForView} onSave={handleSavePurchaseInvoice} branches={branches} products={products} sales={salesForView} inventory={inventoryForView} suppliers={suppliers} />;
        if (activeView.startsWith('Purchases/Suppliers')) return <Suppliers suppliers={suppliers} onSave={handleSaveSupplier} />;
        if (activeView.startsWith('Purchases/Requests')) return <PurchaseRequests requests={purchaseRequests} employees={employees} branches={branches} products={products} />;
        if (activeView.startsWith('Purchases/RFQs')) return <RequestForQuotations rfqs={rfqs} suppliers={suppliers} products={products} />;
        if (activeView.startsWith('Purchases/Quotations')) return <PurchaseQuotations quotations={purchaseQuotations} suppliers={suppliers} />;
        if (activeView.startsWith('Purchases/Orders')) return <PurchaseOrders orders={purchaseOrders} suppliers={suppliers} products={products} />;
        if (activeView.startsWith('Purchases/Returns')) return <PurchaseReturns returns={purchaseReturns} suppliers={suppliers} products={products} />;
        if (activeView.startsWith('Purchases/DebitNotes')) return <DebitNotes notes={debitNotes} suppliers={suppliers} />;
        if (activeView.startsWith('Purchases/Payments')) return <SupplierPayments payments={supplierPayments} suppliers={suppliers} />;
        
        // Inventory Module
        if (activeView.startsWith('Inventory/Products/')) {
            const productId = parseInt(activeView.split('/')[2], 10);
            const product = products.find(p => p.id === productId);
            if (product) {
                return <ProductDetailPage
                    key={productId}
                    product={product}
                    inventory={inventory}
                    sales={sales}
                    purchaseInvoices={purchaseInvoices}
                    users={users}
                    branches={branches}
                    products={products}
                    inventoryAdjustmentLogs={inventoryAdjustmentLogs}
                    onBack={() => setActiveView('Inventory/Products')}
                    onEditProduct={handleOpenProductModal}
                    onTransferInventory={handleTransferInventory}
                    onAdjustInventory={handleAdjustInventory}
                />;
            }
        }
        if (activeView === 'Inventory/Products') {
            return <ProductsPage 
                products={products}
                onProductSelect={(product) => setActiveView(`Inventory/Products/${product.id}`)}
                onAddNew={() => handleOpenProductModal({})}
            />;
        }
        if (['Inventory/Stocktakes', 'Inventory/Transfers'].includes(activeView)) {
             return <div className="glass-pane" style={{padding: '2rem', textAlign: 'center'}}>Coming Soon: {activeView.split('/')[1]}</div>
        }
        
        // Other Modules
        if (activeView.startsWith('POS/Start')) return <POS products={products} inventory={inventory} customers={customers} onSaveCustomer={handleSaveCustomer} onSave={handleSaveSale} integrationSettings={integrationSettings} branches={branches} />;
        if (activeView.startsWith('POS/Sessions')) return <POSSessions sessions={sessionsForView} activeSession={activeSession} sales={sales} branches={branches} employees={employees} onStartSession={handleStartSession} onCloseSession={handleCloseSession} setActiveView={setActiveView} />;
        if (activeView.startsWith('Customers')) return <Customers customers={customers} onSave={handleSaveCustomer} whatsappSettings={integrationSettings.whatsapp} branches={branches} />;
        if (activeView.startsWith('Manufacturing/Orders')) return <ManufacturingOrderPage order={productionOrders[0]} branches={branches} products={products} inventory={inventoryForView} employees={employeesForView} onSave={handleSaveProductionOrder} />;
        if (activeView.startsWith('Manufacturing/Tasks')) return <ProductionTasks tasks={productionTasks} orders={productionOrders} employees={employeesForView} onSave={handleSaveProductionTask} />;
        if (activeView.startsWith('Finance/Expenses')) return <Expenses expenses={expensesForView} onSave={handleSaveExpense} branches={branches} financialAccounts={financialAccounts} />;
        if (activeView.startsWith('Finance/Accounts')) return <FinancialAccounts financialAccounts={financialAccounts} branches={branches} />;
        if (activeView.startsWith('Ledger/ChartOfAccounts')) return <ChartOfAccountsPage accounts={chartOfAccounts} onSave={() => {}} />;
        if (activeView.startsWith('HR/Employees')) return <Employees employees={employeesForView} onSave={handleSaveEmployee} onDelete={handleDeleteEmployee} branches={branches} />;
        if (activeView.startsWith('HR/Attendance')) return <Attendance employees={employeesForView} attendanceRecords={attendance} onRecordAttendance={handleRecordAttendance} />;
        if (activeView.startsWith('HR/LeaveRequests')) return <LeaveRequests employees={employees} leaveRequests={leaveRequests} onSaveRequest={handleSaveLeaveRequest} />;
        if (activeView.startsWith('HR/AdvanceRequests')) return <AdvanceRequestsPage requests={advanceRequests} employees={employees} onSaveRequest={handleSaveAdvanceRequest} />;
        if (activeView.startsWith('HR/GeneralRequests')) return <GeneralRequestsPage requests={generalRequests} employees={employees} onSaveRequest={handleSaveGeneralRequest} />;
        if (activeView.startsWith('HR/Salaries')) return <Salaries employees={employeesForView} payments={salaryPayments} onRunPayroll={handleRunPayroll} />;
        if (activeView.startsWith('Branches')) return <Branches branches={branches} onSave={handleSaveBranch} />;
        if (activeView.startsWith('Renewals')) return <Licenses renewables={renewables} setRenewables={setRenewables} onCheckReminders={checkAndSendRenewalReminders} />;
        // FIX: Pass suppliers to Reports
        if (activeView.startsWith('Reports')) return <Reports sales={salesForView} purchases={purchaseInvoicesForView} products={products} branches={branches} expenses={expensesForView} customers={customers} financialAccounts={financialAccounts} activeReport={activeView} suppliers={suppliers} />;
        
        // Settings
        if (activeView.startsWith('Settings/General')) return <Settings settings={settings} setSettings={setSettings} />;
        if (activeView.startsWith('Settings/Sales')) return <SettingsSales />;
        if (activeView.startsWith('Settings/Purchases')) return <SettingsPurchases />;
        if (activeView.startsWith('Settings/Suppliers')) return <SettingsSuppliers />;
        if (activeView.startsWith('Settings/Integrations')) return <IntegrationsPage settings={integrationSettings} onSave={handleSaveIntegrations} />;
        if (activeView.startsWith('Users')) return <UsersPage users={users} branches={branches} onSave={handleSaveUser} onViewPermissions={setViewingPermissionsFor} />;
        
        return <Dashboard sales={salesForView} purchases={purchaseInvoicesForView} employees={employeesForView} inventory={inventoryForView} products={products} branches={branches} settings={settings} accounts={chartOfAccounts} expenses={expensesForView} renewables={renewables} leaveRequests={leaveRequests} advanceRequests={advanceRequests} generalRequests={generalRequests} suppliers={suppliers} />;
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            <div className={`app-layout theme-${theme}`}>
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    lowStockCount={lowStockItemsCount} 
                    pendingLeavesCount={totalPendingHRRequests}
                />
                <div className="main-content-wrapper">
                    <Header 
                        viewTitle={activeView} 
                        theme={theme} 
                        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
                        products={products}
                        onProductSelect={(product) => setActiveView(`Inventory/Products/${product.id}`)}
                        onViewMyPermissions={() => setViewingPermissionsFor(user)}
                    />
                    <main className="main-content">
                        {renderView()}
                    </main>
                </div>
                <AIChatbot dataContext={chatbotDataContext} />
                {editingProduct && (
                    <ProductModal
                        product={editingProduct}
                        allProducts={products}
                        onClose={handleCloseProductModal}
                        onSave={handleSaveAndCloseProductModal}
                    />
                )}
                {viewingPermissionsFor && (
                    <PermissionsViewModal
                        user={viewingPermissionsFor}
                        onClose={() => setViewingPermissionsFor(null)}
                    />
                )}
            </div>
        </AuthContext.Provider>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

export default App;