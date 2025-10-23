
import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Product, PurchaseQuotation } from '../types';
import { PlusIcon, TrashIcon } from './Icon';

interface PurchaseOrderModalProps {
    order: Partial<PurchaseOrder> | null;
    onClose: () => void;
    onSave: (order: PurchaseOrder) => void;
    suppliers: Supplier[];
    products: Product[];
    purchaseQuotations: PurchaseQuotation[];
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ order, onClose, onSave, suppliers, products, purchaseQuotations }) => {
    const isCreating = !order?.id;
    const [editableOrder, setEditableOrder] = useState<Partial<PurchaseOrder>>({});

    useEffect(() => {
        setEditableOrder(isCreating ? {
            date: new Date().toISOString().split('T')[0],
            status: 'Draft',
            items: [],
        } : order);
    }, [order, isCreating]);

    const totalAmount = useMemo(() => {
        return (editableOrder.items || []).reduce((sum, item) => sum + item.total, 0);
    }, [editableOrder.items]);

    useEffect(() => {
        setEditableOrder(prev => ({ ...prev, totalAmount }));
    }, [totalAmount]);

    const handleFieldChange = (field: keyof PurchaseOrder, value: any) => {
        setEditableOrder(prev => ({ ...prev, [field]: value }));
    };
    
    const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
        const newItems = [...(editableOrder.items || [])];
        const item = { ...newItems[index] };
        
        if (field === 'productId') {
            item.productId = Number(value);
        } else {
            (item as any)[field] = Number(value) || 0;
        }

        item.total = item.quantity * item.unitPrice;
        newItems[index] = item;
        setEditableOrder(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: PurchaseOrderItem = { productId: 0, quantity: 1, unitPrice: 0, total: 0 };
        setEditableOrder(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleRemoveItem = (index: number) => {
        setEditableOrder(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    const handleSaveClick = () => {
        if (!editableOrder.supplierId) {
            alert('Please select a supplier.');
            return;
        }
        onSave(editableOrder as PurchaseOrder);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '50rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'إنشاء أمر شراء' : `تعديل أمر شراء #${order?.id}`}</h2>
                </div>
                <div className="modal-body">
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div><label className="form-label">المورد</label><select value={editableOrder.supplierId} onChange={e => handleFieldChange('supplierId', Number(e.target.value))} className="form-select"><option>اختر...</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div><label className="form-label">تاريخ الأمر</label><input type="date" value={editableOrder.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" /></div>
                        <div><label className="form-label">مرتبط بعرض سعر</label><select value={editableOrder.quotationId || ''} onChange={e => handleFieldChange('quotationId', Number(e.target.value))} className="form-select"><option value="">لا يوجد</option>{purchaseQuotations.map(q => <option key={q.id} value={q.id}>Quotation #{q.id}</option>)}</select></div>
                    </div>
                    
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>المنتج</th><th style={{width:'100px'}}>الكمية</th><th style={{width:'120px'}}>سعر الوحدة</th><th style={{width:'120px'}}>الإجمالي</th><th style={{width:'50px'}}></th></tr></thead>
                            <tbody>
                                {(editableOrder.items || []).map((item, index) => (
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
                    <button onClick={handleSaveClick} className="btn btn-secondary">{isCreating ? 'إنشاء الأمر' : 'حفظ التغييرات'}</button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;
