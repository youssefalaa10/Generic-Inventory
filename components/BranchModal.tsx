import React, { useState, useEffect } from 'react';
import { Branch } from '../types';
import { PROJECTS } from '../services/mockData';

interface BranchModalProps {
    branch: Branch | null;
    onClose: () => void;
    onSave: (branch: Branch) => void;
}

const BranchModal: React.FC<BranchModalProps> = ({ branch, onClose, onSave }) => {
    const isCreating = !branch?.id;
    const [editableBranch, setEditableBranch] = useState<Partial<Branch>>(
        isCreating ? { name: '', projectId: 2 } : branch
    );

    useEffect(() => {
        setEditableBranch(isCreating ? { name: '', projectId: 2 } : branch);
    }, [branch, isCreating]);

    const handleChange = (field: keyof Branch, value: string | number) => {
        setEditableBranch(prev => ({ ...prev, [field as keyof Branch]: value }));
    };

    const handleSave = () => {
        if (editableBranch.name && editableBranch.projectId) {
            onSave(editableBranch as Branch);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '40rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة فرع جديد' : 'تعديل الفرع'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="form-label">اسم الفرع</label>
                        <input
                            type="text"
                            value={editableBranch.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">المشروع</label>
                         <select
                            value={editableBranch.projectId || ''}
                            onChange={(e) => handleChange('projectId', parseInt(e.target.value))}
                            className="form-select"
                        >
                            {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'حفظ الفرع' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchModal;