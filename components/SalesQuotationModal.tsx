
import React, { useState, useEffect, useMemo } from 'react';
import { SalesQuotation, SalesQuotationItem, Customer, Product } from '../types';
import { PlusIcon, TrashIcon } from './Icon';

interface SalesQuotationModalProps {
    quotation: Partial<SalesQuotation> | null;
    onClose: () => void;
    onSave: (quotation: SalesQuotation) => void;
    onConvertToInvoice: (quotation: SalesQuotation) => void;
    customers: Customer[];
    products: Product[];
}

const SalesQuotationModal: React.FC<SalesQuotationModalProps> = ({ quotation, onClose, onSave, onConvertToInvoice, customers, products }) => {
    const isCreating = !quotation?.id;
    const [editableQuote, setEditableQuote] = useState<Partial<SalesQuotation>>({});

    useEffect(() => {
        const today = new Date();
        const expiry = new Date(today);
        expiry.setDate(today.getDate() + 30);
        
        setEditableQuote(isCreating ? {
            customerId: 0,
            date: today.toISOString().split('T')[0],
            expiryDate: expiry.toISOString().split('T')[0],
            status: 'Draft',
            items: [],
        } : quotation);
    }, [quotation, isCreating]);

    const totalAmount = useMemo(() => {
        return (editableQuote.items || []).reduce((sum, item) => sum + item.total, 0);
    }, [editableQuote.items]);

    useEffect(() => {
        setEditableQuote(prev => ({ ...prev, totalAmount }));
    }, [totalAmount]);

    const handleFieldChange = (field: keyof SalesQuotation, value: any) => {
        setEditableQuote(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof SalesQuotationItem, value: any) => {
        const newItems = [...(editableQuote.items || [])];
        const item = { ...newItems[index] };
        
        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            if (product) {
                item.productId = product.id;
                item.productName = product.name;
                item.unitPrice = product.unitPrice;
            }
        } else {
            (item as any)[field] = Number(value) || 0;
        }

        item.total = item.quantity * item.unitPrice;
        newItems[index] = item;
        setEditableQuote(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: SalesQuotationItem = { productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 };
        setEditableQuote(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleRemoveItem = (index: number) => {
        setEditableQuote(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    const handleSaveClick = (status: SalesQuotation['status']) => {
        if (!editableQuote.customerId) {
            alert('Please select a customer.');
            return;
        }
        onSave({ ...editableQuote, status } as SalesQuotation);
        onClose();
    };
    
    const handleConvertClick = () => {
        onConvertToInvoice(editableQuote as SalesQuotation);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '50rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'عرض سعر جديد' : `تعديل عرض سعر #${quotation?.quoteNumber}`}</h2>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label required">العميل</label>
                            <select value={editableQuote.customerId} onChange={e => handleFieldChange('customerId', Number(e.target.value))} className="form-select">
                                <option value={0} disabled>اختر عميل...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">تاريخ الإصدار</label>
                            <input type="date" value={editableQuote.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">تاريخ الانتهاء</label>
                            <input type="date" value={editableQuote.expiryDate} onChange={e => handleFieldChange('expiryDate', e.target.value)} className="form-input" />
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>المنتج</th><th style={{width:'100px'}}>الكمية</th><th style={{width:'120px'}}>السعر</th><th style={{width:'120px'}}>الإجمالي</th><th style={{width:'50px'}}></th></tr></thead>
                            <tbody>
                                {(editableQuote.items || []).map((item, index) => (
                                    <tr key={index}>
                                        <td style={{padding: '0.5rem'}}><select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="form-select"><option value="">اختر...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></td>
                                        <td style={{padding: '0.5rem'}}><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" /></td>
                                        <td style={{padding: '0.5rem'}}><input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="form-input" /></td>
                                        <td>{item.total.toFixed(2)}</td>
                                        <td><button type="button" onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width:'20px',height:'20px'}}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div style={{marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
                        <button type="button" onClick={handleAddItem} className="btn btn-ghost"><PlusIcon style={{width:'20px',height:'20px'}}/> إضافة بند</button>
                        <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>الإجمالي: {totalAmount.toFixed(2)} د.ك</div>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <div>
                         {editableQuote.status === 'Accepted' && <button onClick={handleConvertClick} className="btn btn-primary">تحويل إلى فاتورة</button>}
                    </div>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                        <button onClick={() => handleSaveClick('Draft')} className="btn btn-ghost">حفظ كمسودة</button>
                        <button onClick={() => handleSaveClick('Sent')} className="btn btn-secondary">حفظ وإرسال</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesQuotationModal;
