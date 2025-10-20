import React, { useState, useEffect, useMemo } from 'react';
import { Sale, SaleItem, Branch, Product, InventoryItem, Customer } from '../types';
import { TrashIcon, PlusIcon } from './Icon';

interface SaleDetailModalProps {
    sale: Sale | null;
    onClose: () => void;
    onSave: (sale: Sale) => void;
    branches: Branch[];
    products: Product[];
    inventory: InventoryItem[];
    customers: Customer[];
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, onClose, onSave, branches, products, inventory, customers }) => {
    const isCreating = !sale?.id;
    const [editableSale, setEditableSale] = useState<Partial<Sale>>({});
    const [customerBalance, setCustomerBalance] = useState<number | null>(null);

    useEffect(() => {
        const defaultBrand: 'Arabiva' | 'Generic' = 'Arabiva';
        const brandBranches = branches.filter(b => b.projectId === 2); // Arabiva project ID
        
        setEditableSale(isCreating ? {
            brand: defaultBrand,
            branchId: brandBranches[0]?.id || 0,
            customerName: 'زبون نقدي عام',
            customerId: 4, // Default Cash Customer ID
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'K-Net',
            paymentStatus: 'Paid',
            items: [],
          } : sale);
    }, [sale, isCreating, branches]);
    
    useEffect(() => {
        if (editableSale.customerId) {
            const currentCustomer = customers.find(c => c.id === editableSale.customerId);
            setCustomerBalance(currentCustomer ? currentCustomer.balance : null);
        } else {
            setCustomerBalance(null);
        }
    }, [editableSale.customerId, customers]);

    const handleFieldChange = (field: keyof Sale, value: string | number) => {
        if (field === 'brand') {
             // When brand changes, auto-select the first valid branch for that brand
            const brandBranches = branches.filter(b => (value === 'Arabiva' ? b.projectId === 2 : b.projectId === 1));
            setEditableSale(prev => ({ ...prev, brand: value as 'Arabiva' | 'Generic', branchId: brandBranches[0]?.id || 0 }));
        } else {
            setEditableSale(prev => ({ ...prev, [field as keyof Sale]: value }));
        }
    };
    
    const handleCustomerChange = (customerId: number) => {
        const selectedCustomer = customers.find(c => c.id === customerId);
        if (selectedCustomer) {
            setEditableSale(prev => ({ 
                ...prev, 
                customerId: selectedCustomer.id,
                customerName: selectedCustomer.name 
            }));
        }
    };


    const handleItemChange = (index: number, field: keyof SaleItem, value: string | number) => {
        const newItems = [...(editableSale.items || [])];
        const item = { ...newItems[index] };
        
        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if(product) {
                item.productId = product.id;
                item.productName = product.name;
                item.unitPrice = product.unitPrice;
            }
        } else if (field === 'quantity' || field === 'unitPrice') {
            item[field as 'quantity' | 'unitPrice'] = Number(value) || 0;
        }

        item.total = item.quantity * item.unitPrice;
        newItems[index] = item;
        setEditableSale(prev => ({ ...prev, items: newItems }));
    };
    
    const getAvailableStock = (productId: number) => {
        const item = inventory.find(i => i.productId === productId && i.branchId === editableSale.branchId);
        return item ? item.quantity : 0;
    }

    const handleAddItem = () => {
        const newItem: SaleItem = {
            id: Date.now(),
            productName: '',
            productId: 0,
            quantity: 1,
            unitPrice: 0,
            total: 0,
        };
        setEditableSale(prev => ({...prev, items: [...(prev.items || []), newItem]}));
    };

    const handleRemoveItem = (index: number) => {
        const newItems = (editableSale.items || []).filter((_, i) => i !== index);
        setEditableSale(prev => ({ ...prev, items: newItems }));
    };

    const handleSave = () => {
        const totalAmount = (editableSale.items || []).reduce((acc, item) => acc + item.total, 0);
        onSave({ ...(editableSale as Sale), totalAmount });
    };

    const total = useMemo(() => {
        return (editableSale.items || []).reduce((acc, item) => acc + item.total, 0);
    }, [editableSale.items]);
    
    const availableBranches = useMemo(() => {
        if (editableSale.brand === 'Arabiva') {
            return branches.filter(b => b.projectId === 2);
        }
        return branches.filter(b => b.projectId === 1);
    }, [editableSale.brand, branches]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()}>
                 <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة بيع جديد' : `تفاصيل البيع #${sale?.invoiceNumber}`}</h2>
                    <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
                </div>
                <div className="modal-body">
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                        <div>
                            <label className="form-label">العلامة التجارية</label>
                            <select
                                value={editableSale.brand || ''}
                                onChange={e => handleFieldChange('brand', e.target.value)}
                                className="form-select"
                                disabled={!isCreating}
                            >
                                <option value="Arabiva">Arabiva</option>
                                <option value="Generic">Generic</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">الفرع</label>
                            <select value={editableSale.branchId || ''} onChange={e => handleFieldChange('branchId', parseInt(e.target.value))} className="form-select">
                                {availableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="form-label">التاريخ</label>
                            <input type="date" value={editableSale.date || ''} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" />
                        </div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
                        <div>
                            <label className="form-label">العميل</label>
                            <select
                                value={editableSale.customerId || ''}
                                onChange={e => handleCustomerChange(parseInt(e.target.value))}
                                className="form-select"
                            >
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">رصيد العميل</label>
                            <input
                                type="text"
                                readOnly
                                value={
                                    customerBalance !== null 
                                    ? `${Math.abs(customerBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${customerBalance > 0 ? 'مدين' : customerBalance < 0 ? 'دائن' : ''}`.trim() 
                                    : 'N/A'
                                }
                                className="form-input"
                                style={{ 
                                    background: 'var(--input-bg)', 
                                    opacity: 0.8, 
                                    fontWeight: 600,
                                    color: customerBalance > 0 ? '#ef4444' : customerBalance < 0 ? '#10b981' : 'var(--text-primary)' 
                                }}
                            />
                        </div>
                    </div>
                    
                    <h3 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>بنود الفاتورة</h3>
                    <div className="table-wrapper">
                        <table>
                             <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th style={{width: '100px'}}>الكمية</th>
                                    <th style={{width: '120px'}}>سعر الوحدة</th>
                                    <th style={{width: '120px'}}>الإجمالي</th>
                                    <th style={{width: '50px'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(editableSale.items || []).map((item, index) => {
                                    const stock = getAvailableStock(item.productId);
                                    return (
                                     <tr key={item.id}>
                                        <td style={{padding: '0.5rem'}}>
                                            <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="form-select">
                                                <option value={0}>اختر منتج</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td style={{padding: '0.5rem'}}>
                                            <input type="number" value={item.quantity} max={stock} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" style={{borderColor: item.quantity > stock ? '#ef4444' : 'var(--input-border)'}}/>
                                            <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', textAlign: 'center'}}>المتاح: {stock}</p>
                                        </td>
                                        <td style={{padding: '0.5rem'}}><input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="form-input"/></td>
                                        <td style={{fontWeight: 600}}>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} د.ك</td>
                                        <td>
                                            <button onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width: '20px', height: '20px'}}/></button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    <div style={{marginTop: '1rem', textAlign: 'left'}}>
                        <button onClick={handleAddItem} className="btn btn-secondary"><PlusIcon style={{width: '20px', height: '20px'}}/> إضافة بند</button>
                    </div>
                     <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                        <div style={{width: '100%', maxWidth: '320px', textAlign: 'right'}}>
                             <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.25rem', borderTop: '1px solid var(--surface-border)'}}>
                                <span style={{fontWeight: 700}}>المبلغ الإجمالي:</span>
                                <span style={{fontWeight: 700, color: 'var(--primary-color)'}}>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'حفظ البيع' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetailModal;
