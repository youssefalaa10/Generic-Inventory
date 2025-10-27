
import { Permission, Role } from './types';

export const PERMISSIONS: Record<Role, Permission[]> = {
    [Role.SuperAdmin]: ['purchases:create', 'purchases:read', 'purchases:update', 'purchases:delete', 'sales:create', 'sales:read', 'sales:update', 'sales:delete', 'products:create', 'products:read', 'products:update', 'products:delete', 'employees:create', 'employees:read', 'employees:update', 'employees:delete', 'licenses:create', 'licenses:read', 'licenses:update', 'licenses:delete', 'branches:create', 'branches:read', 'branches:update', 'branches:delete', 'inventory:read', 'inventory:transfer', 'inventory:update', 'inventory:adjust', 'supplies:create', 'supplies:read', 'supplies:update', 'supplies:delete', 'payroll:manage', 'payroll:read', 'reports:read:full', 'settings:manage', 'manufacturing:create', 'manufacturing:read', 'manufacturing:tasks:manage', 'integrations:manage', 'advances:manage', 'general_requests:manage'],
    [Role.Perfumer]: ['manufacturing:create', 'manufacturing:read', 'manufacturing:tasks:manage', 'inventory:read', 'products:read', 'supplies:read', 'advances:request', 'general_requests:request'],
    [Role.Accountant]: ['purchases:create', 'purchases:read', 'purchases:update', 'sales:read', 'employees:read', 'licenses:read', 'inventory:read', 'supplies:read', 'payroll:read', 'reports:read:limited', 'advances:request', 'general_requests:request'],
    [Role.BranchManager]: ['purchases:create', 'purchases:read', 'sales:create', 'sales:read', 'inventory:read', 'inventory:transfer', 'inventory:update', 'inventory:adjust', 'employees:read', 'manufacturing:create', 'manufacturing:read', 'manufacturing:tasks:manage', 'supplies:read', 'advances:manage', 'general_requests:manage'],
    [Role.ShopAssistant]: ['sales:create', 'sales:read', 'inventory:read', 'products:read', 'supplies:read', 'advances:request', 'general_requests:request'],
    [Role.EcommerceManager]: ['sales:create', 'sales:read', 'inventory:read', 'products:read', 'supplies:read', 'reports:read:limited', 'advances:request', 'general_requests:request'],
    [Role.Employee]: ['advances:request', 'general_requests:request'],
};

export const PERMISSION_GROUPS: { [group: string]: { key: Permission, label: string }[] } = {
    'المبيعات': [
        { key: 'sales:create', label: 'إنشاء' },
        { key: 'sales:read', label: 'قراءة' },
        { key: 'sales:update', label: 'تحديث' },
        { key: 'sales:delete', label: 'حذف' },
    ],
    'المشتريات': [
        { key: 'purchases:create', label: 'إنشاء' },
        { key: 'purchases:read', label: 'قراءة' },
        { key: 'purchases:update', label: 'تحديث' },
        { key: 'purchases:delete', label: 'حذف' },
    ],
     'المنتجات': [
        { key: 'products:create', label: 'إنشاء' },
        { key: 'products:read', label: 'قراءة' },
        { key: 'products:update', label: 'تحديث' },
        { key: 'products:delete', label: 'حذف' },
    ],
    'الموظفين': [
        { key: 'employees:create', label: 'إنشاء' },
        { key: 'employees:read', label: 'قراءة' },
        { key: 'employees:update', label: 'تحديث' },
        { key: 'employees:delete', label: 'حذف' },
    ],
    'الرواتب': [
        { key: 'payroll:manage', label: 'إدارة' },
        { key: 'payroll:read', label: 'قراءة' },
    ],
    'طلبات السلف': [
        { key: 'advances:request', label: 'تقديم طلب' },
        { key: 'advances:manage', label: 'إدارة الطلبات' },
    ],
    'الطلبات العامة': [
        { key: 'general_requests:request', label: 'تقديم طلب' },
        { key: 'general_requests:manage', label: 'إدارة الطلبات' },
    ],
    'المخزون': [
        { key: 'inventory:read', label: 'قراءة' },
        { key: 'inventory:transfer', label: 'تحويل' },
        { key: 'inventory:update', label: 'تحديث' },
        { key: 'inventory:adjust', label: 'تعديل' },
    ],
    'سلسلة التوريد': [
        { key: 'supplies:create', label: 'إنشاء' },
        { key: 'supplies:read', label: 'قراءة' },
        { key: 'supplies:update', label: 'تحديث' },
        { key: 'supplies:delete', label: 'حذف' },
    ],
    'التصنيع': [
        { key: 'manufacturing:create', label: 'إنشاء' },
        { key: 'manufacturing:read', label: 'قراءة' },
        { key: 'manufacturing:tasks:manage', label: 'إدارة المهام' },
    ],
    'التجديدات': [
        { key: 'licenses:create', label: 'إنشاء' },
        { key: 'licenses:read', label: 'قراءة' },
        { key: 'licenses:update', label: 'تحديث' },
        { key: 'licenses:delete', label: 'حذف' },
    ],
    'الفروع': [
        { key: 'branches:create', label: 'إنشاء' },
        { key: 'branches:read', label: 'قراءة' },
        { key: 'branches:update', label: 'تحديث' },
        { key: 'branches:delete', label: 'حذف' },
    ],
    'التقارير': [
        { key: 'reports:read:full', label: 'صلاحيات كاملة' },
        { key: 'reports:read:limited', label: 'صلاحيات محدودة' },
    ],
    'الإعدادات': [
        { key: 'settings:manage', label: 'إدارة الإعدادات' },
        { key: 'integrations:manage', label: 'إدارة التكاملات' },
    ],
};
