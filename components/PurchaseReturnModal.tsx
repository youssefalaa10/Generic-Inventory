
import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseReturn, PurchaseReturnItem, Supplier, Product, Currency } from '../types';
import { PlusIcon, TrashIcon } from './Icon';

// A simple rich text editor toolbar (dummy)
const RichTextToolbar: React.FC = () => (
    <div className="rich-text-editor-toolbar">
        <button type="button" title="Bold"><b>B</b></button>
        <button type="button" title="Italic"><i>I</i></button>
        <button type="button" title="Underline"><u>U</u></button>
    </div>
);

const PurchaseReturnModal: React.FC<{
    purchaseReturn: Partial<PurchaseReturn> | null;
    onClose: () => void;
    onSave: (pr: PurchaseReturn) => void;
    suppliers: Supplier[];
    products: Product[];
}> = ({ purchaseReturn, onClose, onSave, suppliers, products }) => {
    const isCreating = !purchaseReturn?.id;
    const [editableReturn, setEditableReturn] = useState<Partial<PurchaseReturn>>({});

    useEffect(() => {
        setEditableReturn(isCreating ? {
            date: new Date().toISOString().split('T')[0],
            status: 'Draft',
            items: [],
            totalReturnedAmount: 0,
        } : purchaseReturn);
    }, [purchaseReturn, isCreating]);

    const totalAmount = useMemo(() => {
        return (editableReturn.items || []).reduce((sum, item) => sum + item.total, 0);
    }, [editableReturn.items]);

    useEffect(() => {
        setEditableReturn(prev => ({ ...prev, totalReturnedAmount: totalAmount }));
    }, [totalAmount]);

    const handleFieldChange = (field: keyof PurchaseReturn, value: any) => {
        setEditableReturn(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof PurchaseReturnItem, value: any) => {
        const newItems = [...(editableReturn.items || []) as PurchaseReturnItem[]];
        const item = { ...newItems[index] };

        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            (item as any)[field] = Number(value);
            item.description = product?.name || '';
            item.unitPrice = product?.unitPrice || 0;
        } else {
            (item as any)[field] = (field === 'description' || field === 'reason') ? value : (Number(value) || 0);
        }

        item.total = (item.quantity || 0) * (item.unitPrice || 0) * (1 - (item.discountPercent || 0) / 100);
        newItems[index] = item;
        setEditableReturn(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: PurchaseReturnItem = { productId: 0, quantity: 1, unitPrice: 0, total: 0, reason: '' };
        setEditableReturn(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleRemoveItem = (index: number) => {
        setEditableReturn(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    const handleSaveClick = (status: 'Draft' | 'Returned') => {
        if (!editableReturn.supplierId) {
            alert('Please select a supplier.');
            return;
        }
        onSave({ ...editableReturn, status } as PurchaseReturn);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'مرتجع مشتريات جديد' : `تعديل مرتجع #${purchaseReturn?.id}`}</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleSaveClick('Draft')} className="btn btn-ghost">حفظ كمسودة</button>
                        <button onClick={() => handleSaveClick('Returned')} className="btn btn-secondary">حفظ</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-section-body">
                            <div className="form-grid-cols-4">
                                <div><label className="form-label required">المورد</label><select value={editableReturn.supplierId} onChange={e => handleFieldChange('supplierId', Number(e.target.value))} className="form-select"><option>اختر...</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="form-label">العملة</label><select className="form-select" value={'KWD'} disabled><option value="KWD">KWD</option></select></div>
                                <div><label className="form-label">رقم الإرجاع</label><input type="text" value={editableReturn.returnNumber || '000001'} className="form-input" disabled /></div>
                                <div><label className="form-label">تاريخ الإرجاع</label><input type="date" value={editableReturn.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-body">
                            <div className="table-wrapper detailed-items-table">
                                <table style={{ minWidth: '1000px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{width: '20%'}}>البند</th>
                                            <th style={{width: '25%'}}>الوصف</th>
                                            <th>سعر الوحدة</th>
                                            <th>الكمية</th>
                                            <th>الخصم</th>
                                            <th>الضريبة 1</th>
                                            <th>المجموع</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(editableReturn.items || []).map((item, index) => (
                                            <tr key={index}>
                                                <td><select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="form-select"><option value="">اختر...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></td>
                                                <td><textarea value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} className="form-input" /></td>
                                                <td><input type="number" step="0.001" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="form-input" /></td>
                                                <td><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" /></td>
                                                <td><input type="number" value={item.discountPercent || ''} onChange={e => handleItemChange(index, 'discountPercent', e.target.value)} className="form-input" /></td>
                                                <td><select className="form-select" value={item.taxId || ''} onChange={e => handleItemChange(index, 'taxId', e.target.value)}><option value="">%</option></select></td>
                                                <td className="total-cell">{item.total.toFixed(3)}</td>
                                                <td><button type="button" onClick={() => handleRemoveItem(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><TrashIcon style={{ width: '20px', height: '20px' }} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <button type="button" onClick={handleAddItem} className="btn btn-ghost"><PlusIcon style={{ width: '20px', height: '20px' }} /> إضافة بند</button>
                                <div style={{ minWidth: '300px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}><span>المجموع</span><span>{totalAmount.toFixed(3)} د.ك</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid var(--surface-border)', marginTop: '0.5rem' }}><span>الإجمالي</span><span>{totalAmount.toFixed(3)} د.ك</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="form-section">
                        <div className="form-section-header">الملاحظات/الشروط</div>
                        <div className="form-section-body">
                             <RichTextToolbar />
                             <textarea value={editableReturn.notes || ''} onChange={e => handleFieldChange('notes', e.target.value)} className="form-input rich-text-editor-textarea" rows={4}></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseReturnModal;
