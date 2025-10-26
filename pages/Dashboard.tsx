

import React, { useMemo } from 'react';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartBarIcon, CubeIcon, CurrencyDollarIcon, ExclamationIcon, Icon, ShoppingCartIcon, TruckIcon, UsersIcon } from '../components/Icon';
import StatCard from '../components/StatCard';
import TargetStatCard from '../components/TargetStatCard';
import { useAppSelector, selectAll } from '../src/store';
import { Account, AdvanceRequest, Branch, EmployeeData, Expense, ExpenseCategory, GeneralRequest, InventoryItem, LeaveRequest, Product, PurchaseInvoice, RenewableItem, Sale, Supplier } from '../types';

interface DashboardProps {
    settings: { salesTarget: number };
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

const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
    // Get data from Redux store
    const sales = useAppSelector(s => selectAll(s, 'sales')) as Sale[];
    const purchases = useAppSelector(s => selectAll(s, 'purchaseinvoices')) as PurchaseInvoice[];
    const employees = useAppSelector(s => selectAll(s, 'employees')) as EmployeeData[];
    const inventory = useAppSelector(s => selectAll(s, 'inventoryitems')) as InventoryItem[];
    const products = useAppSelector(s => selectAll(s, 'products')) as Product[];
    const branches = useAppSelector(s => selectAll(s, 'branchinventories')) as Branch[];
    const accounts = useAppSelector(s => selectAll(s, 'financialaccounts')) as Account[];
    const expenses = useAppSelector(s => selectAll(s, 'expenses')) as Expense[];
    const suppliers = useAppSelector(s => selectAll(s, 'suppliers')) as Supplier[];
    
    // For now, we'll use mock data for these until they're added to Redux
    const renewables: RenewableItem[] = [];
    const leaveRequests: LeaveRequest[] = [];
    const advanceRequests: AdvanceRequest[] = [];
    const generalRequests: GeneralRequest[] = [];
    
    const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalPurchases = purchases.reduce((acc, p) => acc + p.amount, 0);
    const totalEmployees = employees.length;

    const lowStockItems = useMemo(() => inventory.filter(i => i.quantity <= i.minStock && i.minStock > 0), [inventory]);
    
    const expiringSoonItems = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        return inventory.filter(i => 
            i.expiryDate && 
            new Date(i.expiryDate) >= today &&
            new Date(i.expiryDate) <= thirtyDaysFromNow
        );
    }, [inventory]);

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
    }, [sales, purchases, lowStockItems, products, suppliers]);

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
        <div className="dashboard-container">
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
            {expiringSoonItems.length > 0 && (
                <div className="glass-pane" style={{ padding: '1.5rem', borderLeft: '5px solid #f59e0b' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ExclamationIcon style={{ width: '24px', height: '24px' }} />
                        تنبيهات انتهاء الصلاحية ({expiringSoonItems.length})
                    </h3>
                    <p style={{color: 'var(--text-secondary)'}}>
                        {expiringSoonItems.length} منتجات ستنتهي صلاحيتها خلال 30 يومًا. قم بزيارة صفحة <a href="#" style={{color: 'var(--primary-color)', fontWeight: 600}}>المخزون</a> للمزيد من التفاصيل.
                    </p>
                </div>
            )}
            
            <div className="dashboard-main-grid-alt">
                {/* Left Column: Stats */}
                <div className="dashboard-stats-column">
                    <StatCard title="إجمالي المبيعات" value={`${totalSales.toLocaleString()} د.ك`} icon={CurrencyDollarIcon} iconBg="linear-gradient(135deg, #10b981, #34d399)" />
                    <StatCard title="إجمالي المشتريات" value={`${totalPurchases.toLocaleString()} د.ك`} icon={ShoppingCartIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                    <StatCard title="عدد الموظفين" value={totalEmployees.toString()} icon={UsersIcon} iconBg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
                    <StatCard title="أصناف منخفضة المخزون" value={lowStockItems.length.toString()} icon={ExclamationIcon} iconBg="linear-gradient(135deg, #f59e0b, #fbbf24)" />
                    <TargetStatCard 
                        title="هدف المبيعات الشهري" 
                        currentValue={totalSales} 
                        targetValue={settings.salesTarget} 
                        icon={ChartBarIcon} 
                        iconBg="linear-gradient(135deg, #f97316, #fdba74)" 
                    />
                </div>

                {/* Right Column: Charts & Activity */}
                <div className="dashboard-charts-column">
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

                    <div className="dashboard-charts-grid">
                        <div className="glass-pane" style={{ padding: '1.5rem', minHeight: '350px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>توزيع المصروفات</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}>
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>النشاط الأخير</h3>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;