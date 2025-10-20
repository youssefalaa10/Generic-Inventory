
import React, { useState } from 'react';
import { User, Branch } from '../types';
import { useToasts } from '../components/Toast';
import { PencilIcon, PlusIcon, EyeIcon } from '../components/Icon';
import UserModal from '../components/UserModal';
import PermissionsViewModal from '../components/PermissionsViewModal';

interface UsersPageProps {
    users: User[];
    branches: Branch[];
    onSave: (user: User) => void;
    onViewPermissions: (user: User) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, branches, onSave, onViewPermissions }) => {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);

    const handleSave = (user: User) => {
        onSave(user);
        setIsModalOpen(false);
        setSelectedUser(null);
        addToast(`تم ${user.id ? 'تحديث' : 'إنشاء'} المستخدم بنجاح!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedUser({});
        setIsModalOpen(true);
    };
    
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const getBranchName = (branchId?: number) => {
        if (!branchId) return 'N/A';
        return branches.find(b => b.id === branchId)?.name || 'غير معروف';
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة المستخدمين</h3>
                    <button onClick={handleAddNew} className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إضافة مستخدم جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>الدور</th>
                                <th>الفرع</th>
                                <th>الصلاحيات</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.role}</td>
                                    <td>{getBranchName(user.branchId)}</td>
                                    <td>
                                        <button onClick={() => onViewPermissions(user)} className="btn btn-ghost" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>
                                            <EyeIcon style={{width: '16px', height: '16px', marginLeft: '0.25rem'}} />
                                            عرض
                                        </button>
                                    </td>
                                    <td>
                                        <button onClick={() => handleEdit(user)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="تعديل المستخدم">
                                            <PencilIcon style={{width:'20px', height:'20px'}}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                    onSave={handleSave}
                    branches={branches}
                />
            )}
        </>
    );
};

export default UsersPage;
