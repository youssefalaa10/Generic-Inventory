import React, { useEffect, useState } from 'react';
import { PROJECTS } from '../services/mockData';
import { Branch, Customer } from '../types';
import { useToasts } from './Toast';

interface CustomerModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    branches: Branch[];
    existingCustomers?: Customer[]; // For duplicate checking
}

interface ValidationErrors {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave, branches, existingCustomers = [] }) => {
    const { addToast } = useToasts();
    const isCreating = !customer?.id;
    const [editableCustomer, setEditableCustomer] = useState<Partial<Customer>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});

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

    // Validation functions
    const validateName = (name: string): string | undefined => {
        if (!name || name.trim().length === 0) {
            return 'اسم العميل مطلوب';
        }
        if (name.trim().length < 2) {
            return 'اسم العميل يجب أن يكون على الأقل حرفين';
        }
        if (name.trim().length > 100) {
            return 'اسم العميل طويل جداً (الحد الأقصى 100 حرف)';
        }
        return undefined;
    };

    const validateEmail = (email: string): string | undefined => {
        if (!email) return undefined; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'البريد الإلكتروني غير صحيح';
        }
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone || phone.trim().length === 0) {
            return 'رقم الهاتف مطلوب';
        }
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(phone.trim())) {
            return 'رقم الهاتف غير صحيح (يجب أن يكون بين 8-15 رقم)';
        }
        return undefined;
    };

    const validateAddress = (address: string): string | undefined => {
        if (address && address.length > 200) {
            return 'العنوان طويل جداً (الحد الأقصى 200 حرف)';
        }
        return undefined;
    };

    const checkDuplicateCustomer = (name: string, phone: string, email?: string): string | undefined => {
        if (!isCreating) return undefined; // Don't check duplicates when editing
        
        const duplicate = existingCustomers.find(c => 
            c.name.toLowerCase().trim() === name.toLowerCase().trim() ||
            c.phone === phone ||
            (email && c.email === email)
        );
        
        if (duplicate) {
            return 'يوجد عميل بنفس الاسم أو رقم الهاتف أو البريد الإلكتروني';
        }
        return undefined;
    };

    const validateCustomer = (customer: Partial<Customer>): ValidationErrors => {
        const errors: ValidationErrors = {};
        
        const nameError = validateName(customer.name || '');
        if (nameError) errors.name = nameError;
        
        const emailError = validateEmail(customer.email || '');
        if (emailError) errors.email = emailError;
        
        const phoneError = validatePhone(customer.phone || '');
        if (phoneError) errors.phone = phoneError;
        
        const addressError = validateAddress(customer.address || '');
        if (addressError) errors.address = addressError;
        
        const duplicateError = checkDuplicateCustomer(
            customer.name || '', 
            customer.phone || '', 
            customer.email
        );
        if (duplicateError) {
            errors.name = duplicateError;
        }
        
        return errors;
    };

    const handleChange = (field: keyof Customer, value: string | number | undefined) => {
        const newCustomer = { ...editableCustomer, [field as keyof Customer]: value };
        if (field === 'projectId') {
            // Reset branch if project changes
            newCustomer.branchId = undefined;
        }
        setEditableCustomer(newCustomer);
        
        // Real-time validation
        const newErrors = validateCustomer(newCustomer);
        setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof ValidationErrors] }));
    };

    const handleSave = () => {
        const validationErrors = validateCustomer(editableCustomer);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length > 0) {
            addToast('يرجى إصلاح الأخطاء قبل الحفظ', 'error');
            return;
        }
        
        try {
            onSave(editableCustomer as Customer);
            addToast(`تم ${isCreating ? 'إضافة' : 'تحديث'} العميل بنجاح!`, 'success');
        } catch (error) {
            console.error('Save customer error:', error);
            addToast('خطأ في حفظ العميل', 'error');
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
                        <label className="form-label">
                            اسم العميل <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={editableCustomer.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`form-input ${errors.name ? 'input-error' : ''}`}
                            placeholder="أدخل اسم العميل"
                            required
                        />
                        {errors.name && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.name}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="form-label">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={editableCustomer.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`form-input ${errors.email ? 'input-error' : ''}`}
                            placeholder="example@email.com"
                        />
                        {errors.email && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.email}
                            </div>
                        )}
                    </div>
                     <div>
                        <label className="form-label">
                            رقم الهاتف <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="tel"
                            value={editableCustomer.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className={`form-input ${errors.phone ? 'input-error' : ''}`}
                            placeholder="12345678"
                            required
                        />
                        {errors.phone && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.phone}
                            </div>
                        )}
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
                            className={`form-input ${errors.address ? 'input-error' : ''}`}
                            placeholder="أدخل عنوان العميل (اختياري)"
                            rows={2}
                        />
                        {errors.address && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.address}
                            </div>
                        )}
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