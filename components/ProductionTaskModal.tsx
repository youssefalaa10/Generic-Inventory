import React, { useState, useEffect, useContext } from 'react';
import { ProductionTask, ManufacturingOrder, EmployeeData, ProductionTaskStatus, Comment } from '../types';
import { AuthContext } from '../App';

interface ProductionTaskModalProps {
    task: Partial<ProductionTask> | null;
    orders: ManufacturingOrder[];
    employees: EmployeeData[];
    onClose: () => void;
    onSave: (task: ProductionTask) => void;
}

const statusOptions: { value: ProductionTaskStatus, label: string }[] = [
    { value: 'To Do', label: 'قيد التنفيذ' },
    { value: 'In Progress', label: 'جاري العمل' },
    { value: 'Completed', label: 'مكتمل' },
];

const ProductionTaskModal: React.FC<ProductionTaskModalProps> = ({ task, orders, employees, onClose, onSave }) => {
    const { user } = useContext(AuthContext);
    const isCreating = !task?.id;
    const [editableTask, setEditableTask] = useState<Partial<ProductionTask>>(
        isCreating
        ? {
            name: '',
            status: 'To Do',
            notes: '',
            comments: [],
        }
        : task
    );
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        setEditableTask(isCreating ? { name: '', status: 'To Do', notes: '', comments: [] } : task);
    }, [task, isCreating]);

    const handleChange = (field: keyof ProductionTask, value: string | number | undefined) => {
        setEditableTask(prev => ({ ...prev, [field]: value }));
    };
    
    const handleAddComment = () => {
        if (!newComment.trim() || !user) return;
        const comment: Comment = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            text: newComment.trim(),
        };
        setEditableTask(prev => ({
            ...prev,
            comments: [...(prev?.comments || []), comment],
        }));
        setNewComment('');
    };

    const handleSave = () => {
        if (editableTask.name && editableTask.productionOrderId) {
            onSave(editableTask as ProductionTask);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '45rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'مهمة تصنيع جديدة' : 'تعديل مهمة التصنيع'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="form-label">اسم المهمة</label>
                        <input type="text" value={editableTask.name || ''} onChange={e => handleChange('name', e.target.value)} className="form-input" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">أمر التصنيع</label>
                            <select value={editableTask.productionOrderId || ''} onChange={e => handleChange('productionOrderId', e.target.value)} className="form-select">
                                <option value="">اختر أمر...</option>
                                {orders.map(o => <option key={o.id} value={o.id}>Order #{o.id}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="form-label">الحالة</label>
                            <select value={editableTask.status || ''} onChange={e => handleChange('status', e.target.value)} className="form-select">
                                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">مسندة إلى (اختياري)</label>
                            <select value={editableTask.assignedToEmployeeId || ''} onChange={e => handleChange('assignedToEmployeeId', e.target.value ? parseInt(e.target.value) : undefined)} className="form-select">
                                <option value="">غير مسندة</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">الموعد النهائي (اختياري)</label>
                            <input type="date" value={editableTask.deadline || ''} onChange={e => handleChange('deadline', e.target.value)} className="form-input" />
                        </div>
                    </div>
                     <div>
                        <label className="form-label">ملاحظات</label>
                        <textarea value={editableTask.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="form-input" rows={3}></textarea>
                    </div>
                     {/* Comments Section */}
                    <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>التعليقات</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', padding: '0.5rem' }}>
                            {(editableTask.comments || []).length > 0 ? (
                                editableTask.comments?.map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--highlight-hover)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', flexShrink: 0
                                        }}>
                                            {c.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 600 }}>{c.userName}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(c.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <p style={{ background: 'var(--surface-bg)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginTop: '0.25rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                {c.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>لا توجد تعليقات.</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <textarea 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                className="form-input"
                                placeholder="أضف تعليق..."
                                rows={2}
                            />
                            <button type="button" onClick={handleAddComment} className="btn btn-secondary" disabled={!newComment.trim()}>
                                إضافة
                            </button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">{isCreating ? 'إنشاء المهمة' : 'حفظ التعديلات'}</button>
                </div>
            </div>
        </div>
    );
};

export default ProductionTaskModal;