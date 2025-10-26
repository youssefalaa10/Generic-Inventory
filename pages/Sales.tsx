import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import { ChevronDownIcon, ChevronUpIcon } from '../components/Icon';
import SaleDetailModal from '../components/SaleDetailModal';
import { useToasts } from '../components/Toast';
import { useAppSelector, useAppDispatch, selectAll, slices } from '../src/store';
import { Branch, Customer, InventoryItem, Product, Sale } from '../types';

interface SalesInvoicesProps {
    // Props removed - now using Redux
}

const SalesInvoices: React.FC<SalesInvoicesProps> = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const dispatch = useAppDispatch();
    
    // Get data from Redux store
    const sales = useAppSelector(s => selectAll(s, 'sales')) as Sale[];
    const branches = useAppSelector(s => selectAll(s, 'branchinventories')) as Branch[];
    const products = useAppSelector(s => selectAll(s, 'products')) as Product[];
    const inventory = useAppSelector(s => selectAll(s, 'inventoryitems')) as InventoryItem[];
    const customers = useAppSelector(s => selectAll(s, 'customers')) as Customer[];
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const [filters, setFilters] = useState({
        branch: 'all',
        customer: 'all',
        paymentStatus: 'all',
        startDate: '',
        endDate: '',
    });

    type SortKey = 'invoiceNumber' | 'date' | 'totalAmount' | 'brand';
    const [sorting, setSorting] = useState<{ key: SortKey; order: 'asc' | 'desc' }>({
        key: 'date',
        order: 'desc',
    });

    const hasPermission = (permission: 'create' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`sales:${permission}`);
    };

    const handleSave = (sale: Sale) => {
        const hasId = (sale as any)._id || sale.id;
        const idForApi = String((sale as any)._id || sale.id || '');
        const payload: Partial<Sale> = { ...sale };
        if ((payload as any)._id) delete (payload as any)._id;
        
        if (hasId) {
            dispatch(slices.sales.thunks.updateOne({ id: idForApi, body: payload }))
                .unwrap()
                .then(() => {
                    addToast('تم تحديث الفاتورة بنجاح!', 'success');
                    setIsModalOpen(false);
                    setSelectedSale(null);
                })
                .catch(() => addToast('فشل تحديث الفاتورة', 'error'));
        } else {
            dispatch(slices.sales.thunks.createOne(payload))
                .unwrap()
                .then(() => {
                    addToast('تم إضافة الفاتورة بنجاح!', 'success');
                    setIsModalOpen(false);
                    setSelectedSale(null);
                })
                .catch(() => addToast('فشل إضافة الفاتورة', 'error'));
        }
    };

    const handleAddNew = () => {
        setSelectedSale({} as Sale);
        setIsModalOpen(true);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            branch: 'all',
            customer: 'all',
            paymentStatus: 'all',
            startDate: '',
            endDate: '',
        });
    };

    const handleSort = (key: SortKey) => {
        setSorting(prev => ({
            key,
            order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const filteredAndSortedSales = useMemo(() => {
        let salesToProcess = [...sales];

        // Filtering logic
        if (filters.branch !== 'all') {
            salesToProcess = salesToProcess.filter(s => s.branchId === parseInt(filters.branch));
        }
        if (filters.customer !== 'all') {
            salesToProcess = salesToProcess.filter(s => s.customerId === parseInt(filters.customer));
        }
        if (filters.paymentStatus !== 'all') {
            salesToProcess = salesToProcess.filter(s => s.paymentStatus === filters.paymentStatus);
        }
        if (filters.startDate) {
            salesToProcess = salesToProcess.filter(s => new Date(s.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            salesToProcess = salesToProcess.filter(s => new Date(s.date) <= new Date(filters.endDate));
        }
        
        // Sorting logic
        salesToProcess.sort((a, b) => {
            const key = sorting.key;
            const valA = a[key];
            const valB = b[key];

            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }

            return sorting.order === 'asc' ? comparison : -comparison;
        });

        return salesToProcess;
    }, [sales, filters, sorting]);

    const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode }> = ({ sortKey, children }) => {
        const isActive = sorting.key === sortKey;
        const Icon = sorting.order === 'asc' ? ChevronUpIcon : ChevronDownIcon;
        return (
            <th onClick={() => handleSort(sortKey)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {children}
                    {isActive && <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
                </div>
            </th>
        );
    };

    const getStatusChipClass = (status: string) => {
        switch (status) {
            case 'Paid': return 'status-chip status-chip-paid';
            case 'Pending': return 'status-chip status-chip-pending';
            case 'Overdue': return 'status-chip status-chip-overdue';
            default: return 'status-chip status-chip-draft';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Paid': return 'مدفوع';
            case 'Pending': return 'قيد الانتظار';
            case 'Overdue': return 'متأخر';
            default: return status;
        }
    };

    return (
        <>
            <div className="glass-pane sales-page-container">
                <div className="sales-page-header">
                    <h3 className="sales-page-title">سجل فواتير المبيعات</h3>
                    {hasPermission('create') && (
                        <div className="sales-page-actions">
                            <button onClick={handleAddNew} className="btn btn-secondary">
                                إنشاء فاتورة جديدة
                            </button>
                        </div>
                    )}
                </div>

                <div className="sales-filters">
                    <div className="sales-filter-group">
                        <input 
                            type="date" 
                            name="startDate" 
                            value={filters.startDate} 
                            onChange={handleFilterChange} 
                            className="form-input sales-filter-input" 
                            title="Start Date" 
                        />
                        <input 
                            type="date" 
                            name="endDate" 
                            value={filters.endDate} 
                            onChange={handleFilterChange} 
                            className="form-input sales-filter-input" 
                            title="End Date" 
                        />
                        <select 
                            name="paymentStatus" 
                            value={filters.paymentStatus} 
                            onChange={handleFilterChange} 
                            className="form-select sales-filter-select"
                        >
                            <option value="all">كل حالات الدفع</option>
                            <option value="Paid">مدفوع</option>
                            <option value="Pending">قيد الانتظار</option>
                            <option value="Overdue">متأخر</option>
                        </select>
                    </div>
                    <div className="sales-filter-group">
                        <select 
                            name="customer" 
                            value={filters.customer} 
                            onChange={handleFilterChange} 
                            className="form-select sales-filter-select-wide"
                        >
                            <option value="all">كل العملاء</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select 
                            name="branch" 
                            value={filters.branch} 
                            onChange={handleFilterChange} 
                            className="form-select sales-filter-select-wide"
                        >
                            <option value="all">كل الفروع</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <button onClick={resetFilters} className="btn btn-ghost sales-filter-reset">
                        إعادة تعيين
                    </button>
                </div>

                <div className="sales-table-wrapper">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <SortableHeader sortKey="invoiceNumber">رقم الفاتورة</SortableHeader>
                                <SortableHeader sortKey="brand">العلامة التجارية</SortableHeader>
                                <th>الفرع</th>
                                <th>العميل</th>
                                <SortableHeader sortKey="date">التاريخ</SortableHeader>
                                <SortableHeader sortKey="totalAmount">المبلغ الإجمالي</SortableHeader>
                                <th>حالة الدفع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedSales.map(s => (
                                <tr key={s.id} onClick={() => { setSelectedSale(s); setIsModalOpen(true)}}>
                                    <td>{s.invoiceNumber}</td>
                                    <td>{s.brand}</td>
                                    <td>{branches.find(b => b.id === s.branchId)?.name}</td>
                                    <td>{s.customerName}</td>
                                    <td>{s.date}</td>
                                    <td className="amount-positive">{s.totalAmount.toLocaleString()} د.ك</td>
                                    <td>
                                        <span className={getStatusChipClass(s.paymentStatus)}>
                                            {getStatusText(s.paymentStatus)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                 <SaleDetailModal
                    sale={selectedSale}
                    onClose={() => { setIsModalOpen(false); setSelectedSale(null); }}
                    onSave={handleSave}
                    branches={branches}
                    products={products}
                    inventory={inventory}
                    customers={customers}
                />
            )}
        </>
    );
};

export default SalesInvoices;