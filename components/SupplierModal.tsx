import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';

interface SupplierModalProps {
    supplier: Partial<Supplier> | null;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ supplier, onClose, onSave }) => {
    const isCreating = !supplier?.id;
    const [editableSupplier, setEditableSupplier] = useState<Partial<Supplier>>({});

    useEffect(() => {
        setEditableSupplier(isCreating ? { 
            name: '', 
            contactPerson: '',
            email: '', 
            phone: '', 
            address: '', 
            balance: 0,
        } : supplier);
    }, [supplier, isCreating]);

    const handleChange = (field: keyof Supplier, value: string | number) => {
        setEditableSupplier(prev => ({ ...prev, [field as keyof Supplier]: value }));
    };

    const handleSave = () => {
        if (editableSupplier.name && editableSupplier.phone) {
            onSave(editableSupplier as Supplier);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '40rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة مورد جديد' : 'تعديل بيانات المورد'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label required">اسم المورد</label>
                        <input
                            type="text"
                            value={editableSupplier.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">جهة الاتصال</label>
                        <input
                            type="text"
                            value={editableSupplier.contactPerson || ''}
                            onChange={(e) => handleChange('contactPerson', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label required">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={editableSupplier.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={editableSupplier.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">العنوان</label>
                        <textarea
                            value={editableSupplier.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="form-input"
                            rows={2}
                        />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'حفظ المورد' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;