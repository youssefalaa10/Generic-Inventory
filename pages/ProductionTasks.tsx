import React, { useState } from 'react';
import { ChatIcon, PencilIcon } from '../components/Icon';
import ProductionTaskModal from '../components/ProductionTaskModal';
import { useToasts } from '../components/Toast';
import { EmployeeData, ManufacturingOrder, ProductionTask, ProductionTaskStatus } from '../types';

interface ProductionTasksProps {
    tasks: ProductionTask[];
    orders: ManufacturingOrder[];
    employees: EmployeeData[];
    onSave: (task: ProductionTask) => void;
}

const statusColumns: ProductionTaskStatus[] = ['To Do', 'In Progress', 'Completed'];

const ProductionTasks: React.FC<ProductionTasksProps> = ({ tasks, orders, employees, onSave }) => {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Partial<ProductionTask> | null>(null);

    const handleSave = (task: ProductionTask) => {
        onSave(task);
        setIsModalOpen(false);
        setSelectedTask(null);
        addToast(`Task saved successfully!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedTask({});
        setIsModalOpen(true);
    };

    const handleEdit = (task: ProductionTask) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number) => {
        e.dataTransfer.setData("taskId", taskId.toString());
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProductionTaskStatus) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData("taskId"));
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            onSave({ ...task, status: newStatus });
        }
    };
    
    const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <>
            <div className="production-tasks-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 110px)' }}>
                <div className="glass-pane production-tasks-header" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="production-tasks-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>لوحة مهام التصنيع</h3>
                    <button onClick={handleAddNew} className="btn btn-primary">
                        + مهمة جديدة
                    </button>
                </div>

                <div className="production-tasks-kanban" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', overflowX: 'auto' }}>
                    {statusColumns.map(status => (
                        <div key={status} onDrop={(e) => handleDrop(e, status)} onDragOver={allowDrop}
                             className="glass-pane production-tasks-column" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                            <h4 className="production-tasks-column-title" style={{ padding: '0.5rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--surface-border)', marginBottom: '1rem' }}>
                                {status === 'To Do' ? 'قيد التنفيذ' : status === 'In Progress' ? 'جاري العمل' : 'مكتمل'}
                            </h4>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 0.5rem' }}>
                                {tasks.filter(t => t.status === status).map(task => (
                                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}
                                         className="glass-pane production-task-card" style={{ padding: '1rem', cursor: 'grab', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <p className="production-task-name" style={{ fontWeight: 'bold', flex: 1, paddingLeft: '0.5rem' }}>{task.name}</p>
                                                <button onClick={() => handleEdit(task)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}><PencilIcon style={{width:'18px', height:'18px'}}/></button>
                                            </div>
                                            <p className="production-task-meta" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                                                لأمر التصنيع {task.productionOrderId}
                                            </p>
                                            {task.deadline && (
                                                <p className="production-task-meta" style={{ fontSize: '0.8rem', color: new Date(task.deadline) < new Date() ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600, marginTop: '0.5rem' }}>
                                                    الموعد النهائي: {task.deadline}
                                                </p>
                                            )}
                                        </div>

                                        <div className="production-task-footer" style={{ borderTop: '1px solid var(--surface-border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {task.assignedToEmployeeId ? (
                                                <div className="production-task-assignee" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                    <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--highlight-hover)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                                        {employees.find(e => e.id === task.assignedToEmployeeId)?.name.charAt(0)}
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        {employees.find(e => e.id === task.assignedToEmployeeId)?.name}
                                                    </span>
                                                </div>
                                            ) : <div />}
                                            <div className="production-task-comments" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                                                <ChatIcon style={{ width: '16px', height: '16px' }} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{task.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <ProductionTaskModal
                    task={selectedTask}
                    onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                    onSave={handleSave}
                    orders={orders}
                    employees={employees}
                />
            )}
        </>
    );
};

export default ProductionTasks;