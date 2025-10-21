import React, { useState } from 'react';
import { InventoryVoucher } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from '../components/Icon';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <select name="branch" value={filters.branch} onChange={handleFilterChange} className="form-select"><option value="all">الفرع: الكل</option></select>
                    <select name="source" value={filters.source} onChange={handleFilterChange} className="form-select"><option value="all">مصدر الإذن: الكل</option></select>
                    <select name="warehouse" value={filters.warehouse} onChange={handleFilterChange} className="form-select"><option value="all">المستودع: الكل</option></select>
                    <select name="client" value={filters.client} onChange={handleFilterChange} className="form-select"><option value="all">العميل: أي عميل</option></select>
                    <input type="text" name="id" placeholder="الرقم المعرف" value={filters.id} onChange={handleFilterChange} className="form-input" />
                    <select name="supplier" value={filters.supplier} onChange={handleFilterChange} className="form-select"><option value="all">المورد: كل الموردين</option></select>
                </div>
                 <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                    <button className="btn btn-ghost">إلغاء الفلتر</button>
                    <button className="btn btn-primary">بحث</button>
                </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {vouchers.map(voucher => (
                    <div key={voucher.id} className="glass-pane" style={{padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div style={{color: voucher.type === 'up' ? 'var(--secondary-color)' : '#f59e0b'}}>
                            {voucher.type === 'up' ? 
                                <ChevronUpIcon style={{width: 32, height: 32, border: '2px solid', borderRadius: '50%', padding: '4px'}} /> : 
                                <ChevronDownIcon style={{width: 32, height: 32, border: '2px solid', borderRadius: '50%', padding: '4px'}} />}
                        </div>
                        <div style={{flex: 1}}>
                            <p style={{fontWeight: 600, fontSize: '1.1rem'}}>{voucher.description}</p>
                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                                {voucher.details} بواسطة: <span style={{fontWeight: 500, color: 'var(--text-primary)'}}>{voucher.createdBy}</span>
                            </p>
                        </div>
                         <div style={{textAlign: 'left'}}>
                            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end'}}>
                                <span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', background: '#10b981', color: 'white', fontSize: '0.8rem', fontWeight: 600}}>{voucher.status}</span>
                                <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{voucher.id}</span>
                            </div>
                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem'}}>
                                {new Date(voucher.date).toLocaleDateString('ar-EG')} - {new Date(voucher.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{voucher.branch}</p>
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