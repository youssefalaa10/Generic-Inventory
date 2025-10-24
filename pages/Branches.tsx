import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Branch } from '../types';
import { useToasts } from '../components/Toast';
import { PencilIcon } from '../components/Icon';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '../src/store/slices/branchSlice';

interface BranchesProps {
    branches?: Branch[];
    onSave?: (branch: Partial<Branch>) => void;
}

const Branches: React.FC<BranchesProps> = ({ branches, onSave }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const dispatch = useAppDispatch();
    const { branches: reduxItems, loading, error } = useAppSelector(s => s.branches);
    
    const [newBranch, setNewBranch] = useState<Partial<Branch>>({ name: '', project: '', code: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Branch>>({ name: '', project: '', code: '' });

    useEffect(() => {
        dispatch(fetchBranches({ page: 1, limit: 50 }));
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            addToast(error, 'error');
        }
    }, [error]);

    const hasPermission = (permission: 'create' | 'update' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`branches:${permission}`);
    };

    

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة الفروع</h3>
                </div>
                {hasPermission('create') && (
                    <div className="glass-pane" style={{ padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div>
                                <label className="form-label">المعرف</label>
                                <input className="form-input" placeholder="مثل: BR-001" value={newBranch.code || ''} onChange={e => setNewBranch(v => ({...v, code: e.target.value}))} />
                            </div>
                            <div>
                                <label className="form-label">اسم الفرع</label>
                                <input className="form-input" placeholder="مثل: الفرع الرئيسي" value={newBranch.name || ''} onChange={e => setNewBranch(v => ({...v, name: e.target.value}))} />
                            </div>
                            <div>
                                <label className="form-label">المشروع</label>
                                <input className="form-input" placeholder="مثل: Generic Perfumes" value={newBranch.project || ''} onChange={e => setNewBranch(v => ({...v, project: e.target.value}))} />
                            </div>
                            <div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (!newBranch.name || !newBranch.project) {
                                            addToast('يرجى إدخال اسم الفرع والمشروع', 'error');
                                            return;
                                        }
                                        const payload = { name: newBranch.name!, project: newBranch.project!, code: newBranch.code };
                                        dispatch(createBranch(payload))
                                            .unwrap()
                                            .then(() => {
                                                addToast('تمت إضافة الفرع', 'success');
                                                setNewBranch({ name: '', project: '', code: '' });
                                                dispatch(fetchBranches({ page: 1, limit: 50 }));
                                            })
                                            .catch(() => addToast('فشل إنشاء الفرع', 'error'));
                                    }}
                                >حفظ</button>
                            </div>
                        </div>
                    </div>
                )}
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
                            {(reduxItems ?? []).map((b, index) => {
                                const rowId = String((b as any)?._id ?? (b as any)?.id ?? index);
                                const isEditing = editingId === rowId;
                                return (
                                    <tr key={`${rowId}`}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {isEditing ? (
                                                <input className="form-input" value={editForm.name || ''} onChange={e => setEditForm(v => ({...v, name: e.target.value}))} />
                                            ) : (
                                                b.name
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input className="form-input" value={editForm.project || ''} onChange={e => setEditForm(v => ({...v, project: e.target.value}))} />
                                            ) : (
                                                (b as any)?.project ?? ((b as any)?.projectId === 1 ? 'Generic Perfumes' : 'Arabiva')
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            if (!editForm.name || !editForm.project) {
                                                                addToast('يرجى إدخال اسم الفرع والمشروع', 'error');
                                                                return;
                                                            }
                                                            const payload = { name: editForm.name, project: editForm.project, code: editForm.code ?? (b as any)?.code } as Partial<Branch>;
                                                            const idForApi = (b as any)?._id ?? (b as any)?.id;
                                                            if (idForApi) {
                                                                dispatch(updateBranch({ id: String(idForApi), branchData: payload }))
                                                                    .unwrap()
                                                                    .then(() => {
                                                                        setEditingId(null);
                                                                        addToast('تم تحديث الفرع', 'success');
                                                                        dispatch(fetchBranches({ page: 1, limit: 50 }));
                                                                    })
                                                                    .catch(() => addToast('فشل تحديث الفرع', 'error'));
                                                            } else {
                                                                setEditingId(null);
                                                                addToast('لا يوجد معرف صالح لهذا الفرع', 'error');
                                                            }
                                                        }}
                                                    >حفظ</button>
                                                    <button className="btn btn-ghost" onClick={() => { setEditingId(null); }}>إلغاء</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => {
                                                            setEditingId(rowId);
                                                            setEditForm({ name: b.name, project: (b as any)?.project ?? '', code: (b as any)?.code });
                                                        }}
                                                    >تعديل</button>
                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={() => {
                                                            if (!window.confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;
                                                            const idForApi = (b as any)?._id ?? (b as any)?.id;
                                                            if (idForApi) {
                                                                dispatch(deleteBranch(String(idForApi)))
                                                                    .unwrap()
                                                                    .then(() => {
                                                                        addToast('تم حذف الفرع', 'success');
                                                                        dispatch(fetchBranches({ page: 1, limit: 50 }));
                                                                    })
                                                                    .catch(() => addToast('فشل حذف الفرع', 'error'));
                                                            } else {
                                                                addToast('لا يوجد معرف صالح لهذا الفرع', 'error');
                                                            }
                                                        }}
                                                    >حذف</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Branches;