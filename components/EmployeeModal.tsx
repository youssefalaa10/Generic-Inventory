import React, { useState, useEffect } from 'react';
import { EmployeeData, Branch, EmployeeAttachment, EmployeeAttachmentType } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, EyeIcon } from './Icon';

interface EmployeeModalProps {
    employee: EmployeeData | null;
    onClose: () => void;
    onSave: (employee: EmployeeData) => void;
    branches: Branch[];
}

const attachmentTypes: EmployeeAttachmentType[] = ['Passport', 'ID', 'CV', 'Other'];

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose, onSave, branches }) => {
    const isCreating = !employee?.id;
    const [editableEmployee, setEditableEmployee] = useState<Partial<EmployeeData>>(
        isCreating ? { name: '', position: '', branchId: 1, salary: 0, allowances: 0, advances: 0, hireDate: new Date().toISOString().split('T')[0], annualLeaveDays: 30, attachments: [] } : employee
    );
    const [isAddingAttachment, setIsAddingAttachment] = useState(false);
    const [newAttachment, setNewAttachment] = useState<{ type: EmployeeAttachmentType, file: File | null, name: string }>({ type: 'Other', file: null, name: '' });


    useEffect(() => {
        setEditableEmployee(isCreating ? { name: '', position: '', branchId: 1, salary: 0, allowances: 0, advances: 0, hireDate: new Date().toISOString().split('T')[0], annualLeaveDays: 30, attachments: [] } : employee);
    }, [employee, isCreating]);

    const handleChange = (field: keyof EmployeeData, value: string | number) => {
        setEditableEmployee(prev => ({ ...prev, [field as keyof EmployeeData]: value }));
    };
    
    const handleAddAttachment = () => {
        if (!newAttachment.file || !newAttachment.name) {
            alert('Please provide a name and select a file.');
            return;
        }
        const newAttachmentObject: EmployeeAttachment = {
            id: Date.now(),
            name: newAttachment.name,
            type: newAttachment.type,
            file: newAttachment.file,
            uploadDate: new Date().toISOString(),
        };
        setEditableEmployee(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachmentObject]}));
        setNewAttachment({ type: 'Other', file: null, name: '' });
        setIsAddingAttachment(false);
    };

    const handleRemoveAttachment = (id: number) => {
        setEditableEmployee(prev => ({ ...prev, attachments: (prev.attachments || []).filter(att => att.id !== id) }));
    };

    const handleSave = () => {
        if (editableEmployee.name && editableEmployee.position && editableEmployee.hireDate) {
            onSave(editableEmployee as EmployeeData);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '45rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">اسم الموظف</label>
                            <input type="text" value={editableEmployee.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="form-input" />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">المنصب</label>
                            <input type="text" value={editableEmployee.position || ''} onChange={(e) => handleChange('position', e.target.value)} className="form-input" />
                        </div>
                         <div>
                            <label className="form-label">الفرع</label>
                             <select value={editableEmployee.branchId || ''} onChange={(e) => handleChange('branchId', parseInt(e.target.value))} className="form-select">
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="form-label">تاريخ التعيين</label>
                            <input type="date" value={editableEmployee.hireDate || ''} onChange={(e) => handleChange('hireDate', e.target.value)} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">الراتب الأساسي</label>
                            <input type="number" value={editableEmployee.salary || ''} onChange={(e) => handleChange('salary', parseFloat(e.target.value))} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">البدلات</label>
                            <input type="number" value={editableEmployee.allowances || ''} onChange={(e) => handleChange('allowances', parseFloat(e.target.value))} className="form-input" />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">السلف (المبلغ الإجمالي المستحق)</label>
                            <input type="number" value={editableEmployee.advances || ''} onChange={(e) => handleChange('advances', parseFloat(e.target.value))} className="form-input" />
                        </div>
                    </div>
                     <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>المرفقات</h4>
                        <div className="table-wrapper">
                            <table>
                                <tbody>
                                {(editableEmployee.attachments || []).map(att => (
                                    <tr key={att.id}>
                                        <td>{att.name}</td>
                                        <td>{att.type}</td>
                                        <td>{new Date(att.uploadDate).toLocaleDateString()}</td>
                                        <td>
                                            <button type="button" onClick={() => window.open(URL.createObjectURL(att.file), '_blank')} style={{color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><EyeIcon style={{width:'20px', height:'20px'}}/></button>
                                            <button type="button" onClick={() => handleRemoveAttachment(att.id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width:'20px', height:'20px'}}/></button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {isAddingAttachment && (
                             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 0.5fr', gap: '0.5rem', marginTop: '1rem', alignItems: 'center'}}>
                                <input type="text" placeholder="اسم الوثيقة" value={newAttachment.name} onChange={e => setNewAttachment(p => ({...p, name: e.target.value}))} className="form-input" />
                                <select value={newAttachment.type} onChange={e => setNewAttachment(p => ({...p, type: e.target.value as EmployeeAttachmentType}))} className="form-select">
                                    {attachmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <input type="file" onChange={e => setNewAttachment(p => ({...p, file: e.target.files ? e.target.files[0] : null}))} className="form-input"/>
                                <button type="button" onClick={handleAddAttachment} className="btn btn-secondary" style={{padding: '0.5rem'}}>+</button>
                            </div>
                        )}
                        <button type="button" onClick={() => setIsAddingAttachment(!isAddingAttachment)} className="btn btn-ghost" style={{marginTop: '1rem'}}>
                            {isAddingAttachment ? 'إلغاء' : 'إضافة مرفق جديد'}
                        </button>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button type="button" onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'حفظ الموظف' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeModal;