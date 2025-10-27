import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../App';
import { Permission, Role } from '../types';
import {
    BeakerIcon,
    CalendarIcon,
    ChartBarIcon,
    ChevronDownIcon,
    CogIcon,
    CollectionIcon,
    CubeIcon,
    DesktopComputerIcon,
    DocumentTextIcon,
    HierarchyIcon,
    HomeIcon,
    Icon,
    SafeIcon,
    TruckIcon,
    UserIcon,
    UsersIcon,
} from './Icon';

// ---------- TYPES ----------
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

// ---------- NAVIGATION STRUCTURE ----------
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
            { name: 'الجلسات', view: 'POS/Sessions' },
        ]
    },
    { name: 'العملاء', view: 'Customers', icon: UserIcon },
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
        name: 'سلسلة التوريد', view: 'Supplies', icon: CollectionIcon, permission: 'supplies:read',
        children: [
            { name: 'المواد', view: 'Supplies/Materials' },
            { name: 'المخزون', view: 'Supplies/Inventory' },
            { name: 'حركات المخزون', view: 'Supplies/Movements' },
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
            { name: 'طلبات السلف', view: 'HR/AdvanceRequests', permission: 'advances:manage' },
            { name: 'الطلبات العامة', view: 'HR/GeneralRequests', permission: 'general_requests:manage' },
            { name: 'الرواتب والكشوف', view: 'HR/Salaries', permission: 'payroll:read' },
        ]
    },
    { name: 'المنظمة', view: 'Organization', icon: HierarchyIcon, children: [{ name: 'إدارة الفروع', view: 'Branches' }] },
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

const employeeNavItems: NavItem[] = [{ name: 'ملفي الشخصي', view: 'MyProfile', icon: UserIcon }];

// ---------- NAVGROUP COMPONENT ----------
const NavGroup: React.FC<{
    item: NavItem;
    activeView: string;
    setActiveView: (view: string) => void;
    userPermissions: Permission[];
    notificationCount?: number;
    isCollapsed: boolean;
}> = ({ item, activeView, setActiveView, userPermissions, notificationCount, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(activeView.startsWith(item.view));
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    if (item.permission && !userPermissions.includes(item.permission)) return null;
    const filteredChildren = item.children?.filter(child => !child.permission || userPermissions.includes(child.permission));
    const hasChildren = filteredChildren && filteredChildren.length > 0;
    const isParentActive = activeView.startsWith(item.view);

    const handleClick = () => {
        if (hasChildren && !isCollapsed) setIsOpen(!isOpen);
        else setActiveView(item.view);
    };

    return (
        <li className="nav-item">
            <button
                className={`nav-link ${isParentActive ? 'active' : ''} ${hasChildren && isOpen ? 'submenu-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                onClick={handleClick}
                title={isCollapsed ? item.name : undefined}
                onMouseEnter={() => isCollapsed && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <div className="nav-link-content">
                    <item.icon className="icon" />
                    {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && (
                    <div className="nav-link-controls">
                        {notificationCount && notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                        {hasChildren && <ChevronDownIcon className="chevron" />}
                    </div>
                )}
            </button>

            {isCollapsed && showTooltip && (
                <div ref={tooltipRef} className="nav-tooltip">
                    <div className="nav-tooltip-content">
                        <span className="nav-tooltip-title">{item.name}</span>
                        {hasChildren && (
                            <ul className="nav-tooltip-submenu">
                                {filteredChildren?.map(child => (
                                    <li key={child.view}>
                                        <button onClick={() => setActiveView(child.view)} className={activeView === child.view ? 'active' : ''}>
                                            {child.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {hasChildren && isOpen && !isCollapsed && (
                <ul className="nav-submenu">
                    {filteredChildren?.map(child => (
                        <li key={child.view} className="nav-submenu-item">
                            <button onClick={() => setActiveView(child.view)} className={activeView === child.view ? 'active' : ''}>
                                {child.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

// ---------- SIDEBAR MAIN ----------
interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    lowStockCount: number;
    pendingLeavesCount: number;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    setActiveView,
    lowStockCount,
    pendingLeavesCount,
    isCollapsed,
    onToggleCollapse,
}) => {
    const { user } = useContext(AuthContext);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b' && window.innerWidth >= 1200) {
                e.preventDefault();
                onToggleCollapse();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onToggleCollapse]);

    if (!user) return null;
    const navItems = user.role === Role.Employee ? employeeNavItems : allNavItems;

    return (
        <aside className={`sidebar-container glass-pane ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">A</div>
                {!isCollapsed && <h1 className="sidebar-title">ASAS System</h1>}
            </div>
            <ul className="sidebar-nav">
                {navItems.map(item => (
                    <NavGroup
                        key={item.view}
                        item={item}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        userPermissions={user.permissions}
                        isCollapsed={isCollapsed}
                        notificationCount={
                            item.view === 'Inventory'
                                ? lowStockCount
                                : item.view === 'HR'
                                ? pendingLeavesCount
                                : undefined
                        }
                    />
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
