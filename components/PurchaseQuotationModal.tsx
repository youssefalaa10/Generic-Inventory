

import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseQuotation, Supplier, Product, RequestForQuotation } from '../types';
import { PlusIcon, TrashIcon } from './Icon';

type PurchaseQuotationItem = PurchaseQuotation['items'][number];

interface PurchaseQuotationModalProps {
    quotation: Partial<PurchaseQuotation> | null;
    onClose: () => void;
    onSave: (quotation: PurchaseQuotation) => void;
    suppliers: Supplier[];
    products: Product[];
    rfqs: RequestForQuotation[];
}

const PurchaseQuotationModal: React.FC<PurchaseQuotationModalProps> = ({ quotation, onClose, onSave, suppliers, products, rfqs }) => {
    const isCreating = !quotation?.id;
    const [editableQuotation, setEditableQuotation] = useState<Partial<PurchaseQuotation>>({});

    useEffect(() => {
        setEditableQuotation(isCreating ? {
            date: new Date().toISOString().split('T')[0],
            status: 'Received',
            items: [],
        } : quotation);
    }, [quotation, isCreating]);

    const totalAmount = useMemo(() => {
        return (editableQuotation.items || []).reduce((sum, item) => sum + item.total, 0);
    }, [editableQuotation.items]);

    useEffect(() => {
        setEditableQuotation(prev => ({ ...prev, totalAmount }));
    }, [totalAmount]);

    const handleFieldChange = (field: keyof PurchaseQuotation, value: any) => {
        setEditableQuotation(prev => ({ ...prev, [field]: value }));
    };
    
    const handleItemChange = (index: number, field: keyof PurchaseQuotationItem, value: any) => {
        const newItems = [...(editableQuotation.items || [])];
        const item = { ...newItems[index] };
        
        if (field === 'productId') {
            item.productId = Number(value);
        } else {
            (item as any)[field] = Number(value) || 0;
        }

        item.total = item.quantity * item.unitPrice;
        newItems[index] = item;
        setEditableQuotation(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: PurchaseQuotationItem = { productId: 0, description: '', quantity: 1, unitPrice: 0, total: 0 };
        setEditableQuotation(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleRemoveItem = (index: number) => {
        setEditableQuotation(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    const handleSaveClick = () => {
        if (!editableQuotation.supplierId) {
            alert('Please select a supplier.');
            return;
        }
        onSave(editableQuotation as PurchaseQuotation);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '50rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'إضافة عرض سعر مورد' : `عرض سعر #${quotation?.id}`}</h2>
                </div>
                <div className="modal-body">
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div><label className="form-label">المورد</label><select value={editableQuotation.supplierId} onChange={e => handleFieldChange('supplierId', Number(e.target.value))} className="form-select"><option>اختر...</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div><label className="form-label">تاريخ العرض</label><input type="date" value={editableQuotation.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" /></div>
                        <div><label className="form-label">مرتبط بـ RFQ</label><select value={editableQuotation.rfqId} onChange={e => handleFieldChange('rfqId', Number(e.target.value))} className="form-select"><option>اختر...</option>{rfqs.map(r => <option key={r.id} value={r.id}>RFQ #{r.id}</option>)}</select></div>
                    </div>
                    
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>المنتج</th><th style={{width:'100px'}}>الكمية</th><th style={{width:'120px'}}>سعر الوحدة</th><th style={{width:'120px'}}>الإجمالي</th><th style={{width:'50px'}}></th></tr></thead>
                            <tbody>
                                {(editableQuotation.items || []).map((item, index) => (
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
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSaveClick} className="btn btn-secondary">{isCreating ? 'حفظ' : 'حفظ التغييرات'}</button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseQuotationModal;