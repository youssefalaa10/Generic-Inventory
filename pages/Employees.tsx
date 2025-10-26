import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import ConfirmationModal from '../components/ConfirmationModal';
import EmployeeModal from '../components/EmployeeModal';
import { PencilIcon, TrashIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { useAppSelector, useAppDispatch, selectAll, slices } from '../src/store';
import { Branch, EmployeeData } from '../types';

interface EmployeesProps {
    // Props removed - now using Redux
}

const Employees: React.FC<EmployeesProps> = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const dispatch = useAppDispatch();
    
    // Get data from Redux store
    const employees = useAppSelector(s => selectAll(s, 'employees')) as EmployeeData[];
    const branches = useAppSelector(s => selectAll(s, 'branchinventories')) as Branch[];
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeData | null>(null);

    const hasPermission = (permission: 'create' | 'update' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`employees:${permission}`);
    };

    const handleSave = (employee: EmployeeData) => {
        const hasId = (employee as any)._id || employee.id;
        const idForApi = String((employee as any)._id || employee.id || '');
        const payload: Partial<EmployeeData> = { ...employee };
        if ((payload as any)._id) delete (payload as any)._id;
        
        if (hasId) {
            dispatch(slices.employees.thunks.updateOne({ id: idForApi, body: payload }))
                .unwrap()
                .then(() => {
                    addToast('تم تحديث بيانات الموظف بنجاح!', 'success');
                    setIsModalOpen(false);
                    setSelectedEmployee(null);
                })
                .catch(() => addToast('فشل تحديث بيانات الموظف', 'error'));
        } else {
            dispatch(slices.employees.thunks.createOne(payload))
                .unwrap()
                .then(() => {
                    addToast('تم إضافة الموظف بنجاح!', 'success');
                    setIsModalOpen(false);
                    setSelectedEmployee(null);
                })
                .catch(() => addToast('فشل إضافة الموظف', 'error'));
        }
    };
    
    const handleDeleteClick = (employee: EmployeeData) => {
        setEmployeeToDelete(employee);
    };

    const confirmDelete = () => {
        if (employeeToDelete) {
            const idForApi = String(employeeToDelete.id);
            dispatch(slices.employees.thunks.removeOne(idForApi))
                .unwrap()
                .then(() => {
                    addToast('تم حذف الموظف بنجاح!', 'success');
                    setEmployeeToDelete(null);
                })
                .catch(() => addToast('فشل حذف الموظف', 'error'));
        }
    };

    const handleAddNew = () => {
        setSelectedEmployee({} as EmployeeData);
        setIsModalOpen(true);
    };
    
    const handleEdit = (employee: EmployeeData) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const filteredEmployees = filterBranch === 'all'
        ? employees
        : employees.filter(e => e.branchId === parseInt(filterBranch));

    return (
        <>
            <div className="glass-pane employees-page-container" style={{ padding: '1.5rem' }}>
                <div className="employees-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="employees-page-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>قائمة الموظفين</h3>
                     <div className="employees-page-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="employees-filter" style={{ width: '250px' }}>
                             <select onChange={(e) => setFilterBranch(e.target.value)} value={filterBranch} className="form-select">
                                <option value="all">كل الفروع</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        {hasPermission('create') && (
                            <button onClick={handleAddNew} className="btn btn-primary employees-button">
                                إضافة موظف جديد
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-wrapper employees-table-wrapper">
                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>المنصب</th>
                                <th>الفرع</th>
                                <th>الراتب</th>
                                <th>تاريخ التعيين</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(e => (
                                <tr key={e.id}>
                                    <td>{e.name}</td>
                                    <td>{e.position}</td>
                                    <td>{branches.find(b => b.id === e.branchId)?.name}</td>
                                    <td className="employees-salary">{e.salary.toLocaleString()} د.ك</td>
                                    <td>{e.hireDate}</td>
                                    <td className="employees-actions">
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {hasPermission('update') && <button onClick={() => handleEdit(e)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><PencilIcon style={{width:'20px', height:'20px'}}/></button>}
                                            {hasPermission('delete') && <button onClick={() => handleDeleteClick(e)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width:'20px', height:'20px'}}/></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <EmployeeModal 
                    employee={selectedEmployee}
                    onClose={() => { setIsModalOpen(false); setSelectedEmployee(null); }}
                    onSave={handleSave}
                    branches={branches}
                />
            )}
            {employeeToDelete && (
                <ConfirmationModal
                    isOpen={!!employeeToDelete}
                    onClose={() => setEmployeeToDelete(null)}
                    onConfirm={confirmDelete}
                    title="تأكيد حذف الموظف"
                    message={`هل أنت متأكد من أنك تريد حذف الموظف "${employeeToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                />
            )}
        </>
    );
};

export default Employees;
