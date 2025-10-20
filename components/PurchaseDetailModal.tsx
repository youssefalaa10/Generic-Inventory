import React, { useState, useEffect, useMemo } from 'react';
import { Purchase, PurchaseItem, Branch, Product, Currency } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './Icon';

interface PurchaseDetailModalProps {
    purchase: Purchase;
    onClose: () => void;
    onSave: (purchase: Purchase) => void;
    branches: Branch[];
    products: Product[];
    scannedTotal?: number | null;
}

const defaultCurrencies: { value: Currency, label: string }[] = [
    { value: 'KWD', label: 'دينار كويتي (KWD)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
];

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({ purchase, onClose, onSave, branches, products, scannedTotal }) => {
    const isCreating = !purchase.id;
    const [isEditing, setIsEditing] = useState(isCreating);
    const [editablePurchase, setEditablePurchase] = useState<Partial<Purchase>>(
        isCreating 
        ? {
            id: 0,
            brand: 'Generic',
            branchId: 4, // Default to Generic/Manufacturing branch
            supplier: { name: '', contactPerson: '', email: '', phone: '' },
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            amountInCurrency: 0,
            currency: 'KWD',
            exchangeRate: 1,
            type: 'Local',
            description: '',
            paymentStatus: 'Pending',
            items: [],
            ...purchase
        }
        : purchase
    );
    
    useEffect(() => {
        if (!isCreating) {
            setEditablePurchase(JSON.parse(JSON.stringify(purchase)));
        }
    }, [purchase, isCreating]);

    useEffect(() => {
        const totalInCurrency = (editablePurchase.items || []).reduce((acc, item) => acc + item.total, 0);
        const finalAmountKWD = totalInCurrency * (editablePurchase.exchangeRate || 1);

        setEditablePurchase(prev => ({
            ...prev,
            amountInCurrency: totalInCurrency,
            amount: finalAmountKWD
        }));
    }, [editablePurchase.items, editablePurchase.exchangeRate]);
    
    const handleHeaderChange = (field: keyof Purchase | keyof Purchase['supplier'], value: any) => {
         if (['name', 'contactPerson', 'email', 'phone'].includes(field as string)) {
            setEditablePurchase(prev => ({ ...prev, supplier: { ...prev.supplier, [field as keyof Purchase['supplier']]: value as string }}));
        } else if (field === 'currency') {
            const newRate = value === 'KWD' ? 1 : (editablePurchase.exchangeRate === 1 ? 0.30 : editablePurchase.exchangeRate);
             setEditablePurchase(prev => ({ ...prev, currency: value, exchangeRate: newRate }));
        } else if (field === 'brand') {
             // When brand changes, auto-select the first valid branch for that brand
            const brandBranches = branches.filter(b => (value === 'Arabiva' ? b.projectId === 2 : b.projectId === 1));
            setEditablePurchase(prev => ({ ...prev, brand: value as 'Arabiva' | 'Generic', branchId: brandBranches[0]?.id || 0 }));
        }
         else {
            setEditablePurchase(prev => ({ ...prev, [field as keyof Purchase]: value }));
        }
    }

    const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
        const newItems = [...(editablePurchase.items || [])];
        const item = { ...newItems[index] };
        
        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if(product) {
                item.productId = product.id;
                item.productName = product.name;
                // unitPrice will be in the selected currency of the invoice
                item.unitPrice = 0; // Reset price when product changes
            }
        } else if (field === 'quantity' || field === 'unitPrice') {
            item[field as 'quantity' | 'unitPrice'] = Number(value) || 0;
        }

        item.total = item.quantity * item.unitPrice;
        newItems[index] = item;
        setEditablePurchase(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: PurchaseItem = {
            id: Date.now(),
            productName: '',
            productId: 0,
            quantity: 1,
            unitPrice: 0,
            total: 0,
        };
        setEditablePurchase(prev => ({...prev, items: [...(prev.items || []), newItem]}));
    };

    const handleRemoveItem = (index: number) => {
        const newItems = (editablePurchase.items || []).filter((_, i) => i !== index);
        setEditablePurchase(prev => ({ ...prev, items: newItems }));
    };

    const handleSave = () => {
        onSave(editablePurchase as Purchase);
    };

    const handleCancel = () => {
        if (isCreating) {
            onClose();
        } else {
            setEditablePurchase(JSON.parse(JSON.stringify(purchase)));
            setIsEditing(false);
        }
    }
    
    const formatCurrency = (val: number, currencyCode: string = '') => {
        return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;
    };
    
    const totalMatchesScan = useMemo(() => {
        if (scannedTotal === null || scannedTotal === undefined) return true; // No scan, so no mismatch
        return Math.abs((editablePurchase.amountInCurrency || 0) - scannedTotal) < 0.01;
    }, [editablePurchase.amountInCurrency, scannedTotal]);
    
    const availableBranches = useMemo(() => {
        if (editablePurchase.brand === 'Arabiva') {
            return branches.filter(b => b.projectId === 2);
        }
        return branches.filter(b => b.projectId === 1);
    }, [editablePurchase.brand, branches]);


    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة شراء جديد' : `تفاصيل الشراء #${purchase.id}`}</h2>
                    <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
                </div>

                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="glass-pane" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                            <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)'}}>معلومات المورد</h3>
                            {isEditing ? (
                                <>
                                    <input type="text" placeholder="اسم المورد" value={editablePurchase.supplier?.name} onChange={e => handleHeaderChange('name', e.target.value)} className="form-input" />
                                    <input type="text" placeholder="شخص الاتصال" value={editablePurchase.supplier?.contactPerson} onChange={e => handleHeaderChange('contactPerson', e.target.value)} className="form-input" />
                                </>
                            ) : (
                                <>
                                    <p><strong>الاسم:</strong> {purchase.supplier.name}</p>
                                    <p style={{color: 'var(--text-secondary)'}}><strong>شخص الاتصال:</strong> {purchase.supplier.contactPerson}</p>
                                </>
                            )}
                        </div>
                        <div className="glass-pane" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)'}}>معلومات الفاتورة</h3>
                             {isEditing ? (
                                <>
                                    <input type="date" value={editablePurchase.date} onChange={e => handleHeaderChange('date', e.target.value)} className="form-input" />
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                                        <select value={editablePurchase.brand} onChange={e => handleHeaderChange('brand', e.target.value)} className="form-select">
                                            <option value="Arabiva">Arabiva</option>
                                            <option value="Generic">Generic</option>
                                        </select>
                                        <select value={editablePurchase.branchId} onChange={e => handleHeaderChange('branchId', parseInt(e.target.value))} className="form-select">
                                            {availableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <select value={editablePurchase.paymentStatus} onChange={e => handleHeaderChange('paymentStatus', e.target.value)} className="form-select">
                                        <option value="Pending">قيد الانتظار</option>
                                        <option value="Paid">مدفوع</option>
                                        <option value="Overdue">متأخر</option>
                                    </select>
                                </>
                             ) : (
                                <>
                                     <p><strong>التاريخ:</strong> {purchase.date}</p>
                                     <p><strong>العملة:</strong> {purchase.currency}</p>
                                </>
                             )}
                        </div>
                        {isEditing && (
                            <div className="glass-pane" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <h3 style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)'}}>العملة</h3>
                                <select value={editablePurchase.currency} onChange={e => handleHeaderChange('currency', e.target.value)} className="form-select">
                                    {defaultCurrencies.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <input type="number" placeholder="سعر الصرف إلى KWD" value={editablePurchase.exchangeRate} onChange={e => handleHeaderChange('exchangeRate', parseFloat(e.target.value))} className="form-input" disabled={editablePurchase.currency === 'KWD'} step="0.001"/>
                            </div>
                        )}
                    </div>
                    
                    <h3 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>بنود الفاتورة</h3>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th style={{width: '100px'}}>الكمية</th>
                                    <th style={{width: '120px'}}>سعر الوحدة ({editablePurchase.currency})</th>
                                    <th style={{width: '120px'}}>الإجمالي ({editablePurchase.currency})</th>
                                    {isEditing && <th style={{width: '50px'}}></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(editablePurchase.items || []).map((item, index) => (
                                    <tr key={item.id}>
                                        {isEditing ? (
                                            <>
                                                <td style={{padding: '0.5rem'}}><select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="form-select"><option value={0}>اختر منتج</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                                <td style={{padding: '0.5rem'}}><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input"/></td>
                                                <td style={{padding: '0.5rem'}}><input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="form-input"/></td>
                                                <td style={{fontWeight: 600}}>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td><button onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width: '20px', height: '20px'}}/></button></td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{item.productName}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.unitPrice.toFixed(2)}</td>
                                                <td style={{fontWeight: 600}}>{item.total.toLocaleString()}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {isEditing && (
                        <div style={{marginTop: '1rem', textAlign: 'left'}}>
                            <button onClick={handleAddItem} className="btn btn-secondary"><PlusIcon style={{width:'20px', height:'20px'}}/> إضافة بند</button>
                        </div>
                    )}
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                        <div style={{width: '100%', maxWidth: '380px', textAlign: 'right'}}>
                             {(scannedTotal !== null && scannedTotal !== undefined) && (
                                <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1rem'}}>
                                    <span style={{color: 'var(--text-secondary)'}}>المبلغ الممسوح ضوئياً:</span>
                                    <span style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{formatCurrency(scannedTotal, editablePurchase.currency)}</span>
                                </div>
                             )}
                             <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem', borderTop: '1px solid var(--surface-border)'}}>
                                <span style={{fontWeight: 600}}>إجمالي ({editablePurchase.currency}):</span>
                                <span style={{fontWeight: 600, color: totalMatchesScan ? 'var(--secondary-color)' : '#f59e0b', transition: 'color 0.3s ease'}}>
                                    {formatCurrency(editablePurchase.amountInCurrency || 0, editablePurchase.currency)}
                                </span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.25rem'}}>
                                <span style={{fontWeight: 700}}>الإجمالي (د.ك):</span>
                                <span style={{fontWeight: 700, color: 'var(--primary-color)'}}>
                                    {formatCurrency(editablePurchase.amount || 0, 'د.ك')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="modal-footer">
                    <div>
                    {isEditing ? (
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button onClick={handleSave} className="btn btn-secondary">{isCreating ? 'حفظ الشراء' : 'حفظ التعديلات'}</button>
                            <button onClick={handleCancel} className="btn btn-ghost">إلغاء</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn btn-warning"><PencilIcon style={{width:'20px', height:'20px'}}/> تعديل</button>
                    )}
                    </div>
                    <button onClick={onClose} className="btn btn-primary">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetailModal;
