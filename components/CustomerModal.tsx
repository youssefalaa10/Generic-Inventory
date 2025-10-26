import React, { useCallback, useEffect, useState } from 'react';
import { useAppSelector, selectAll } from '../src/store';
import { Branch, Customer, User } from '../types';
import { useToasts } from './Toast';

interface CustomerModalProps {
    customer: Customer | null;
    onClose: () => void;
    onSave: (customer: Customer) => Promise<void>;
    branches: Branch[];
    existingCustomers?: Customer[]; // For duplicate checking
    currentUser?: User | null; // Current logged-in user
}

interface ValidationErrors {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface FieldState {
    value: string;
    isValid: boolean;
    isTouched: boolean;
    error?: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave, branches, existingCustomers = [], currentUser }) => {
    const { addToast } = useToasts();
    const isCreating = !customer || (customer.id === undefined && customer._id === undefined);
    const [editableCustomer, setEditableCustomer] = useState<Partial<Customer>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});

    const projects = useAppSelector(s => selectAll(s as any, 'projects'));

    useEffect(() => {
        const initialCustomer = isCreating ? { 
            name: '', 
            email: '', 
            phone: '', 
            address: '', 
            balance: 0,
            projectId: 2, // Default to Arabiva
            addedBy: currentUser?.name || 'System', // Use current user's name
        } : {
            name: customer?.name || '',
            email: customer?.email || '',
            phone: customer?.phone || '',
            address: customer?.address || '',
            balance: customer?.balance || 0,
            projectId: customer?.projectId || 2,
            branchId: customer?.branchId,
            addedBy: customer?.addedBy || currentUser?.name || 'System',
            id: customer?.id || customer?._id, // Handle both id and _id
        };
        
        console.log('CustomerModal - customer.addedBy:', customer?.addedBy);
        console.log('CustomerModal - currentUser.name:', currentUser?.name);
        console.log('CustomerModal - initialCustomer.addedBy:', initialCustomer.addedBy);
        
        setEditableCustomer(initialCustomer);
        
        // Clear errors when initializing
        setErrors({});
    }, [customer, isCreating, currentUser]);

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
        // Enhanced phone validation for Kuwait numbers
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // Remove leading zeros and normalize
        const normalizedPhone = cleanPhone.replace(/^0+/, '');
        
        // Kuwait mobile numbers: 2, 5, 6, 9 followed by 7 digits
        // Kuwait landline: 1, 2, 3, 4, 5, 6, 7, 8, 9 followed by 6 digits
        const mobileRegex = /^(\+965|965)?[2569]\d{7}$/;
        const landlineRegex = /^(\+965|965)?[1-9]\d{6}$/;
        
        if (!mobileRegex.test(normalizedPhone) && !landlineRegex.test(normalizedPhone)) {
            return 'رقم الهاتف غير صحيح (يجب أن يكون رقم كويتي صحيح)';
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

    // Smart validation with debouncing
    const validateField = useCallback((field: string, value: string): FieldState => {
        let error: string | undefined;
        let isValid = true;

        switch (field) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
            case 'address':
                error = validateAddress(value);
                break;
        }

        if (error) {
            isValid = false;
        }

        return {
            value,
            isValid,
            isTouched: true,
            error
        };
    }, []);

    // Debounced validation
    const debouncedValidate = useCallback((() => {
        let timeoutId: NodeJS.Timeout;
        return (field: string, value: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const fieldState = validateField(field, value);
                setFieldStates(prev => ({ ...prev, [field]: fieldState }));
            }, 300);
        };
    })(), [validateField]);

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
        
        // Real-time validation with debouncing
        if (typeof value === 'string') {
            debouncedValidate(field, value);
        }
        
        // Immediate validation for non-string fields
        const newErrors = validateCustomer(newCustomer);
        setErrors(prev => {
            const updated = { ...prev };
            const fieldError = newErrors[field as keyof ValidationErrors];
            if (fieldError) {
                updated[field] = fieldError;
            } else {
                delete updated[field];
            }
            return updated;
        });
    };

    const handleSave = async () => {
        const validationErrors = validateCustomer(editableCustomer);
        
        // Filter out undefined errors
        const actualErrors = Object.fromEntries(
            Object.entries(validationErrors).filter(([_, value]) => value !== undefined)
        );
        setErrors(actualErrors);
        
        if (Object.keys(actualErrors).length > 0) {
            addToast('يرجى إصلاح الأخطاء قبل الحفظ', 'error');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onSave(editableCustomer as Customer);
        } catch (error: any) {
            console.error('Save customer error:', error);
            addToast(error.message || 'خطأ في حفظ العميل', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const actualErrors = Object.values(errors).filter(e => e !== undefined);
    
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
                            className={`form-input ${errors.name ? 'input-error' : fieldStates.name?.isValid ? 'input-success' : ''}`}
                            placeholder="أدخل اسم العميل"
                            required
                        />
                        {errors.name && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.name}
                            </div>
                        )}
                        {fieldStates.name?.isValid && !errors.name && (
                            <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                ✓ اسم صحيح
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
                            className={`form-input ${errors.phone ? 'input-error' : fieldStates.phone?.isValid ? 'input-success' : ''}`}
                            placeholder=" 965xxxxxxxx :مثال"
                            required
                        />
                        {errors.phone && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.phone}
                            </div>
                        )}
                        {fieldStates.phone?.isValid && !errors.phone && (
                            <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                ✓ رقم هاتف صحيح
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
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                            {branches.filter(b => b.projectId === editableCustomer.projectId).map((b, index) => <option key={b.id || `branch-${index}`} value={b.id}>{b.name}</option>)}
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
                            value={(() => {
                                const displayValue = isCreating ? (currentUser?.name || 'سيتم تسجيله تلقائياً') : (editableCustomer.addedBy || 'غير محدد');
                                console.log('CustomerModal - display value for أضيف بواسطة:', displayValue);
                                console.log('CustomerModal - isCreating:', isCreating);
                                console.log('CustomerModal - editableCustomer.addedBy:', editableCustomer.addedBy);
                                return displayValue;
                            })()}
                            className="form-input"
                            disabled
                        />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>إلغاء</button>
                    <button 
                        onClick={handleSave} 
                        className="btn btn-secondary"
                        disabled={isSubmitting || Object.values(errors).some(error => error !== undefined)}
                        title={`Errors: ${Object.values(errors).filter(e => e !== undefined).length}, Submitting: ${isSubmitting}`}
                    >
                        {isSubmitting ? 'جاري الحفظ...' : (isCreating ? 'حفظ العميل' : 'حفظ التعديلات')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;