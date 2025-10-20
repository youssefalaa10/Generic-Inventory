import React, { useState, useEffect } from 'react';
import { Customer, Branch } from '../types';
import { PROJECTS } from '../services/mockData';

interface CustomerModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    branches: Branch[];
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave, branches }) => {
    const isCreating = !customer?.id;
    const [editableCustomer, setEditableCustomer] = useState<Partial<Customer>>({});

    useEffect(() => {
        setEditableCustomer(isCreating ? { 
            name: '', 
            email: '', 
            phone: '', 
            address: '', 
            balance: 0,
            projectId: 2, // Default to Arabiva
        } : customer);
    }, [customer, isCreating]);

    const handleChange = (field: keyof Customer, value: string | number | undefined) => {
        const newCustomer = { ...editableCustomer, [field as keyof Customer]: value };
        if (field === 'projectId') {
            // Reset branch if project changes
            newCustomer.branchId = undefined;
        }
        setEditableCustomer(newCustomer);
    };

    const handleSave = () => {
        if (editableCustomer.name && editableCustomer.phone) {
            onSave(editableCustomer as Customer);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '40rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة عميل جديد' : 'تعديل بيانات العميل'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">اسم العميل</label>
                        <input
                            type="text"
                            value={editableCustomer.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={editableCustomer.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="form-input"
                        />
                    </div>
                     <div>
                        <label className="form-label">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={editableCustomer.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">المشروع</label>
                        <select
                            value={editableCustomer.projectId || ''}
                            onChange={(e) => handleChange('projectId', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="form-select"
                        >
                            <option value="">-- بلا مشروع --</option>
                            {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">الفرع</label>
                        <select
                            value={editableCustomer.branchId || ''}
                            onChange={(e) => handleChange('branchId', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="form-select"
                            disabled={!editableCustomer.projectId}
                        >
                            <option value="">-- بلا فرع --</option>
                            {branches.filter(b => b.projectId === editableCustomer.projectId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">العنوان</label>
                        <textarea
                            value={editableCustomer.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="form-input"
                            rows={2}
                        />
                    </div>
                     <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">أضيف بواسطة</label>
                        <input
                            type="text"
                            value={isCreating ? 'سيتم تسجيله تلقائياً' : editableCustomer.addedBy || ''}
                            className="form-input"
                            disabled
                        />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'حفظ العميل' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;