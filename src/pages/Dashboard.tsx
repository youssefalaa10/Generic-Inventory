import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatCard from '../components/StatCard';
import TargetStatCard from '../components/TargetStatCard';
import { CurrencyDollarIcon, ShoppingCartIcon, UsersIcon, ChartBarIcon, ExclamationIcon, CubeIcon, TruckIcon, PlusIcon, Icon } from '../components/Icon';
// FIX: Replaced non-existent 'Purchase' type with 'PurchaseInvoice'.
import { Sale, PurchaseInvoice, EmployeeData, InventoryItem, Product, Branch, Account, Expense, RenewableItem, LeaveRequest, AdvanceRequest, GeneralRequest, DailyBriefingContext, ExpenseCategory, Supplier } from '../types';

interface DashboardProps {
    sales: Sale[];
    // FIX: Replaced non-existent 'Purchase' type with 'PurchaseInvoice'.
    purchases: PurchaseInvoice[];
    employees: EmployeeData[];
    inventory: InventoryItem[];
    products: Product[];
    branches: Branch[];
    settings: { salesTarget: number };
    accounts: Account[];
    expenses: Expense[];
    renewables: RenewableItem[];
    leaveRequests: LeaveRequest[];
    advanceRequests: AdvanceRequest[];
    generalRequests: GeneralRequest[];
    suppliers: Supplier[];
}

type ActivityItem = {
  type: 'sale' | 'purchase' | 'stock';
  timestamp: Date;
  description: string;
  value?: number;
  icon: Icon;
};

// Simple time ago function
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
  interval = seconds / 2592000;
  if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
  interval = seconds / 86400;
  if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
  interval = seconds / 3600;
  if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
  interval = seconds / 60;
  if (interval > 1) return `منذ ${Math.floor(interval)} دقيقة`;
  return `الآن`;
}


const COLORS = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#ef4444', '#6366f1'];
const categoryTranslations: { [key in ExpenseCategory]: string } = {
    'Rent': 'إيجار',
    'Salaries': 'رواتب',
    'Marketing & Branding': 'تسويق',
    'E-commerce Fees': 'رسوم إلكترونية',
    'Shipping & Delivery': 'شحن وتوصيل',
    'Utilities': 'خدمات ومرافق',
    'Government Fees': 'رسوم حكومية',
    'Maintenance': 'صيانة',
    'Raw Materials': 'مواد خام',
    'Packaging': 'مواد تغليف',
    'Lab Supplies': 'مستلزمات المختبر',
    'Other': 'أخرى'
};

const Dashboard: React.FC<DashboardProps> = ({ sales, purchases, employees, inventory, products, branches, settings, accounts, expenses, renewables, leaveRequests, advanceRequests, generalRequests, suppliers }) => {
    const [activeTab, setActiveTab] = useState('actions');
    
    const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalPurchases = purchases.reduce((acc, p) => acc + p.amount, 0);
    const totalEmployees = employees.length;

    const lowStockItems = useMemo(() => inventory.filter(i => i.quantity <= i.minStock && i.minStock > 0), [inventory]);
    
    const recentActivities = useMemo(() => {
        const activities: ActivityItem[] = [];
        sales.slice(-5).forEach(sale => {
          activities.push({
            type: 'sale',
            timestamp: new Date(sale.date),
            description: `فاتورة بيع جديدة #${sale.invoiceNumber}`,
            value: sale.totalAmount,
            icon: ShoppingCartIcon,
          });
        });
        purchases.slice(-5).forEach(purchase => {
          const supplierName = suppliers.find(s => s.id === purchase.supplierId)?.name || `#${purchase.supplierId}`;
          activities.push({
            type: 'purchase',
            timestamp: new Date(purchase.date),
            description: `فاتورة شراء من مورد ${supplierName}`,
            value: purchase.amount,
            icon: TruckIcon,
          });
        });
        lowStockItems.slice(-5).forEach(item => {
            const product = products.find(p => p.id === item.productId);
            activities.push({
                type: 'stock',
                timestamp: new Date(), // Use current time for alerts
                description: `مخزون منخفض لـ ${product?.name || 'منتج غير معروف'}`,
                value: item.quantity,
                icon: ExclamationIcon,
            });
        });
        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    }, [sales, purchases, lowStockItems, products, branches, suppliers]);

    const [chartPath, setChartPath] = useState<string[]>([]);

    const accountTotals = useMemo(() => {
        const totals = new Map<string, { debit: number, credit: number }>();
        const traverseAndInit = (accs: Account[]) => {
            accs.forEach(acc => {
                totals.set(acc.id, { debit: 0, credit: 0 });
                if (acc.children) traverseAndInit(acc.children);
            });
        };
        traverseAndInit(accounts);
        sales.forEach(sale => {
            const revenueAccountId = sale.brand === 'Arabiva' ? '4-1100' : '4-1200';
            if (totals.has('1-1100')) totals.get('1-1100')!.debit += sale.totalAmount;
            if (totals.has(revenueAccountId)) totals.get(revenueAccountId)!.credit += sale.totalAmount;
        });
        purchases.forEach(purchase => {
            if (totals.has('1-1300')) totals.get('1-1300')!.debit += purchase.amount;
            if (totals.has('2-1100')) totals.get('2-1100')!.credit += purchase.amount;
        });
        expenses.forEach(expense => {
            if (totals.has('5-2000')) totals.get('5-2000')!.debit += expense.amount;
            if (totals.has('1-1100')) totals.get('1-1100')!.credit += expense.amount;
        });
        const propagate = (acc: Account): { debit: number, credit: number } => {
            const myTotals = totals.get(acc.id)!;
            if (!acc.children) return myTotals;
            const childrenTotals = acc.children.map(propagate).reduce((sum, current) => ({
                debit: sum.debit + current.debit,
                credit: sum.credit + current.credit,
            }), { debit: 0, credit: 0 });
            myTotals.debit += childrenTotals.debit;
            myTotals.credit += childrenTotals.credit;
            return myTotals;
        };
        accounts.forEach(propagate);
        return totals;
    }, [accounts, sales, purchases, expenses]);
    
    const { chartData, breadcrumbs } = useMemo(() => {
        let currentLevel = accounts;
        let currentParent: Account | null = null;
        const bc: {id: string, name: string}[] = [];
        let path = [...chartPath];
        let tempAccounts = accounts;
        for (const id of path) {
            const parent = tempAccounts.find(a => a.id === id);
            if (parent) {
                bc.push({id: parent.id, name: parent.name});
                currentParent = parent;
                currentLevel = parent.children || [];
                tempAccounts = currentLevel;
            } else { break; }
        }
        const data = currentLevel.map(acc => {
            const totals = accountTotals.get(acc.id) || { debit: 0, credit: 0 };
            return { ...acc, debit: totals.debit, credit: totals.credit, };
        }).filter(d => d.debit > 0 || d.credit > 0);
        return { chartData: data, currentAccountName: currentParent?.name || 'الحسابات الرئيسية', breadcrumbs: bc };
    }, [accounts, accountTotals, chartPath]);

    const handleBarClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const payload = data.activePayload[0].payload;
            if (payload.children && payload.children.length > 0) {
                setChartPath([...chartPath, payload.id]);
            }
        }
    };
    
    const handleBreadcrumbClick = (index: number) => setChartPath(chartPath.slice(0, index + 1));

    const monthlyPerformance = useMemo(() => {
        const data: { [key: string]: { month: string, sales: number, purchases: number } } = {};
        
        [...sales, ...purchases].forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleString('ar-EG', { month: 'short', year: 'numeric' });
            if (!data[monthKey]) {
                data[monthKey] = { month: monthLabel, sales: 0, purchases: 0 };
            }
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

    const expensesByCategory = useMemo(() => {
        const data = expenses.reduce((acc, expense) => {
            const categoryName = categoryTranslations[expense.category] || expense.category;
            acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
            return acc;
        }, {} as { [key: string]: number });
        
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [expenses]);


    const topSellingProducts = useMemo(() => {
        const productSales = sales.flatMap(s => s.items).reduce((acc: {[key: number]: number}, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.total;
            return acc;
        }, {} as { [key: number]: number });
        return Object.entries(productSales)
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, total]) => ({
                product: products.find(p => p.id === Number(productId)),
                total,
            }));
    }, [sales, products]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {lowStockItems.length > 0 && (
                <div className="glass-pane" style={{ padding: '1.5rem', borderLeft: '5px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ExclamationIcon style={{ width: '24px', height: '24px' }} />
                        تنبيهات انخفاض المخزون ({lowStockItems.length})
                    </h3>
                    <p style={{color: 'var(--text-secondary)'}}>
                        بعض المنتجات وصلت إلى الحد الأدنى للمخزون أو أقل. قم بزيارة صفحة <a href="#" style={{color: 'var(--primary-color)', fontWeight: 600}}>المخزون</a> للمزيد من التفاصيل.
                    </p>
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <StatCard title="إجمالي المبيعات" value={`${totalSales.toLocaleString()} د.ك`} icon={CurrencyDollarIcon} iconBg="linear-gradient(135deg, #10b981, #34d399)" />
                        <TargetStatCard 
                            title="هدف المبيعات الشهري" 
                            currentValue={totalSales} 
                            targetValue={settings.salesTarget} 
                            icon={ChartBarIcon} 
                            iconBg="linear-gradient(135deg, #f59e0b, #fbbf24)" 
                        />
                        <StatCard title="إجمالي المشتريات" value={`${totalPurchases.toLocaleString()} د.ك`} icon={ShoppingCartIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                        <StatCard title="عدد الموظفين" value={totalEmployees.toString()} icon={UsersIcon} iconBg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
                    </div>
                    
                    <div className="glass-pane" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>الأداء الشهري (مبيعات مقابل مشتريات)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyPerformance} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip 
                                    formatter={(value: number) => `${value.toLocaleString()} د.ك`}
                                    contentStyle={{ 
                                        background: 'var(--surface-bg)', 
                                        border: '1px solid var(--surface-border)', 
                                        borderRadius: '12px' 
                                    }}
                                    cursor={{fill: 'var(--highlight-hover)'}}
                                />
                                <Legend />
                                <Line type="monotone" name="المبيعات" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="المشتريات" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass-pane" style={{ padding: '1.5rem', minHeight: '350px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>توزيع المصروفات</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                        {expensesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${(value as number).toLocaleString()} د.ك`, name]} contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}/>
                                    <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-pane" style={{ padding: '1.5rem', minHeight: '350px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CubeIcon />أفضل 5 منتجات مبيعًا</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {topSellingProducts.map((item, index) => (
                                    <div key={item.product?.id} style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <span style={{fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '1.2rem', width: '2rem'}}>#{index + 1}</span>
                                        <div style={{flex: 1}}>
                                            <p style={{fontWeight: 600}}>{item.product?.name}</p>
                                            <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{item.product?.sku}</p>
                                        </div>
                                        <span style={{fontWeight: 'bold', color: 'var(--secondary-color)', fontSize: '1.1rem'}}>{item.total.toLocaleString()} د.ك</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="glass-pane" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>ملخص دليل الحسابات</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span onClick={() => setChartPath([])} style={{cursor: 'pointer', color: 'var(--primary-color)'}}>الحسابات الرئيسية</span>
                            {breadcrumbs.map((bc, index) => (
                                <React.Fragment key={bc.id}>
                                    <span style={{color: 'var(--surface-border)'}}>/</span>
                                    <span onClick={() => handleBreadcrumbClick(index)} style={{cursor: 'pointer', color: index === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--primary-color)'}}>{bc.name}</span>
                                </React.Fragment>
                            ))}
                        </div>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={chartData.length * 60 + 50}>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={handleBarClick}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                                    <XAxis type="number" stroke="var(--text-secondary)" tickFormatter={(val) => `${val / 1000}k`} />
                                    <YAxis dataKey="name" type="category" width={150} stroke="var(--text-primary)" style={{cursor: 'pointer', userSelect: 'none'}} />
                                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} د.ك`} contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} cursor={{fill: 'var(--highlight-hover)'}}/>
                                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                                    <Bar dataKey="debit" name="مدين" fill="var(--primary-color)" radius={[0, 4, 4, 0]} barSize={20} style={{cursor: 'pointer'}} />
                                    <Bar dataKey="credit" name="دائن" fill="var(--secondary-color)" radius={[0, 4, 4, 0]} barSize={20} style={{cursor: 'pointer'}} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>لا توجد بيانات لعرضها في هذا المستوى.</p>}
                    </div>
                </div>
                {/* Right Column */}
                <div className="glass-pane dashboard-panel">
                    <div className="tab-buttons-container">
                        <button className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>إجراءات سريعة</button>
                        <button className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>النشاط الأخير</button>
                    </div>
                    <div className="panel-content">
                        {activeTab === 'actions' ? (
                            <div className="quick-actions-list">
                                <a href="#" className="quick-action-link"><ShoppingCartIcon className="icon" /><span>فاتورة بيع جديدة</span></a>
                                <a href="#" className="quick-action-link"><TruckIcon className="icon" /><span>فاتورة شراء جديدة</span></a>
                                <a href="#" className="quick-action-link"><CubeIcon className="icon" /><span>إضافة منتج جديد</span></a>
                                <a href="#" className="quick-action-link"><UsersIcon className="icon" /><span>إضافة موظف جديد</span></a>
                            </div>
                        ) : (
                            <div className="activity-feed">
                                {recentActivities.map((item, index) => (
                                    <div key={index} className={`activity-item activity-${item.type}`}>
                                        <div className="activity-icon"><item.icon className="icon" /></div>
                                        <div className="activity-content">
                                            <p className="activity-description">{item.description}</p>
                                            <p className="activity-details">
                                                {item.value ? `${item.value.toLocaleString()} ${item.type === 'stock' ? '' : 'د.ك'} - ` : ''}
                                                {timeAgo(item.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
