import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../components/Icon';
import { InventoryVoucher } from '../types';

interface InventoryVouchersProps {
    vouchers: InventoryVoucher[];
}

const InventoryVouchers: React.FC<InventoryVouchersProps> = ({ vouchers }) => {
    const [filters, setFilters] = useState({
        search: '',
        branch: 'all',
        source: 'all',
        warehouse: 'all',
        client: 'all',
        id: '',
        supplier: 'all'
    });

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
                    <div style={{ display: 'flex', gap: '1rem' }}>
                         <div className="btn-group">
                             <button className="btn btn-secondary dropdown-toggle" type="button" style={{padding: '0.75rem 1.5rem'}}>
                                إضافة
                             </button>
                             {/* Dummy dropdown menu */}
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
                {vouchers.map(voucher => (
                    <div key={voucher.id} className="inventory-voucher-card">
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
                                <span className="inventory-voucher-id">{voucher.id}</span>
                            </div>
                            <p className="inventory-voucher-date">
                                {new Date(voucher.date).toLocaleDateString('ar-EG')} - {new Date(voucher.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                            <p className="inventory-voucher-branch">{voucher.branch}</p>
                        </div>
                        <div style={{color: 'var(--text-secondary)'}}>
                            <button style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>&#x22EE;</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryVouchers;