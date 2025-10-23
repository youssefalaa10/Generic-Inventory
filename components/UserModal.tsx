import React, { useState, useEffect } from 'react';
import { User, Branch, Role, Permission } from '../types';
import { PERMISSIONS, PERMISSION_GROUPS } from '../constants';

interface UserModalProps {
    user: Partial<User> | null;
    onClose: () => void;
    onSave: (user: User) => void;
    branches: Branch[];
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave, branches }) => {
    const isCreating = !user?.id;
    const [editableUser, setEditableUser] = useState<Partial<User>>({});

    useEffect(() => {
        setEditableUser(isCreating ? {
            name: '',
            role: Role.ShopAssistant,
            permissions: PERMISSIONS[Role.ShopAssistant],
        } : user);
    }, [user, isCreating]);
    
    const handleFieldChange = (field: keyof User, value: string | number) => {
        const updatedUser = { ...editableUser, [field]: value };
        
        // When role changes, reset permissions to the default for that role
        if (field === 'role') {
            const newRole = value as Role;
            updatedUser.permissions = PERMISSIONS[newRole];
            
            // If the role is not branch-specific, remove branchId
            if (newRole !== Role.BranchManager && newRole !== Role.ShopAssistant) {
                delete updatedUser.branchId;
            }
        }
        setEditableUser(updatedUser);
    };
    
    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setEditableUser(prev => {
            const currentPermissions = prev.permissions || [];
            if (isChecked) {
                // Add permission if it's not already there
                return { ...prev, permissions: [...new Set([...currentPermissions, permission])] };
            } else {
                // Remove permission
                return { ...prev, permissions: currentPermissions.filter(p => p !== permission) };
            }
        });
    };

    const handleSave = () => {
        // Basic validation
        if (!editableUser.name?.trim()) {
            alert('User name is required.');
            return;
        }
        onSave(editableUser as User);
    };

    const needsBranch = editableUser.role === Role.BranchManager || editableUser.role === Role.ShopAssistant;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '50rem'}}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'إضافة مستخدم جديد' : `تعديل المستخدم: ${user?.name}`}</h2>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label required">اسم المستخدم</label>
                            <input type="text" value={editableUser.name || ''} onChange={e => handleFieldChange('name', e.target.value)} className="form-input"/>
                        </div>
                        <div>
                            <label className="form-label">{isCreating ? 'كلمة المرور' : 'كلمة مرور جديدة (اختياري)'}</label>
                            <input type="password" placeholder={isCreating ? 'مطلوب' : 'اتركه فارغًا لعدم التغيير'} className="form-input"/>
                        </div>
                        <div>
                            <label className="form-label">الدور</label>
                            <select value={editableUser.role} onChange={e => handleFieldChange('role', e.target.value)} className="form-select">
                                {Object.values(Role).map(roleValue => <option key={roleValue} value={roleValue}>{roleValue}</option>)}
                            </select>
                        </div>
                        {needsBranch && (
                            <div>
                                <label className="form-label">الفرع</label>
                                <select value={editableUser.branchId || ''} onChange={e => handleFieldChange('branchId', Number(e.target.value))} className="form-select">
                                    <option value="">اختر فرع...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>الصلاحيات</h3>
                        <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem'}}>يتم تحديد الصلاحيات الافتراضية بناءً على الدور. يمكنك تخصيصها حسب الحاجة.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                                <fieldset key={groupName} style={{ border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem' }}>
                                    <legend style={{ fontWeight: 600, padding: '0 0.5rem', marginRight: '0.5rem' }}>{groupName}</legend>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {permissions.map(p => (
                                            <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={editableUser.permissions?.includes(p.key) || false}
                                                    onChange={e => handlePermissionChange(p.key, e.target.checked)}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span>{p.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'إنشاء مستخدم' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
