import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Permission, Role } from '../types';
import { 
    Icon, HomeIcon, TruckIcon, UsersIcon, ChartBarIcon, CogIcon, 
    DocumentTextIcon, DesktopComputerIcon, UserIcon, CubeIcon, SafeIcon, 
    CollectionIcon, HierarchyIcon, CalendarIcon, EyeIcon, LocationMarkerIcon,
    ChevronDownIcon, BeakerIcon 
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
            { name: 'إدارة الفواتير', view: 'Sales' },
        ]
    },
    {
        name: 'نقاط البيع', view: 'POS', icon: DesktopComputerIcon,
        children: [
            { name: 'بدأ البيع', view: 'POS/Start' },
            { name: 'الجلسات', view: 'POS/Sessions' },
        ]
    },
    {
        name: 'العملاء', view: 'Customers', icon: UserIcon,
    },
    {
        name: 'المنتجات', view: 'Products', icon: CubeIcon, permission: 'products:read',
        children: [
            { name: 'كتالوج المنتجات', view: 'Products/Catalog' },
            { name: 'المخزون', view: 'Products/Inventory' },
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
    {
        name: 'المنظمة', view: 'Organization', icon: HierarchyIcon,
        children: [
            { name: 'إدارة الفروع', view: 'Branches' },
        ]
    },
    {
        name: 'التجديدات', view: 'Renewals', icon: CalendarIcon, permission: 'licenses:read',
    },
    {
        name: 'التقارير', view: 'Reports', icon: ChartBarIcon, permission: 'reports:read:full',
        children: [
            { name: 'ملخص التقارير', view: 'Reports/Summary' },
            { name: 'تقرير المبيعات', view: 'Reports/Sales' },
            { name: 'أداء العلامات التجارية', view: 'Reports/BrandPerformance' },
            { name: 'مبيعات الفروع', view: 'Reports/BranchSales' },
            { name: 'تقرير المشتريات', view: 'Reports/Purchases' },
            { name: 'مبيعات المنتجات', view: 'Reports/Products' },
            { name: 'تقرير المصروفات', view: 'Reports/Expenses' },
            { name: 'أرصدة العملاء', view: 'Reports/Customers' },
            { name: 'كشف الحسابات', view: 'Reports/Accounts' },
            { name: 'توقعات المبيعات (AI)', view: 'Reports/Forecast' },
        ]
    },
    {
        name: 'الإعدادات', view: 'Settings', icon: CogIcon, permission: 'settings:manage',
        children: [
            { name: 'عام', view: 'Settings/General' },
            { name: 'المستخدمين', view: 'Users' },
            { name: 'التكاملات', view: 'Settings/Integrations', permission: 'integrations:manage'},
        ]
    },
];

const employeeNavItems: NavItem[] = [
    { name: 'ملفي الشخصي', view: 'MyProfile', icon: UserIcon },
];

const NavGroup: React.FC<{
    item: NavItem;
    activeView: string;
    setActiveView: (view: string) => void;
    userPermissions: Permission[];
    notificationCount?: number;
}> = ({ item, activeView, setActiveView, userPermissions, notificationCount }) => {
    const [isOpen, setIsOpen] = useState(activeView.startsWith(item.view));
    
    // If the main permission is not granted, don't render the item
    if (item.permission && !userPermissions.includes(item.permission)) {
        return null;
    }

    const filteredChildren = item.children?.filter(child => !child.permission || userPermissions.includes(child.permission));

    const isParentActive = activeView.startsWith(item.view);
    const hasChildren = filteredChildren && filteredChildren.length > 0;

    const handleClick = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        } else {
            setActiveView(item.view);
        }
    };
    
    return (
        <li className="nav-item">
            <button
                className={`nav-link ${isParentActive && !hasChildren ? 'active' : ''} ${hasChildren && isOpen ? 'submenu-open' : ''}`}
                onClick={handleClick}
            >
                <div className="nav-link-content">
                    <item.icon className="icon" />
                    <span>{item.name}</span>
                </div>
                <div className="nav-link-controls">
                    {notificationCount && notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    {hasChildren && <ChevronDownIcon className="chevron" />}
                </div>
            </button>
            {hasChildren && isOpen && (
                 <ul className="nav-submenu">
                    {filteredChildren?.map(child => (
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
            )}
        </li>
    );
};

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    lowStockCount: number;
    pendingLeavesCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, lowStockCount, pendingLeavesCount }) => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const navItems = user.role === Role.Employee ? employeeNavItems : allNavItems;

    return (
        <aside className="sidebar-container glass-pane">
            <div className="sidebar-header">
                <div className="sidebar-logo">F</div>
                <h1 className="sidebar-title">نظام الإدارة المالية</h1>
            </div>
            <ul className="sidebar-nav">
                {navItems.map(item => (
                    <NavGroup
                        key={item.view}
                        item={item}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        userPermissions={user.permissions}
                        notificationCount={
                            item.view === 'Products' ? lowStockCount :
                            item.view === 'HR' ? pendingLeavesCount :
                            undefined
                        }
                    />
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;