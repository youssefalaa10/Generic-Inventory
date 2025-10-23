import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../App';
import { Sale, Branch, Product, InventoryItem, Customer } from '../types';
import SaleDetailModal from '../components/SaleDetailModal';
import { useToasts } from '../components/Toast';
import { ChevronUpIcon, ChevronDownIcon } from '../components/Icon';

interface SalesInvoicesProps {
    sales: Sale[];
    onSave: (sale: Sale) => void;
    branches: Branch[];
    products: Product[];
    inventory: InventoryItem[];
    customers: Customer[];
}

const SalesInvoices: React.FC<SalesInvoicesProps> = ({ sales, onSave, branches, products, inventory, customers }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
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
        onSave(sale);
        setIsModalOpen(false);
        setSelectedSale(null);
        addToast('Sale saved successfully!', 'success');
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

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>سجل فواتير المبيعات</h3>
                     {hasPermission('create') && (
                        <button onClick={handleAddNew} className="btn btn-secondary">
                            إنشاء فاتورة جديدة
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-input" style={{flexBasis: '180px'}} title="Start Date" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-input" style={{flexBasis: '180px'}} title="End Date" />
                    <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="form-select" style={{flexBasis: '180px'}}>
                        <option value="all">كل حالات الدفع</option>
                        <option value="Paid">مدفوع</option>
                        <option value="Pending">قيد الانتظار</option>
                        <option value="Overdue">متأخر</option>
                    </select>
                    <select name="customer" value={filters.customer} onChange={handleFilterChange} className="form-select" style={{flexBasis: '220px'}}>
                        <option value="all">كل العملاء</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="branch" value={filters.branch} onChange={handleFilterChange} className="form-select" style={{flexBasis: '220px'}}>
                        <option value="all">كل الفروع</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <button onClick={resetFilters} className="btn btn-ghost" style={{ marginRight: 'auto' }}>إعادة تعيين</button>
                </div>

                <div className="table-wrapper">
                    <table>
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
                                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedSale(s); setIsModalOpen(true)}}>
                                    <td>{s.invoiceNumber}</td>
                                    <td>{s.brand}</td>
                                    <td>{branches.find(b => b.id === s.branchId)?.name}</td>
                                    <td>{s.customerName}</td>
                                    <td>{s.date}</td>
                                    <td style={{ color: '#34d399', fontWeight: 600 }}>{s.totalAmount.toLocaleString()} د.ك</td>
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