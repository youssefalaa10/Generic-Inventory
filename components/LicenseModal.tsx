import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { RenewableItem, RenewableCategory } from '../types';
import { useToasts } from './Toast';
import { PrinterIcon, PencilIcon, UploadIcon } from './Icon';

interface LicenseModalProps {
    item: Partial<RenewableItem>;
    onClose: () => void;
    onSave: (item: RenewableItem) => void;
    onPrint: (item: RenewableItem) => void;
    hasPermission: (p: 'create' | 'update' | 'delete') => boolean;
}

const categories: { value: RenewableCategory, label: string }[] = [
    { value: 'License', label: 'رخصة' },
    { value: 'Vehicle', label: 'مركبة' },
    { value: 'Permit', label: 'تصريح' },
    { value: 'Subscription', label: 'اشتراك' },
    { value: 'Other', label: 'أخرى' },
];

const LicenseModal: React.FC<LicenseModalProps> = ({ item, onClose, onSave, onPrint, hasPermission }) => {
    const { addToast } = useToasts();
    const isCreating = !item.id;
    const [editableItem, setEditableItem] = useState<Partial<RenewableItem>>({
        category: 'License',
        name: '',
        identifier: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        ...item,
    });
    const [isEditing, setIsEditing] = useState(isCreating);

    useEffect(() => {
        setEditableItem({
            category: 'License',
            name: '',
            identifier: '',
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            ...item,
        });
        setIsEditing(isCreating || !item.name);
    }, [item, isCreating]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableItem(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEditableItem(prev => ({ ...prev, documentFile: e.target.files?.[0] }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editableItem.name && editableItem.identifier && editableItem.issueDate && editableItem.expiryDate) {
            onSave(editableItem as RenewableItem);
            addToast(`Item ${isCreating ? 'added' : 'updated'} successfully!`, 'success');
        } else {
            addToast('Please fill all required fields.', 'error');
        }
    };

    const renderField = (label: string, value: string | undefined) => (
        <div>
            <p className="form-label" style={{ marginBottom: '0.2rem' }}>{label}</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value || 'غير محدد'}</p>
        </div>
    );

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form className="modal-content glass-pane" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'إضافة عنصر جديد' : (isEditing ? 'تعديل العنصر' : 'تفاصيل العنصر')}</h2>
                     <button type="button" onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
                </div>

                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {isEditing ? (
                        <>
                            <div>
                                <label className="form-label">الفئة</label>
                                <select name="category" value={editableItem.category} onChange={handleInputChange} required className="form-select">
                                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">الاسم (مثال: رخصة تجارية)</label>
                                <input type="text" name="name" placeholder="اسم العنصر" value={editableItem.name} onChange={handleInputChange} required className="form-input" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">المُعرّف (رقم الرخصة، رقم اللوحة، ..)</label>
                                <input type="text" name="identifier" placeholder="المُعرّف" value={editableItem.identifier} onChange={handleInputChange} required className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">تاريخ الإصدار</label>
                                <input type="date" name="issueDate" value={editableItem.issueDate} onChange={handleInputChange} required className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">تاريخ الانتهاء</label>
                                <input type="date" name="expiryDate" value={editableItem.expiryDate} onChange={handleInputChange} required className="form-input" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">رفع مستند</label>
                                 <div style={{ border: '2px dashed var(--input-border)', borderRadius: '10px', padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <UploadIcon style={{ margin: '0 auto 0.5rem', width: '24px', height: '24px' }} />
                                    <label htmlFor="doc-file-upload" style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }}>
                                        <span>اختر ملفًا</span>
                                        <input id="doc-file-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                                    </label>
                                    <span style={{ marginRight: '0.25rem' }}>{editableItem.documentFile ? editableItem.documentFile.name : 'أو اسحبه وأفلته هنا'}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {renderField('الفئة', categories.find(c => c.value === item.category)?.label)}
                            {renderField('الاسم', item.name)}
                            {renderField('المُعرّف', item.identifier)}
                            {renderField('تاريخ الإصدار', item.issueDate)}
                            {renderField('تاريخ الانتهاء', item.expiryDate)}
                             <div style={{ gridColumn: 'span 2' }}>
                                {renderField('المستند المرفق', item.documentFile?.name)}
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <div>
                        {!isCreating && !isEditing && hasPermission('update') && (
                            <button type="button" className="btn btn-warning" onClick={() => setIsEditing(true)}>
                                <PencilIcon style={{width: '20px', height: '20px'}}/> تعديل
                            </button>
                        )}
                        {!isCreating && (
                            <button type="button" className="btn btn-ghost" onClick={() => onPrint(item as RenewableItem)}>
                                <PrinterIcon style={{width: '20px', height: '20px'}}/> طباعة
                            </button>
                        )}
                    </div>
                    {isEditing ? (
                        <div style={{display: 'flex', gap: '1rem'}}>
                           <button type="button" onClick={isCreating ? onClose : () => setIsEditing(false)} className="btn btn-ghost">إلغاء</button>
                           <button type="submit" className="btn btn-secondary">{isCreating ? 'حفظ' : 'حفظ التعديلات'}</button>
                        </div>
                    ) : (
                        <button type="button" onClick={onClose} className="btn btn-primary">إغلاق</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LicenseModal;