import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { LogoutIcon, SunIcon, MoonIcon, SearchIcon, ShieldCheckIcon, SparklesIcon } from './Icon';
import { Product } from '../types';
import { useToasts } from './Toast';

interface HeaderProps {
    viewTitle: string;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    products: Product[];
    onProductSelect: (product: Product) => void;
    onViewMyPermissions: () => void;
    onGenerateBriefing: () => void;
}

const translations: { [key: string]: string } = {
    Dashboard: 'لوحة التحكم الرئيسية',
    MyProfile: 'ملفي الشخصي',
    'Sales/Invoices': 'إدارة فواتير المبيعات',
    'Sales/Quotations': 'إدارة عروض الأسعار',
    'Sales/Returns': 'فواتير المبيعات المرتجعة',
    'Sales/CreditNotes': 'الإشعارات الدائنة',
    'Sales/Recurring': 'الفواتير الدورية',
    'Sales/Payments': 'مدفوعات العملاء',
    'Purchases/Suppliers': 'إدارة الموردين',
    'Purchases/Requests': 'طلبات الشراء',
    'Purchases/RFQs': 'طلبات عروض الأسعار',
    'Purchases/Quotations': 'عروض أسعار الموردين',
    'Purchases/Orders': 'أوامر الشراء',
    'Purchases/Invoices': 'فواتير الشراء',
    'Purchases/Returns': 'مرتجعات المشتريات',
    'Purchases/DebitNotes': 'الإشعارات المدينة',
    'Purchases/Payments': 'مدفوعات الموردين',
    HR: 'الموارد البشرية',
    'HR/Employees': 'ملفات الموظفين',
    'HR/Attendance': 'الحضور والانصراف',
    'HR/LeaveRequests': 'إدارة الإجازات',
    'HR/AdvanceRequests': 'طلبات السلف',
    'HR/GeneralRequests': 'الطلبات العامة',
    'HR/Salaries': 'الرواتب والكشوف',
    Renewals: 'التجديدات والتراخيص',
    Reports: 'التقارير',
    'Reports/Summary': 'ملخص التقارير',
    'Reports/Sales': 'تقرير المبيعات',
    'Reports/BrandPerformance': 'تقرير أداء العلامات التجارية',
    'Reports/BranchSales': 'تقرير مبيعات الفروع',
    'Reports/Products': 'تقرير مبيعات المنتجات',
    'Reports/Purchases': 'تقرير المشتريات',
    'Reports/Expenses': 'تقرير المصروفات',
    'Reports/Customers': 'تقرير العملاء',
    'Reports/Accounts': 'تقرير الحسابات المالية',
    'Reports/Forecast': 'تقرير توقعات المبيعات',
    Settings: 'الإعدادات',
    'Settings/General': 'الإعدادات العامة',
    'Settings/Sales': 'إعدادات المبيعات',
    'Settings/Purchases': 'إعدادات المشتريات',
    'Settings/Suppliers': 'إعدادات الموردين',
    'Users': 'إدارة المستخدمين',
    'Settings/Integrations': 'إعدادات التكامل',
    'Branches': 'إدارة المستودعات',
    'Inventory/Products': 'إدارة المنتجات',
    'Inventory/Vouchers': 'إدارة الإذون المخزنية',
    'Inventory/Requisitions': 'الطلبيات المخزنية',
    'Inventory/Stocktakes': 'إدارة الجرد',
    Customers: 'العملاء',
    Expenses: 'المصروفات',
    'Finance/Expenses': 'إدارة المصروفات',
    'Finance/Accounts': 'الحسابات المالية',
    'Ledger/ChartOfAccounts': 'دليل الحسابات',
    'Ledger/Journal': 'القيود اليومية',
    POS: 'نقاط البيع',
    'POS/Start': 'بدء البيع',
    'POS/KuwaitMagic': 'نقطة بيع - كويت ماجك',
    'POS/Sessions': 'جلسات نقاط البيع',
    Manufacturing: 'التصنيع',
    'Manufacturing/Orders': 'أوامر التصنيع',
    'Manufacturing/Tasks': 'مهام التصنيع',
};


const getTitle = (view: string) => {
    if (view === 'Sales') return 'إدارة فواتير المبيعات';
    if (view === 'Inventory') return 'إدارة المنتجات';
    // Try for exact match first
    if (translations[view]) {
        return translations[view];
    }
    // Try matching the parent view (e.g., 'Reports/Sales' -> 'Reports')
    const parentView = view.split('/')[0];
    if (translations[parentView]) {
        return translations[parentView];
    }
    return view;
};

export const Header: React.FC<HeaderProps> = ({ viewTitle, theme, toggleTheme, products, onProductSelect, onViewMyPermissions, onGenerateBriefing }) => {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 1) {
            setSearchResults(
                products.filter(p => p.sku.toLowerCase().includes(term.toLowerCase()))
            );
        } else {
            setSearchResults([]);
        }
    };

    const handleProductClick = (product: Product) => {
        onProductSelect(product);
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <header className="app-header glass-pane">
            <h2 className="header-title">{getTitle(viewTitle)}</h2>
            <div className="header-controls">
                <div style={{ position: 'relative', width: '250px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="بحث بكود المنتج (SKU)..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-input"
                            style={{ paddingRight: '2.5rem' }}
                        />
                        <SearchIcon style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-placeholder)' }}/>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="glass-pane" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20, maxHeight: '300px', overflowY: 'auto' }}>
                            <ul style={{ listStyle: 'none', padding: '0.5rem', margin: 0 }}>
                                {searchResults.map(p => (
                                    <li key={p.id} onClick={() => handleProductClick(p)} style={{ padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--highlight-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <p style={{ fontWeight: 600 }}>{p.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.sku}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {viewTitle === 'Dashboard' && (
                    <button onClick={onGenerateBriefing} className="theme-toggle-btn glass-pane" title="الموجز اليومي الذكي">
                        <SparklesIcon className="icon" />
                    </button>
                )}
                <button onClick={toggleTheme} className="theme-toggle-btn glass-pane">
                    {theme === 'light' ? <MoonIcon className="icon" /> : <SunIcon className="icon" />}
                </button>
                <div className="user-menu">
                    <button className="user-menu-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                        <div className="user-greeting">
                            <p style={{ fontWeight: 'bold' }}>{user?.name}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.role}</p>
                        </div>
                        <div className="user-avatar">{user?.name.charAt(0)}</div>
                    </button>
                    {isDropdownOpen && (
                        <div className="user-dropdown glass-pane">
                            <div className="user-dropdown-info">
                                <strong>{user?.name}</strong>
                                <p>{user?.role}</p>
                            </div>
                            <div className="user-dropdown-divider"></div>
                            <button className="logout-btn" onClick={onViewMyPermissions}>
                                <ShieldCheckIcon className="icon" />
                                <span>صلاحياتي</span>
                            </button>
                            <div className="user-dropdown-divider"></div>
                            <button className="logout-btn" onClick={logout}>
                                <LogoutIcon className="icon" />
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};