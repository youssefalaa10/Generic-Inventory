
import React, { useState, useEffect } from 'react';
import { RequestForQuotation, Supplier, Product, PurchaseRequest, RequestForQuotationItem } from '../types';
import { PlusIcon, TrashIcon, UploadIcon } from './Icon';

interface RequestForQuotationModalProps {
    rfq: Partial<RequestForQuotation> | null;
    onClose: () => void;
    onSave: (rfq: RequestForQuotation) => void;
    suppliers: Supplier[];
    products: Product[];
    purchaseRequests: PurchaseRequest[];
}

const RequestForQuotationModal: React.FC<RequestForQuotationModalProps> = ({ rfq, onClose, onSave, suppliers, products, purchaseRequests }) => {
    const isCreating = !rfq?.id;
    const [editableRfq, setEditableRfq] = useState<Partial<RequestForQuotation>>({});

    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setEditableRfq(isCreating ? {
            date: new Date().toISOString().split('T')[0],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dueDate: tomorrow.toISOString().split('T')[0],
            status: 'Draft',
            supplierIds: [],
            items: [],
            notes: '',
        } : rfq);
    }, [rfq, isCreating]);

    const handleFieldChange = (field: keyof RequestForQuotation, value: any) => {
        setEditableRfq(prev => ({ ...prev, [field]: value }));
    };

    const handleSupplierSelect = (supplierId: number) => {
        setEditableRfq(prev => {
            const currentIds = prev.supplierIds || [];
            if (!currentIds.includes(supplierId)) {
                return { ...prev, supplierIds: [...currentIds, supplierId] };
            }
            return prev;
        });
    };
    
    const handleSupplierRemove = (supplierId: number) => {
         setEditableRfq(prev => ({
            ...prev,
            supplierIds: (prev.supplierIds || []).filter(id => id !== supplierId)
        }));
    };

    const handleItemChange = (index: number, field: keyof RequestForQuotationItem, value: any) => {
        const newItems = [...(editableRfq.items || [])];
        if (field === 'productId') newItems[index].productId = Number(value);
        if (field === 'quantity') newItems[index].quantity = Number(value);
        setEditableRfq(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: RequestForQuotationItem = { productId: 0, quantity: 1 };
        setEditableRfq(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleRemoveItem = (index: number) => {
        setEditableRfq(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    const handleSaveClick = () => {
        if (!editableRfq.deadline || (editableRfq.supplierIds || []).length === 0 || (editableRfq.items || []).length === 0) {
            alert('Please fill all required fields.');
            return;
        }
        onSave(editableRfq as RequestForQuotation);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '60rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'طلب عرض سعر جديد' : `تعديل طلب #${rfq?.id}`}</h2>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button onClick={handleSaveClick} className="btn btn-secondary">{isCreating ? 'حفظ' : 'حفظ التعديلات'}</button>
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-section-header">معلومات عامة</div>
                        <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div><label className="form-label required">الكود</label><input type="text" value={editableRfq?.id ? String(editableRfq.id).padStart(6, '0') : '000001'} className="form-input" disabled /></div>
                            <div><label className="form-label">تاريخ الطلب</label><input type="date" value={editableRfq.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" /></div>
                            <div><label className="form-label">تاريخ الاستحقاق</label><input type="date" value={editableRfq.dueDate || ''} onChange={e => handleFieldChange('dueDate', e.target.value)} className="form-input" /></div>
                            <div style={{gridColumn: 'span 4'}}>
                                <label className="form-label required">الموردين</label>
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <select onChange={e => handleSupplierSelect(Number(e.target.value))} className="form-select">
                                        <option>اختر مورد لإضافته...</option>
                                        {suppliers.filter(s => !(editableRfq.supplierIds || []).includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem'}}>
                                    {(editableRfq.supplierIds || []).map(id => {
                                        const supplier = suppliers.find(s => s.id === id);
                                        return supplier ? (
                                            <div key={id} className="multi-select-chip">
                                                <button type="button" onClick={() => handleSupplierRemove(id)}>&times;</button>
                                                {supplier.name}
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">بنود طلب عرض السعر</div>
                         <div className="form-section-body">
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>البند</th><th style={{width:'150px'}}>الكمية</th><th style={{width:'50px'}}></th></tr></thead>
                                    <tbody>
                                        {(editableRfq.items || []).map((item, index) => (
                                            <tr key={index}>
                                                <td style={{padding: '0.5rem'}}><select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="form-select"><option value="">اختر...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></td>
                                                <td style={{padding: '0.5rem'}}><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" /></td>
                                                <td><button type="button" onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width:'20px',height:'20px'}}/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{marginTop: '1rem', textAlign: 'left'}}><button type="button" onClick={handleAddItem} className="btn btn-ghost"><PlusIcon style={{width:'20px',height:'20px'}}/> إضافة بند</button></div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">خيارات أكثر</div>
                        <div className="form-section-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                           <div>
                                <label className="form-label">الملاحظات</label>
                                <textarea value={editableRfq.notes || ''} onChange={(e) => handleFieldChange('notes', e.target.value)} className="form-input" rows={5}></textarea>
                           </div>
                           <div>
                                <label className="form-label">المرفق</label>
                                <div className="file-upload-area">
                                    <UploadIcon className="icon"/>
                                    <span>أفلت الملف هنا أو <span style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>اختر من جهازك</span></span>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestForQuotationModal;
