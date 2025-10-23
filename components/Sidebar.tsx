import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Permission } from '../types';
import { 
    Icon, HomeIcon, TruckIcon, UsersIcon, ChartBarIcon, CogIcon, 
    DocumentTextIcon, DesktopComputerIcon, UserIcon, CubeIcon, SafeIcon, 
    CollectionIcon, CalendarIcon, ChevronDownIcon, BeakerIcon 
} from './Icon';

interface NavSubItem {
    name: string;
    view: string;
    permission?: Permission;
}

interface NavItem {
    name: string;
    view: string;
    icon: Icon;
    permission?: Permission;
    children?: NavSubItem[];
}

const allNavItems: NavItem[] = [
    { name: 'لوحة التحكم', view: 'Dashboard', icon: HomeIcon },
    { name: 'ملفي الشخصي', view: 'MyProfile', icon: UserIcon },
    {
        name: 'المبيعات', view: 'Sales', icon: DocumentTextIcon, permission: 'sales:read',
        children: [
            { name: 'إدارة الفواتير', view: 'Sales/Invoices' },
            { name: 'إدارة عروض الأسعار', view: 'Sales/Quotations' },
            { name: 'الفواتير المرتجعة', view: 'Sales/Returns' },
            { name: 'الإشعارات الدائنة', view: 'Sales/CreditNotes' },
            { name: 'الفواتير الدورية', view: 'Sales/Recurring' },
            { name: 'مدفوعات العملاء', view: 'Sales/Payments' },
        ]
    },
    {
        name: 'نقاط البيع', view: 'POS', icon: DesktopComputerIcon,
        children: [
            { name: 'بدأ البيع', view: 'POS/Start' },
            { name: 'نقطة بيع - كويت ماجك', view: 'POS/KuwaitMagic' },
            { name: 'الجلسات', view: 'POS/Sessions' },
        ]
    },
    {
        name: 'العملاء', view: 'Customers', icon: UserIcon,
    },
    {
        name: 'المخزون', view: 'Inventory', icon: CubeIcon, permission: 'inventory:read',
        children: [
            { name: 'إدارة المنتجات', view: 'Inventory/Products' },
            { name: 'إدارة الإذون المخزنية', view: 'Inventory/Vouchers' },
            { name: 'الطلبيات المخزنية', view: 'Inventory/Requisitions' },
            { name: 'تتبع المنتجات', view: 'Inventory/Tracking' },
            { name: 'قوائم الأسعار', view: 'Inventory/Pricelists' },
            { name: 'المستودعات', view: 'Branches' },
            { name: 'إدارة الجرد', view: 'Inventory/Stocktakes' },
            { name: 'إعدادات المخزون', view: 'Settings/Inventory' },
            { name: 'إعدادات المنتجات', view: 'Settings/Products' },
        ]
    },
    {
        name: 'التصنيع', view: 'Manufacturing', icon: BeakerIcon, permission: 'manufacturing:read',
        children: [
            { name: 'أوامر التصنيع', view: 'Manufacturing/Orders' },
            { name: 'مهام التصنيع', view: 'Manufacturing/Tasks', permission: 'manufacturing:tasks:manage' },
        ]
    },
    {
        name: 'المشتريات', view: 'Purchases', icon: TruckIcon, permission: 'purchases:read',
        children: [
            { name: 'إدارة الموردين', view: 'Purchases/Suppliers' },
            { name: 'طلبات الشراء', view: 'Purchases/Requests' },
            { name: 'طلبات عروض الأسعار', view: 'Purchases/RFQs' },
            { name: 'عروض أسعار الموردين', view: 'Purchases/Quotations' },
            { name: 'أوامر الشراء', view: 'Purchases/Orders' },
            { name: 'فواتير الشراء', view: 'Purchases/Invoices' },
            { name: 'مرتجعات المشتريات', view: 'Purchases/Returns' },
            { name: 'الإشعارات المدينة', view: 'Purchases/DebitNotes' },
            { name: 'مدفوعات الموردين', view: 'Purchases/Payments' },
        ]
    },
    {
        name: 'المالية', view: 'Finance', icon: SafeIcon,
        children: [
            { name: 'المصروفات', view: 'Finance/Expenses' },
            { name: 'خزائن وحسابات بنكية', view: 'Finance/Accounts' },
        ]
    },
    {
        name: 'الحسابات العامة', view: 'Ledger', icon: CollectionIcon,
        children: [
            { name: 'القيود اليومية', view: 'Ledger/Journal' },
            { name: 'دليل الحسابات', view: 'Ledger/ChartOfAccounts' },
        ]
    },
    {
        name: 'الموارد البشرية', view: 'HR', icon: UsersIcon, permission: 'employees:read',
        children: [
            { name: 'ملفات الموظفين', view: 'HR/Employees' },
            { name: 'الحضور والانصراف', view: 'HR/Attendance' },
            { name: 'إدارة الإجازات', view: 'HR/LeaveRequests' },
            { name: 'طلبات السلف', view: 'HR/AdvanceRequests' },
            { name: 'الطلبات العامة', view: 'HR/GeneralRequests' },
            { name: 'الرواتب والكشوف', view: 'HR/Salaries' },
        ]
    },
    { name: 'التجديدات والتراخيص', view: 'Renewals', icon: CalendarIcon, permission: 'licenses:read' },
    {
        name: 'التقارير', view: 'Reports', icon: ChartBarIcon, permission: 'reports:read:full',
        children: [
            { name: 'ملخص', view: 'Reports/Summary' },
            { name: 'المبيعات', view: 'Reports/Sales' },
            { name: 'أداء العلامات التجارية', view: 'Reports/BrandPerformance' },
            { name: 'مبيعات الفروع', view: 'Reports/BranchSales' },
            { name: 'مبيعات المنتجات', view: 'Reports/Products' },
            { name: 'المشتريات', view: 'Reports/Purchases' },
            { name: 'المصروفات', view: 'Reports/Expenses' },
            { name: 'العملاء', view: 'Reports/Customers' },
            { name: 'الحسابات المالية', view: 'Reports/Accounts' },
            { name: 'توقعات المبيعات (AI)', view: 'Reports/Forecast' },
        ]
    },
    {
        name: 'الإعدادات', view: 'Settings', icon: CogIcon, permission: 'settings:manage',
        children: [
            { name: 'عام', view: 'Settings/General' },
            { name: 'المبيعات', view: 'Settings/Sales' },
            { name: 'المشتريات', view: 'Settings/Purchases' },
            { name: 'الموردين', view: 'Settings/Suppliers' },
            { name: 'المستخدمين', view: 'Users' },
            { name: 'التكاملات', view: 'Settings/Integrations', permission: 'integrations:manage' },
        ]
    },
];

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    lowStockCount: number;
    pendingLeavesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, lowStockCount, pendingLeavesCount }) => {
    const { user } = useContext(AuthContext);
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const hasPermission = (permission?: Permission) => {
        if (!permission) return true;
        if (!user) return false;
        return user.permissions.includes(permission);
    };

    const toggleMenu = (view: string) => {
        setOpenMenus(prev => prev.includes(view) ? prev.filter(v => v !== view) : [...prev, view]);
    };

    const isSubItemActive = (parentView: string) => {
        return activeView.startsWith(parentView + '/');
    };
    
    React.useEffect(() => {
        // Automatically open the menu for the active sub-item
        const parentView = allNavItems.find(item => item.children && isSubItemActive(item.view));
        if (parentView && !openMenus.includes(parentView.view)) {
            setOpenMenus(prev => [...prev, parentView.view]);
        }
    }, [activeView]);

    return (
        <aside className="sidebar-container glass-pane">
            <div className="sidebar-header">
                <div className="sidebar-logo">A</div>
                <h1 className="sidebar-title">ASAS System</h1>
            </div>
            <ul className="sidebar-nav">
                {allNavItems.filter(item => hasPermission(item.permission)).map(item => {
                    const isActive = activeView === item.view || (item.children && (isSubItemActive(item.view) || activeView === item.view));
                    
                    if (item.children) {
                        const isOpen = openMenus.includes(item.view);
                        const showBadge = (item.view === 'HR' && pendingLeavesCount > 0) || (item.view === 'Inventory' && lowStockCount > 0);
                        const badgeCount = item.view === 'HR' ? pendingLeavesCount : lowStockCount;

                        return (
                            <li key={item.view} className="nav-item">
                                <button
                                    className={`nav-link ${isActive ? 'active' : ''} ${isOpen ? 'submenu-open' : ''}`}
                                    onClick={() => toggleMenu(item.view)}
                                >
                                    <div className="nav-link-content">
                                        <item.icon className="icon" />
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="nav-link-controls">
                                        {showBadge && <span className="notification-badge">{badgeCount}</span>}
                                        <ChevronDownIcon className="chevron" />
                                    </div>
                                </button>
                                <ul className="nav-submenu" style={{ maxHeight: isOpen ? '500px' : '0px' }}>
                                    {item.children.filter(child => hasPermission(child.permission)).map(child => (
                                        <li key={child.view} className="nav-submenu-item">
                                            <button
                                                onClick={() => setActiveView(child.view)}
                                                className={activeView === child.view ? 'active' : ''}
                                            >
                                                {child.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    }

                    return (
                        <li key={item.view} className="nav-item">
                            <button
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveView(item.view)}
                            >
                                <div className="nav-link-content">
                                    <item.icon className="icon" />
                                    <span>{item.name}</span>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};