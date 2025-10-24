import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchVouchers, createVoucher, deleteVoucher } from '../src/store/slices/vouchersSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';

const InventoryVouchers: React.FC = () => {
    const dispatch = useAppDispatch();
    const { addToast } = useToasts();
    const vouchers = useAppSelector(s => s.vouchers.items);
    const branches = useAppSelector(s => s.branches.branches);
    const [filters, setFilters] = useState({
        search: '',
        branch: 'all',
        source: 'all',
        warehouse: 'all',
        client: 'all',
        id: '',
        supplier: 'all'
    });
    const [newVoucher, setNewVoucher] = useState<{ date: string; type: 'up'|'down'; branchId: string; description?: string; details?: string }>({
        date: new Date().toISOString(),
        type: 'up',
        branchId: '',
        description: '',
        details: ''
    });

    useEffect(() => {
        dispatch(fetchVouchers());
        if (!branches?.length) dispatch(fetchBranches({ page: 1, limit: 100 }));
    }, [dispatch]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    return (
        <div className="inventory-vouchers-container">
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div className="inventory-vouchers-header">
                    <div style={{flex: 1, maxWidth: '300px'}}>
                        <input type="text" name="search" placeholder="بحث..." value={filters.search} onChange={handleFilterChange} className="form-input" />
                    </div>
                    <div className="glass-pane" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                        <div>
                            <label className="form-label">التاريخ</label>
                            <input type="datetime-local" className="form-input" value={new Date(newVoucher.date).toISOString().slice(0,16)} onChange={e => setNewVoucher(v => ({...v, date: new Date(e.target.value).toISOString()}))} />
                        </div>
                        <div>
                            <label className="form-label">النوع</label>
                            <select className="form-select" value={newVoucher.type} onChange={e => setNewVoucher(v => ({...v, type: e.target.value as any}))}>
                                <option value="up">إذن إضافة</option>
                                <option value="down">إذن صرف</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">الفرع</label>
                            <select className="form-select" value={newVoucher.branchId} onChange={e => setNewVoucher(v => ({...v, branchId: e.target.value}))}>
                                <option value="">اختر الفرع</option>
                                {(branches || []).map((b: any) => <option key={String(b._id || b.id)} value={String(b._id || b.id)}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={() => {
                                if (!newVoucher.branchId) {
                                    addToast('اختر الفرع', 'error');
                                    return;
                                }
                                dispatch(createVoucher({
                                    date: newVoucher.date,
                                    type: newVoucher.type,
                                    branchId: newVoucher.branchId,
                                    description: newVoucher.description,
                                    details: newVoucher.details,
                                } as any))
                                  .unwrap()
                                  .then(() => { addToast('تم إنشاء إذن مخزني', 'success'); setNewVoucher(v => ({...v, description: '', details: ''})); dispatch(fetchVouchers()); })
                                  .catch(() => addToast('فشل إنشاء الإذن', 'error'));
                            }}>
                                <PlusIcon style={{ width: '20px', height: '20px' }} />
                                إضافة إذن
                            </button>
                        </div>
                    </div>
                </div>
                <div className="inventory-vouchers-filters">
                    <select name="branch" value={filters.branch} onChange={handleFilterChange} className="form-select"><option value="all">الفرع: الكل</option></select>
                    <select name="source" value={filters.source} onChange={handleFilterChange} className="form-select"><option value="all">مصدر الإذن: الكل</option></select>
                    <select name="warehouse" value={filters.warehouse} onChange={handleFilterChange} className="form-select"><option value="all">المستودع: الكل</option></select>
                    <select name="client" value={filters.client} onChange={handleFilterChange} className="form-select"><option value="all">العميل: أي عميل</option></select>
                    <input type="text" name="id" placeholder="الرقم المعرف" value={filters.id} onChange={handleFilterChange} className="form-input" />
                    <select name="supplier" value={filters.supplier} onChange={handleFilterChange} className="form-select"><option value="all">المورد: كل الموردين</option></select>
                </div>
                 <div className="inventory-vouchers-actions">
                    <button className="btn btn-ghost">إلغاء الفلتر</button>
                    <button className="btn btn-primary">بحث</button>
                </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {vouchers.map((voucher: any) => (
                    <div key={String(voucher._id || voucher.id)} className="inventory-voucher-card">
                        <div className="inventory-voucher-icon" style={{color: voucher.type === 'up' ? 'var(--secondary-color)' : '#f59e0b'}}>
                            {voucher.type === 'up' ? 
                                <ChevronUpIcon style={{width: 32, height: 32}} /> : 
                                <ChevronDownIcon style={{width: 32, height: 32}} />}
                        </div>
                        <div className="inventory-voucher-content">
                            <p className="inventory-voucher-title">{voucher.description}</p>
                            <p className="inventory-voucher-description">
                                {voucher.details} بواسطة: <span style={{fontWeight: 500, color: 'var(--text-primary)'}}>{voucher.createdBy}</span>
                            </p>
                        </div>
                         <div className="inventory-voucher-meta">
                            <div className="inventory-voucher-status">
                                <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', background: '#10b981', color: 'white', fontSize: '0.8rem', fontWeight: 600}}>{voucher.status}</span>
                                <span className="inventory-voucher-id">{String(voucher._id || voucher.id)}</span>
                            </div>
                            <p className="inventory-voucher-date">
                                {new Date(voucher.date).toLocaleDateString('ar-EG')} - {new Date(voucher.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                            <p className="inventory-voucher-branch">{branches.find((b: any) => String(b._id || b.id) === String(voucher.branchId))?.name || '-'}</p>
                        </div>
                        <div style={{color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem'}}>
                            <button style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>&#x22EE;</button>
                            <button className="btn btn-ghost" onClick={() => {
                                const id = String(voucher._id || voucher.id);
                                dispatch(deleteVoucher(id))
                                  .unwrap()
                                  .then(() => { addToast('تم حذف الإذن', 'success'); dispatch(fetchVouchers()); })
                                  .catch(() => addToast('فشل حذف الإذن', 'error'));
                            }}>
                                <TrashIcon style={{width: 20, height: 20}} />
                                حذف
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryVouchers;