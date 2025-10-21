import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartBarIcon, CubeIcon, CurrencyDollarIcon, DocumentTextIcon, PrinterIcon, ShoppingCartIcon, SparklesIcon } from '../components/Icon';
import StatCard from '../components/StatCard';
import { useToasts } from '../components/Toast';
import { getSalesForecastWithGemini } from '../services/geminiService';
import { Branch, Customer, Expense, ExpenseCategory, FinancialAccount, Product, PurchaseInvoice, Sale, SaleItem, Supplier } from '../types';

interface ReportsProps {
    sales: Sale[];
    purchases: PurchaseInvoice[];
    products: Product[];
    branches: Branch[];
    expenses: Expense[];
    customers: Customer[];
    financialAccounts: FinancialAccount[];
    activeReport: string;
    suppliers: Supplier[];
}

const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#6366f1'];
const SALES_COLOR = '#10b981';
const PURCHASES_COLOR = '#3b82f6';
const FORECAST_COLOR = '#8b5cf6';

const formatCurrency = (val: number) => `${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} د.ك`;


// Filter Bar Component
const FilterBar: React.FC<{
    filters: any;
    onFilterChange: (filters: any) => void;
    branches: Branch[];
    showBranchFilter: boolean;
    showDateFilter: boolean;
}> = ({ filters, onFilterChange, branches, showBranchFilter, showDateFilter }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="glass-pane reports-filter-bar" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <h3 className="reports-filter-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>مرشحات التقرير</h3>
            <div className="reports-filter-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {showDateFilter && (
                    <div className="reports-date-inputs">
                        <input type="date" name="start" value={filters.start} onChange={handleInputChange} className="form-input reports-date-input" style={{width: '180px'}}/>
                        <span>إلى</span>
                        <input type="date" name="end" value={filters.end} onChange={handleInputChange} className="form-input reports-date-input" style={{width: '180px'}}/>
                    </div>
                )}
                {showBranchFilter && (
                    <select name="branch" value={filters.branch} onChange={handleInputChange} className="form-select reports-branch-select" style={{width: '220px'}}>
                        <option value="all">كل الفروع</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                )}
                 <button className="btn btn-ghost reports-print-button">
                    <PrinterIcon style={{width: '20px', height: '20px'}}/>
                    طباعة التقرير
                </button>
            </div>
        </div>
    );
};

// Brand Performance Report
const BrandPerformanceReport: React.FC<{sales: Sale[], filters: any}> = ({ sales, filters }) => {
    const brandData = useMemo(() => {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const dateMatch = (!filters.start || saleDate >= new Date(filters.start)) && (!filters.end || saleDate <= new Date(filters.end));
            return dateMatch;
        });

        const data: { [key: string]: { totalSales: number; unitsSold: number; invoiceCount: number; } } = {
            'Arabiva': { totalSales: 0, unitsSold: 0, invoiceCount: 0 },
            'Generic': { totalSales: 0, unitsSold: 0, invoiceCount: 0 },
        };

        filteredSales.forEach(sale => {
            data[sale.brand].totalSales += sale.totalAmount;
            data[sale.brand].invoiceCount++;
            data[sale.brand].unitsSold += sale.items.reduce((sum, item) => sum + item.quantity, 0);
        });
        
        const arabiva = data['Arabiva'];
        const generic = data['Generic'];
        
        return {
            chartData: [
                { name: 'Arabiva', sales: arabiva.totalSales },
                { name: 'Generic', sales: generic.totalSales }
            ],
            tableData: [
                { brand: 'Arabiva', ...arabiva, avgSale: arabiva.invoiceCount > 0 ? arabiva.totalSales / arabiva.invoiceCount : 0 },
                { brand: 'Generic', ...generic, avgSale: generic.invoiceCount > 0 ? generic.totalSales / generic.invoiceCount : 0 },
            ]
        };
    }, [sales, filters]);

    return (
        <div className="reports-brand-performance-container" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="glass-pane reports-chart-container" style={{ padding: '1.5rem', height: '400px' }}>
                 <h3 className="reports-chart-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>مقارنة المبيعات بين العلامات التجارية</h3>
                 <div className="reports-chart-wrapper">
                     <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                        <BarChart data={brandData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={val => formatCurrency(val as number)} />
                            <Tooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} cursor={{fill: 'var(--highlight-hover)'}}/>
                            <Bar dataKey="sales" name="المبيعات" radius={[8, 8, 0, 0]}>
                                {brandData.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                 </div>
            </div>
             <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <h3 className="reports-table-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>تفاصيل أداء العلامات التجارية</h3>
                <div className="table-wrapper reports-table-wrapper">
                    <table className="reports-table">
                        <thead><tr><th>العلامة التجارية</th><th>إجمالي المبيعات</th><th>عدد الوحدات المباعة</th><th>عدد الفواتير</th><th>متوسط قيمة الفاتورة</th></tr></thead>
                        <tbody>
                            {brandData.tableData.map(d => (
                                <tr key={d.brand}>
                                    <td style={{fontWeight: 600}}>{d.brand}</td>
                                    <td style={{color: 'var(--secondary-color)', fontWeight: 'bold'}}>{formatCurrency(d.totalSales)}</td>
                                    <td>{d.unitsSold.toLocaleString()}</td>
                                    <td>{d.invoiceCount.toLocaleString()}</td>
                                    <td>{formatCurrency(d.avgSale)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// Sales Report
const SalesReport: React.FC<{sales: Sale[], branches: Branch[], filters: any}> = ({ sales, branches, filters }) => {
    const filteredSales = useMemo(() => sales.filter(s => {
        const saleDate = new Date(s.date);
        const branchMatch = filters.branch === 'all' || s.branchId === parseInt(filters.branch);
        const dateMatch = (!filters.start || saleDate >= new Date(filters.start)) && (!filters.end || saleDate <= new Date(filters.end));
        return branchMatch && dateMatch;
    }), [sales, filters]);

    const totalSales = useMemo(() => filteredSales.reduce((sum, s) => sum + s.totalAmount, 0), [filteredSales]);
    const invoiceCount = filteredSales.length;
    const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0;
    
    const salesByBranch = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredSales.forEach(s => {
            const branchName = branches.find(b => b.id === s.branchId)?.name || 'Unknown';
            data[branchName] = (data[branchName] || 0) + s.totalAmount;
        });
        return Object.entries(data).map(([name, sales]) => ({ name, sales }));
    }, [filteredSales, branches]);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="إجمالي المبيعات للفترة" value={formatCurrency(totalSales)} icon={CurrencyDollarIcon} iconBg="linear-gradient(135deg, #10b981, #34d399)" />
                <StatCard title="عدد الفواتير" value={invoiceCount.toLocaleString('ar-EG')} icon={DocumentTextIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                <StatCard title="متوسط قيمة الفاتورة" value={formatCurrency(avgInvoiceValue)} icon={ChartBarIcon} iconBg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
            </div>
            
            {filters.branch === 'all' && salesByBranch.length > 1 && (
                <div className="glass-pane" style={{ padding: '1.5rem', height: '400px' }}>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>المبيعات حسب الفرع</h3>
                     <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                        <BarChart data={salesByBranch}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={val => formatCurrency(val as number)} />
                            <Tooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} cursor={{fill: 'var(--highlight-hover)'}} formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="sales" name="المبيعات" fill={SALES_COLOR} radius={[8, 8, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                </div>
            )}
             
             <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>تفاصيل المبيعات</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>الفرع</th>
                                <th>العميل</th>
                                <th>المبلغ الإجمالي</th>
                                <th>حالة الدفع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(s => (
                                <tr key={s.id}>
                                    <td>{s.invoiceNumber}</td>
                                    <td>{s.date}</td>
                                    <td>{branches.find(b => b.id === s.branchId)?.name}</td>
                                    <td>{s.customerName}</td>
                                    <td style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>{formatCurrency(s.totalAmount)}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
                                            color: s.paymentStatus === 'Pending' ? '#111' : '#fff',
                                            background: s.paymentStatus === 'Paid' ? '#10b981' : s.paymentStatus === 'Pending' ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {s.paymentStatus === 'Paid' ? 'مدفوع' : s.paymentStatus === 'Pending' ? 'قيد الانتظار' : 'متأخر'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// Branch Sales Report
const BranchSalesReport: React.FC<{sales: Sale[], branches: Branch[], products: Product[], filters: any}> = ({ sales, branches, products, filters }) => {
    const branchSalesData = useMemo(() => {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const dateMatch = (!filters.start || saleDate >= new Date(filters.start)) && (!filters.end || saleDate <= new Date(filters.end));
            return dateMatch;
        });

        const dataByBranch: { [key: number]: { totalSales: number; invoiceCount: number; items: SaleItem[] } } = {};

        filteredSales.forEach(sale => {
            if (!dataByBranch[sale.branchId]) {
                dataByBranch[sale.branchId] = { totalSales: 0, invoiceCount: 0, items: [] };
            }
            dataByBranch[sale.branchId].totalSales += sale.totalAmount;
            dataByBranch[sale.branchId].invoiceCount++;
            dataByBranch[sale.branchId].items.push(...sale.items);
        });
        
        return Object.entries(dataByBranch).map(([branchIdStr, data]) => {
            const branchId = Number(branchIdStr);
            const branch = branches.find(b => b.id === branchId);
            
            const productSales = data.items.reduce((acc: {[key: number]: number}, item) => {
                acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
                return acc;
            }, {});
            
            let topProduct = 'N/A';
            if (Object.keys(productSales).length > 0) {
                const topProductId = Number(Object.keys(productSales).reduce((a, b) => productSales[Number(a)] > productSales[Number(b)] ? a : b));
                topProduct = products.find(p => p.id === topProductId)?.name || 'Unknown';
            }

            return {
                branchId: branchId,
                branchName: branch?.name || 'Unknown',
                totalSales: data.totalSales,
                invoiceCount: data.invoiceCount,
                avgInvoiceValue: data.invoiceCount > 0 ? data.totalSales / data.invoiceCount : 0,
                topProduct: topProduct,
            };
        }).sort((a, b) => b.totalSales - a.totalSales);

    }, [sales, branches, products, filters]);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="glass-pane" style={{ padding: '1.5rem', height: '400px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>إجمالي المبيعات حسب الفرع</h3>
                <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                    <BarChart data={branchSalesData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                        <XAxis dataKey="branchName" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" tickFormatter={val => formatCurrency(val as number)} />
                        <Tooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} cursor={{fill: 'var(--highlight-hover)'}} formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="totalSales" name="إجمالي المبيعات" fill={SALES_COLOR} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>تحليل مبيعات الفروع</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>الفرع</th>
                                <th>إجمالي المبيعات</th>
                                <th>عدد الفواتير</th>
                                <th>متوسط قيمة الفاتورة</th>
                                <th>المنتج الأكثر مبيعاً</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branchSalesData.map(b => (
                                <tr key={b.branchId}>
                                    <td style={{ fontWeight: 600 }}>{b.branchName}</td>
                                    <td style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{formatCurrency(b.totalSales)}</td>
                                    <td>{b.invoiceCount.toLocaleString()}</td>
                                    <td>{formatCurrency(b.avgInvoiceValue)}</td>
                                    <td>{b.topProduct}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// Purchases Report
const PurchasesReport: React.FC<{purchases: PurchaseInvoice[], branches: Branch[], filters: any, suppliers: Supplier[]}> = ({ purchases, branches, filters, suppliers }) => {
     const filteredPurchases = useMemo(() => purchases.filter(p => {
        const purchaseDate = new Date(p.date);
        const branchMatch = filters.branch === 'all' || p.branchId === parseInt(filters.branch);
        const dateMatch = (!filters.start || purchaseDate >= new Date(filters.start)) && (!filters.end || purchaseDate <= new Date(filters.end));
        return branchMatch && dateMatch;
    }), [purchases, filters]);
    const totalPurchases = useMemo(() => filteredPurchases.reduce((sum, p) => sum + p.amount, 0), [filteredPurchases]);
     return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <StatCard title="إجمالي المشتريات للفترة المحددة" value={formatCurrency(totalPurchases)} icon={ShoppingCartIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>تفاصيل المشتريات</h3>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>المعرف</th><th>التاريخ</th><th>الفرع</th><th>المورد</th><th>المبلغ</th></tr></thead>
                        <tbody>
                             {filteredPurchases.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.date}</td>
                                    <td>{branches.find(b => b.id === p.branchId)?.name}</td>
                                    <td>{suppliers.find(s => s.id === p.supplierId)?.name || 'غير معروف'}</td>
                                    <td>{formatCurrency(p.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

// Product Sales Report
const ProductSalesReport: React.FC<{sales: Sale[], products: Product[], filters: any}> = ({ sales, products, filters }) => {
    const processedData = useMemo(() => {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            const branchMatch = filters.branch === 'all' || s.branchId === parseInt(filters.branch);
            const dateMatch = (!filters.start || saleDate >= new Date(filters.start)) && (!filters.end || saleDate <= new Date(filters.end));
            return branchMatch && dateMatch;
        });

        const productData = filteredSales.flatMap(s => s.items).reduce((acc: { [key: number]: { quantity: number, revenue: number } }, item) => {
            if (!acc[item.productId]) {
                acc[item.productId] = { quantity: 0, revenue: 0 };
            }
            acc[item.productId].quantity += item.quantity;
            acc[item.productId].revenue += item.total;
            return acc;
        }, {} as { [key: number]: { quantity: number; revenue: number } });

        return Object.entries(productData).map(([productId, data]) => {
            const product = products.find(p => p.id === Number(productId));
            const stats = data as { quantity: number; revenue: number };
            return {
                productId: Number(productId),
                productName: product?.name || 'Unknown Product',
                productSku: product?.sku || 'N/A',
                totalQuantity: stats.quantity,
                totalRevenue: stats.revenue
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [sales, products, filters]);

    const totalUniqueProductsSold = processedData.length;

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <StatCard title="إجمالي المنتجات المباعة (الفريدة)" value={totalUniqueProductsSold.toString()} icon={CubeIcon} iconBg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>تفاصيل مبيعات المنتجات</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>SKU</th>
                                <th>إجمالي الكمية المباعة</th>
                                <th>إجمالي الإيرادات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map(p => (
                                <tr key={p.productId}>
                                    <td style={{ fontWeight: 600 }}>{p.productName}</td>
                                    <td>{p.productSku}</td>
                                    <td>{p.totalQuantity.toLocaleString()}</td>
                                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(p.totalRevenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Expenses Report
const ExpensesReport: React.FC<{expenses: Expense[], branches: Branch[], filters: any}> = ({ expenses, branches, filters }) => {
    const filteredExpenses = useMemo(() => expenses.filter(e => {
        const expenseDate = new Date(e.date);
        const branchMatch = filters.branch === 'all' || e.branchId === parseInt(filters.branch);
        const dateMatch = (!filters.start || expenseDate >= new Date(filters.start)) && (!filters.end || expenseDate <= new Date(filters.end));
        return branchMatch && dateMatch;
    }), [expenses, filters]);
    const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);
    const expensesByCategory = useMemo(() => {
        const data: {[key in ExpenseCategory]?: number} = {};
        filteredExpenses.forEach(e => {
            data[e.category] = (data[e.category] || 0) + e.amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value: value || 0 }));
    }, [filteredExpenses]);
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <StatCard title="إجمالي المصروفات للفترة المحددة" value={formatCurrency(totalExpenses)} icon={ChartBarIcon} iconBg="linear-gradient(135deg, #ef4444, #f87171)" />
             <div className="glass-pane" style={{ padding: '1.5rem', height: '400px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>المصروفات حسب الفئة</h3>
                <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                    <PieChart>
                        <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                            {expensesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
             </div>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>تفاصيل المصروفات</h3>
                 <div className="table-wrapper">
                    <table>
                        <thead><tr><th>التاريخ</th><th>الفرع</th><th>الفئة</th><th>الوصف</th><th>المبلغ</th></tr></thead>
                        <tbody>
                            {filteredExpenses.map(e => (
                                <tr key={e.id}>
                                    <td>{e.date}</td>
                                    <td>{branches.find(b => b.id === e.branchId)?.name}</td>
                                    <td>{e.category}</td>
                                    <td>{e.description}</td>
                                    <td style={{color: '#ef4444'}}>{formatCurrency(e.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    )
};

// Customers Report
const CustomersReport: React.FC<{customers: Customer[]}> = ({ customers }) => {
    const formatBalance = (balance: number) => {
        const color = balance > 0 ? '#ef4444' : balance < 0 ? '#10b981' : 'var(--text-primary)';
        const text = balance > 0 ? `مدين بـ ${balance.toLocaleString()}` : balance < 0 ? `دائن بـ ${(-balance).toLocaleString()}` : 'لا يوجد رصيد';
        return <span style={{ color, fontWeight: 600 }}>{text}</span>;
    };
    return (
         <div className="glass-pane reports-customers-container" style={{ padding: '1.5rem' }}>
            <h3 className="reports-table-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>أرصدة العملاء</h3>
            <div className="table-wrapper reports-table-wrapper">
                <table className="reports-table">
                    <thead><tr><th>العميل</th><th>الهاتف</th><th>البريد الإلكتروني</th><th>الرصيد الحالي</th></tr></thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{c.phone}</td>
                                <td>{c.email}</td>
                                <td>{formatBalance(c.balance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

// Accounts Report
const AccountsReport: React.FC<{accounts: FinancialAccount[], branches: Branch[]}> = ({ accounts, branches }) => {
    return (
        <div className="glass-pane reports-accounts-container" style={{ padding: '1.5rem' }}>
            <h3 className="reports-table-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>أرصدة الحسابات المالية</h3>
            <div className="table-wrapper reports-table-wrapper">
                <table className="reports-table">
                    <thead><tr><th>اسم الحساب</th><th>النوع</th><th>الفرع</th><th>الرصيد</th></tr></thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id}>
                                <td>{acc.name}</td>
                                <td>{acc.type === 'Bank' ? 'بنك' : 'خزينة'}</td>
                                <td>{branches.find(b => b.id === acc.branchId)?.name || 'N/A'}</td>
                                <td style={{color: 'var(--secondary-color)', fontWeight: 700, fontSize: '1.1rem'}}>{formatCurrency(acc.balance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

// Summary Report
const SummaryReport: React.FC<Omit<ReportsProps, 'activeReport' | 'expenses' | 'customers' | 'financialAccounts' | 'suppliers'>> = ({ sales, purchases, branches }) => {
    const totalSales = useMemo(() => sales.reduce((sum, s) => sum + s.totalAmount, 0), [sales]);
    const totalPurchases = useMemo(() => purchases.reduce((sum, p) => sum + p.amount, 0), [purchases]);
    const grossProfit = totalSales - totalPurchases;
     const monthlyPerformance = useMemo(() => {
        const data: { [key: string]: { month: string, sales: number, purchases: number } } = {};
        [...sales, ...purchases].forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!data[monthKey]) data[monthKey] = { month: monthLabel, sales: 0, purchases: 0 };
        });
        sales.forEach(s => {
            const date = new Date(s.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
             if(data[monthKey]) data[monthKey].sales += s.totalAmount;
        });
        purchases.forEach(p => {
            const date = new Date(p.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
             if(data[monthKey]) data[monthKey].purchases += p.amount;
        });
        return Object.values(data).sort((a,b) => a.month.localeCompare(b.month));
    }, [sales, purchases]);
    return (
        <div className="reports-summary-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="reports-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="إجمالي المبيعات" value={formatCurrency(totalSales)} icon={CurrencyDollarIcon} iconBg="linear-gradient(135deg, #10b981, #34d399)" />
                <StatCard title="إجمالي المشتريات" value={formatCurrency(totalPurchases)} icon={ShoppingCartIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                <StatCard title="إجمالي الربح" value={formatCurrency(grossProfit)} icon={ChartBarIcon} iconBg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
            </div>
            <div className="glass-pane reports-chart-container" style={{ padding: '1.5rem', height: '400px' }}>
                <h3 className="reports-chart-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>الأداء الشهري</h3>
                <div className="reports-chart-wrapper">
                    <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                        <LineChart data={monthlyPerformance} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={val => formatCurrency(val as number)} />
                            <Tooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} cursor={{fill: 'var(--highlight-hover)'}}/>
                            <Legend />
                            <Line type="monotone" name="المبيعات" dataKey="sales" stroke={SALES_COLOR} strokeWidth={2} />
                            <Line type="monotone" name="المشتريات" dataKey="purchases" stroke={PURCHASES_COLOR} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
};

// Forecast Report
interface ForecastData {
    forecast: { month: string; predictedSales: number }[];
    analysis: string;
}
const ForecastReport: React.FC<{sales: Sale[]}> = ({ sales }) => {
    const { addToast } = useToasts();
    const [isLoading, setIsLoading] = useState(false);
    const [forecast, setForecast] = useState<ForecastData | null>(null);

    const historicalData = useMemo(() => {
        const monthlySales: { [key: string]: number } = {};
        sales.forEach(s => {
            const monthKey = s.date.substring(0, 7); // YYYY-MM
            monthlySales[monthKey] = (monthlySales[monthKey] || 0) + s.totalAmount;
        });
        return Object.entries(monthlySales)
            .map(([month, totalSales]) => ({ month, totalSales }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [sales]);
    
    const handleGenerateForecast = async () => {
        setIsLoading(true);
        setForecast(null);
        addToast('Generating forecast with AI, this may take a moment...', 'info');
        try {
            const result = await getSalesForecastWithGemini(historicalData);
            setForecast(result);
            addToast('Forecast generated successfully!', 'success');
        } catch (err) {
            addToast('Failed to generate forecast. Please try again.', 'error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = useMemo(() => {
        const historicalPoints = historicalData.map(d => ({
            month: d.month,
            historical: d.totalSales,
        }));

        if (!forecast) return historicalPoints;

        const forecastPoints = forecast.forecast.map(f => ({
            month: f.month,
            forecast: f.predictedSales,
        }));

        return [...historicalPoints, ...forecastPoints];
    }, [historicalData, forecast]);

    return (
        <div className="reports-forecast-container" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                 <div className="reports-forecast-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="reports-forecast-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>توقعات المبيعات للربع القادم</h3>
                    <button onClick={handleGenerateForecast} disabled={isLoading} className="btn btn-warning reports-forecast-button">
                        <SparklesIcon style={{width: '20px', height: '20px'}}/>
                        {isLoading ? '...جاري الإنشاء' : 'إنشاء توقعات'}
                    </button>
                </div>
                <p className="reports-forecast-description" style={{color: 'var(--text-secondary)'}}>
                    استخدم الذكاء الاصطناعي لتحليل بيانات المبيعات التاريخية وتوقع الأداء المستقبلي للمساعدة في اتخاذ قرارات أفضل.
                </p>
            </div>
            
            {isLoading && (
                 <div className="glass-pane reports-forecast-loading" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                    <p>يقوم الذكاء الاصطناعي بتحليل بياناتك...</p>
                 </div>
            )}

            {forecast && (
                <div className="reports-forecast-results" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="glass-pane reports-forecast-chart-container" style={{ padding: '1.5rem', height: '400px' }}>
                        <h3 className="reports-forecast-chart-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>مخطط المبيعات التاريخية والمتوقعة</h3>
                        <div className="reports-forecast-chart-wrapper">
                            <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" tickFormatter={val => formatCurrency(val as number)} />
                                    <Tooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} cursor={{fill: 'var(--highlight-hover)'}}/>
                                    <Legend />
                                    <Line type="monotone" name="المبيعات التاريخية" dataKey="historical" stroke={SALES_COLOR} strokeWidth={2} connectNulls />
                                    <Line type="monotone" name="المبيعات المتوقعة" dataKey="forecast" stroke={FORECAST_COLOR} strokeWidth={2} strokeDasharray="5 5" connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div className="glass-pane reports-forecast-analysis" style={{ padding: '1.5rem' }}>
                        <h3 className="reports-forecast-analysis-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><SparklesIcon /> تحليل الذكاء الاصطناعي</h3>
                        <p className="reports-forecast-analysis-text" style={{color: 'var(--text-primary)', lineHeight: 1.6}}>{forecast.analysis}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const Reports: React.FC<ReportsProps> = (props) => {
    const { branches, activeReport } = props;
    const [filters, setFilters] = useState({
        branch: 'all',
        start: getPastDate(90),
        end: new Date().toISOString().split('T')[0],
    });

    const reportType = useMemo(() => activeReport.split('/')[1] || 'Summary', [activeReport]);

    const renderReport = () => {
        switch (reportType) {
            case 'Sales':
                return <SalesReport sales={props.sales} branches={props.branches} filters={filters} />;
            case 'BrandPerformance':
                return <BrandPerformanceReport sales={props.sales} filters={filters} />;
            case 'BranchSales':
                return <BranchSalesReport sales={props.sales} branches={props.branches} products={props.products} filters={filters} />;
            case 'Purchases':
                return <PurchasesReport purchases={props.purchases} branches={props.branches} filters={filters} suppliers={props.suppliers} />;
            case 'Products':
                return <ProductSalesReport sales={props.sales} products={props.products} filters={filters} />;
            case 'Expenses':
                 return <ExpensesReport expenses={props.expenses} branches={props.branches} filters={filters} />;
            case 'Customers':
                return <CustomersReport customers={props.customers} />;
            case 'Accounts':
                return <AccountsReport accounts={props.financialAccounts} branches={props.branches} />;
            case 'Forecast':
                return <ForecastReport sales={props.sales} />;
            case 'Summary':
            default:
                return <SummaryReport {...props} />;
        }
    };
    
    const showBranchFilter = ['Sales', 'Purchases', 'Expenses', 'Summary', 'Products'].includes(reportType);
    const showDateFilter = !['Customers', 'Accounts', 'Summary'].includes(reportType);


    return (
        <div className="reports-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(showBranchFilter || showDateFilter) && (
                 <FilterBar 
                    filters={filters}
                    onFilterChange={setFilters}
                    branches={branches}
                    showBranchFilter={showBranchFilter}
                    showDateFilter={showDateFilter}
                />
            )}
            {renderReport()}
        </div>
    );
};

export default Reports;