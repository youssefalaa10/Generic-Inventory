import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../App';
import { Permission, Product, Role } from '../types';
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
    SearchIcon,
    TruckIcon,
    UserIcon,
    UsersIcon,
    XIcon
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

const employeeNavItems: NavItem[] = [
    { name: 'ملفي الشخصي', view: 'MyProfile', icon: UserIcon },
];

const DrawerNavGroup: React.FC<{
    item: NavItem;
    activeView: string;
    setActiveView: (view: string) => void;
    userPermissions: Permission[];
    notificationCount?: number;
    onNavigate: () => void;
}> = ({ item, activeView, setActiveView, userPermissions, notificationCount, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(activeView.startsWith(item.view));
    
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
            onNavigate();
        }
    };

    const handleChildClick = (view: string) => {
        setActiveView(view);
        onNavigate();
    };
    
    return (
        <li className="drawer-nav-item">
            <button
                className={`drawer-nav-link ${isParentActive && !hasChildren ? 'active' : ''} ${hasChildren && isOpen ? 'submenu-open' : ''}`}
                onClick={handleClick}
            >
                <div className="drawer-nav-link-content">
                    <item.icon className="icon" />
                    <span>{item.name}</span>
                </div>
                <div className="drawer-nav-link-controls">
                    {notificationCount && notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    {hasChildren && <ChevronDownIcon className="chevron" />}
                </div>
            </button>
            {hasChildren && isOpen && (
                 <ul className="drawer-nav-submenu">
                    {filteredChildren?.map(child => (
                        <li key={child.view} className="drawer-nav-submenu-item">
                            <button
                                onClick={() => handleChildClick(child.view)}
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

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    activeView: string;
    setActiveView: (view: string) => void;
    lowStockCount: number;
    pendingLeavesCount: number;
    products: Product[];
    onProductSelect: (product: Product) => void;
}

const Drawer: React.FC<DrawerProps> = ({ 
    isOpen, 
    onClose, 
    activeView, 
    setActiveView, 
    lowStockCount, 
    pendingLeavesCount,
    products,
    onProductSelect
}) => {
    const { user } = useContext(AuthContext);
    const drawerRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [startX, setStartX] = useState<number | null>(null);

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
        onClose();
    };

    const handleNavigate = () => {
        onClose();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!startX) return;
        
        const currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        
        if (diffX > 50 && startX > window.innerWidth - 50) {
            onClose();
        }
    };

    const handleTouchEnd = () => {
        setStartX(null);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!user) return null;

    const navItems = user.role === Role.Employee ? employeeNavItems : allNavItems;

    return (
        <>
            <div 
                className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
                onClick={handleBackdropClick}
            />
            
            <div 
                ref={drawerRef}
                className={`drawer ${isOpen ? 'open' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="drawer-header">
                    <div className="drawer-header-top">
                        <div className="drawer-logo-section">
                            <div className="drawer-logo">F</div>
                            <h1 className="drawer-title">ASAS System</h1>
                        </div>
                        <button className="drawer-close-btn" onClick={onClose}>
                            <XIcon className="icon" />
                        </button>
                    </div>
                    
                    <div className="drawer-search-container">
                        <div className="drawer-search-input-wrapper">
                            <input
                                type="text"
                                placeholder="بحث بكود المنتج (SKU)..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="drawer-search-input"
                            />
                            <SearchIcon className="drawer-search-icon" />
                        </div>
                        {searchResults.length > 0 && (
                            <div className="drawer-search-results">
                                <ul>
                                    {searchResults.map(p => (
                                        <li key={p.id} onClick={() => handleProductClick(p)}>
                                            <p className="product-name">{p.name}</p>
                                            <p className="product-sku">{p.sku}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="drawer-content">
                    <ul className="drawer-nav">
                        {navItems.map(item => (
                            <DrawerNavGroup
                                key={item.view}
                                item={item}
                                activeView={activeView}
                                setActiveView={setActiveView}
                                userPermissions={user.permissions}
                                onNavigate={handleNavigate}
                                notificationCount={
                                    item.view === 'Products' ? lowStockCount :
                                    item.view === 'HR' ? pendingLeavesCount :
                                    undefined
                                }
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Drawer;