import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Branch } from '../types';
import { useToasts } from '../components/Toast';
import { PencilIcon } from '../components/Icon';
import BranchModal from '../components/BranchModal';

interface BranchesProps {
    branches: Branch[];
    onSave: (branch: Branch) => void;
}

const Branches: React.FC<BranchesProps> = ({ branches, onSave }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    const hasPermission = (permission: 'create' | 'update' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`branches:${permission}`);
    };

    const handleSave = (branch: Branch) => {
        onSave(branch);
        setIsModalOpen(false);
        setSelectedBranch(null);
        addToast(`Branch ${branch.id ? 'updated' : 'added'} successfully!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedBranch({} as Branch);
        setIsModalOpen(true);
    };

    const handleEdit = (branch: Branch) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة الفروع</h3>
                    {hasPermission('create') && (
                        <button onClick={handleAddNew} className="btn btn-primary">
                            إضافة فرع جديد
                        </button>
                    )}
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>اسم الفرع</th>
                                <th>المشروع</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.map(b => (
                                <tr key={b.id}>
                                    <td>{b.id}</td>
                                    <td>{b.name}</td>
                                    <td>{b.projectId === 1 ? 'Generic Perfumes' : 'Arabiva'}</td>
                                    <td>
                                        <div style={{ display: 'flex' }}>
                                            {hasPermission('update') && <button onClick={() => handleEdit(b)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><PencilIcon style={{width:'20px', height:'20px'}}/></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <BranchModal
                    branch={selectedBranch}
                    onClose={() => { setIsModalOpen(false); setSelectedBranch(null); }}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default Branches;