
import React, { useState, useEffect, useContext } from 'react';
import { PurchaseRequest, PurchaseRequestItem, Branch, Product } from '../types';
import { AuthContext } from '../App';
import { PlusIcon, TrashIcon, UploadIcon } from './Icon';

interface PurchaseRequestModalProps {
    request: Partial<PurchaseRequest> | null;
    onClose: () => void;
    onSave: (request: PurchaseRequest) => void;
    branches: Branch[];
    products: Product[];
    employees: any[]; // To get user name
}

const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({ request, onClose, onSave, branches, products }) => {
    const { user } = useContext(AuthContext);
    const isCreating = !request?.id;
    const [editableRequest, setEditableRequest] = useState<Partial<PurchaseRequest>>({});

    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setEditableRequest(isCreating ? {
            name: '',
            date: new Date().toISOString().split('T')[0],
            dueDate: tomorrow.toISOString().split('T')[0],
            requestedByUserId: user?.id,
            branchId: user?.branchId || branches[0]?.id,
            status: 'Draft',
            items: [],
            notes: '',
        } : request);
    }, [request, isCreating, user, branches]);

    const handleChange = (field: keyof PurchaseRequest, value: any) => {
        setEditableRequest(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof PurchaseRequestItem, value: any) => {
        const newItems = [...(editableRequest.items || [])];
        if (field === 'productId') newItems[index].productId = Number(value);
        if (field === 'quantity') newItems[index].quantity = Number(value);
        setEditableRequest(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const newItem: PurchaseRequestItem = { productId: 0, quantity: 1 };
        setEditableRequest(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleRemoveItem = (index: number) => {
        setEditableRequest(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };
    
    const handleSaveClick = () => {
        if (!editableRequest.branchId || !editableRequest.items || editableRequest.items.length === 0) {
            alert('Please select a branch and add at least one item.');
            return;
        }
        onSave(editableRequest as PurchaseRequest);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '60rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'طلب شراء جديد' : `تعديل طلب #${request?.id}`}</h2>
                     <div style={{display: 'flex', gap: '1rem'}}>
                        <button onClick={handleSaveClick} className="btn btn-secondary">{isCreating ? 'حفظ' : 'حفظ التعديلات'}</button>
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-section-header">معلومات عامة</div>
                        <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                            <div><label className="form-label required">مسمى</label><input type="text" value={editableRequest.name || ''} onChange={e => handleChange('name', e.target.value)} className="form-input" /></div>
                            <div><label className="form-label required">الكود</label><input type="text" value={editableRequest?.id ? String(editableRequest.id).padStart(6, '0') : '000001'} className="form-input" disabled /></div>
                            <div><label className="form-label">تاريخ الطلب</label><input type="date" value={editableRequest.date} onChange={e => handleChange('date', e.target.value)} className="form-input" /></div>
                            <div><label className="form-label">تاريخ الاستحقاق</label><input type="date" value={editableRequest.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value)} className="form-input" /></div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">بنود طلب الشراء</div>
                        <div className="form-section-body">
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>البند</th><th style={{width:'150px'}}>الكمية</th><th style={{width:'50px'}}></th></tr></thead>
                                    <tbody>
                                        {(editableRequest.items || []).map((item, index) => (
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
                                <textarea value={editableRequest.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} className="form-input" rows={5}></textarea>
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

export default PurchaseRequestModal;
