import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import { EmployeeData, LeaveRequest, LeaveType, RequestStatus, Role } from '../types';

interface LeaveRequestsProps {
    employees: EmployeeData[];
    leaveRequests: LeaveRequest[];
    onSaveRequest: (request: LeaveRequest, newStatus?: RequestStatus) => void;
}

const LeaveRequests: React.FC<LeaveRequestsProps> = ({ employees, leaveRequests, onSaveRequest }) => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('myRequests');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isManager = user?.role === Role.SuperAdmin || user?.role === Role.Accountant;
    
    const calculateLeaveBalance = (employee: EmployeeData) => {
        const hireDate = new Date(employee.hireDate);
        const today = new Date();
        const yearsOfService = (today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        
        let totalEntitlement = 0;
        if (yearsOfService < 1) {
            const monthsOfService = (today.getFullYear() - hireDate.getFullYear()) * 12 + (today.getMonth() - hireDate.getMonth());
            totalEntitlement = Math.floor(monthsOfService * 2.5);
        } else {
            totalEntitlement = employee.annualLeaveDays;
        }

        const usedLeave = leaveRequests
            .filter(r => r.employeeId === employee.id && r.status === 'Approved' && r.leaveType === 'Annual')
            .reduce((sum, r) => sum + r.totalDays, 0);

        return {
            entitlement: totalEntitlement,
            used: usedLeave,
            remaining: totalEntitlement - usedLeave,
        };
    };

    const myRequests = useMemo(() => {
        if (!user) return [];
        // In a real app, user.id would be used. For demo, we assume the employee user is ID 5.
        const currentEmployeeId = user.role === 'Employee' ? 5 : (employees.find(e => e.name.includes(user.name))?.id || user.id)
        return leaveRequests.filter(r => r.employeeId === currentEmployeeId);
    }, [leaveRequests, user, employees]);
    
    const pendingRequests = useMemo(() => {
        return leaveRequests.filter(r => r.status === 'Pending');
    }, [leaveRequests]);

    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'Unknown';

    return (
        <>
            <div className="glass-pane leave-requests-page-container" style={{ padding: '1.5rem' }}>
                <div className="leave-requests-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="leave-requests-page-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة الإجازات</h3>
                    <div className="leave-requests-page-actions">
                        <button className="btn btn-primary leave-requests-button" onClick={() => setIsModalOpen(true)}>تقديم طلب إجازة</button>
                    </div>
                </div>
                
                <div className="leave-requests-tabs" style={{display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '1rem'}}>
                     <TabButton title="طلباتي" isActive={activeTab === 'myRequests'} onClick={() => setActiveTab('myRequests')} />
                     {isManager && <TabButton title={`طلبات معلقة (${pendingRequests.length})`} isActive={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />}
                </div>

                {activeTab === 'myRequests' && <MyRequestsView requests={myRequests} getEmployeeName={getEmployeeName} calculateLeaveBalance={calculateLeaveBalance} user={user} employees={employees} />}
                {activeTab === 'pending' && isManager && <PendingRequestsView requests={pendingRequests} getEmployeeName={getEmployeeName} onSaveRequest={onSaveRequest} />}

            </div>
            {isModalOpen && <LeaveRequestModal onClose={() => setIsModalOpen(false)} onSave={onSaveRequest} user={user} employees={employees} />}
        </>
    );
};

const TabButton: React.FC<{title: string; isActive: boolean; onClick: () => void}> = ({ title, isActive, onClick }) => (
    <button className="leave-requests-tab-button" onClick={onClick} style={{
        padding: '0.75rem 1.5rem', border: 'none', background: 'transparent',
        borderBottom: `3px solid ${isActive ? 'var(--primary-color)' : 'transparent'}`,
        color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
        fontWeight: isActive ? 700 : 500,
        cursor: 'pointer', transition: 'all 0.2s',
        marginBottom: '-1px'
    }}>
        {title}
    </button>
);

const MyRequestsView = ({requests, getEmployeeName, calculateLeaveBalance, user, employees}: any) => {
    // In a real app, user.id would be used. For demo, we assume the employee user is ID 5.
    const currentEmployeeId = user.role === 'Employee' ? 5 : (employees.find((e:any) => e.name.includes(user.name))?.id || user.id)
    const employee = employees.find((e: any) => e.id === currentEmployeeId);
    const balance = employee ? calculateLeaveBalance(employee) : { entitlement: 0, used: 0, remaining: 0 };
    
    return (
        <div>
            <div className="leave-requests-balance-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem'}}>
                <div className="glass-pane leave-requests-balance-card" style={{padding: '1rem', textAlign: 'center'}}><p style={{color: 'var(--text-secondary)'}}>الرصيد السنوي</p><p className="leave-requests-balance-value" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{balance.entitlement} يوم</p></div>
                <div className="glass-pane leave-requests-balance-card" style={{padding: '1rem', textAlign: 'center'}}><p style={{color: 'var(--text-secondary)'}}>المستخدم</p><p className="leave-requests-balance-value" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{balance.used} يوم</p></div>
                <div className="glass-pane leave-requests-balance-card" style={{padding: '1rem', textAlign: 'center'}}><p style={{color: 'var(--text-secondary)'}}>المتبقي</p><p className="leave-requests-balance-value" style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary-color)'}}>{balance.remaining} يوم</p></div>
            </div>
            <RequestTable requests={requests} getEmployeeName={getEmployeeName} />
        </div>
    )
};
const PendingRequestsView = ({requests, getEmployeeName, onSaveRequest}: any) => (
    <RequestTable requests={requests} getEmployeeName={getEmployeeName} isManagerView onSaveRequest={onSaveRequest} />
);

const RequestTable = ({requests, getEmployeeName, isManagerView, onSaveRequest}: any) => {
    const getStatusChip = (status: RequestStatus) => {
        const style = {
            padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
        };
        if (status === 'Approved') return <span className="leave-requests-status-chip" style={{...style, color: '#fff', background: '#10b981'}}>مقبول</span>
        if (status === 'Rejected') return <span className="leave-requests-status-chip" style={{...style, color: '#fff', background: '#ef4444'}}>مرفوض</span>
        return <span className="leave-requests-status-chip" style={{...style, color: '#111', background: '#f59e0b'}}>معلق</span>
    }
    return (
        <div className="table-wrapper leave-requests-table-wrapper">
            <table className="leave-requests-table">
                <thead><tr><th>{isManagerView ? 'الموظف' : 'نوع الإجازة'}</th><th>تاريخ البدء</th><th>تاريخ الانتهاء</th><th>عدد الأيام</th><th>الحالة</th>{isManagerView && <th>الإجراء</th>}</tr></thead>
                <tbody>
                    {requests.map((r: LeaveRequest) => (
                        <tr key={r.id}>
                            <td>{isManagerView ? getEmployeeName(r.employeeId) : r.leaveType}</td>
                            <td>{r.startDate}</td>
                            <td>{r.endDate}</td>
                            <td>{r.totalDays}</td>
                            <td>{getStatusChip(r.status)}</td>
                            {isManagerView && <td>
                                <div className="leave-requests-action-buttons" style={{display: 'flex', gap: '0.5rem'}}>
                                    <button onClick={() => onSaveRequest(r, 'Approved')} className="btn btn-secondary leave-requests-action-button" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>قبول</button>
                                    <button onClick={() => onSaveRequest(r, 'Rejected')} className="btn btn-ghost leave-requests-action-button" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>رفض</button>
                                </div>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

const LeaveRequestModal = ({onClose, onSave, user, employees}: any) => {
    const [request, setRequest] = useState<Partial<LeaveRequest>>({
        leaveType: 'Annual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
    });

    const calculateDays = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (endDate < startDate) return 0;
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Exclude Friday and Saturday
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    };

    const handleChange = (field: keyof LeaveRequest, value: any) => {
        setRequest(prev => {
            const newReq = {...prev, [field]: value};
            if(field === 'startDate' || field === 'endDate') {
                const start = field === 'startDate' ? value : newReq.startDate;
                const end = field === 'endDate' ? value : newReq.endDate;
                if(start && end) {
                    newReq.totalDays = calculateDays(start, end);
                }
            }
            return newReq;
        });
    };
    
    const handleSubmit = () => {
        // Demo user logic
        const currentEmployeeId = user.role === 'Employee' ? 5 : (employees.find((e:any) => e.name.includes(user.name))?.id || user.id)
        onSave({...request, employeeId: currentEmployeeId });
        onClose();
    }

    return (
         <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '40rem'}}>
                <div className="modal-header"><h2 style={{fontSize: '1.5rem', fontWeight: 600}}>تقديم طلب إجازة</h2></div>
                <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                     <select className="form-select" value={request.leaveType} onChange={e => handleChange('leaveType', e.target.value)}>
                        {(['Annual', 'Sick', 'Emergency', 'Unpaid'] as LeaveType[]).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                         <input type="date" className="form-input" value={request.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                         <input type="date" className="form-input" value={request.endDate} onChange={e => handleChange('endDate', e.target.value)} />
                     </div>
                     <textarea className="form-input" placeholder="السبب..." value={request.reason} onChange={e => handleChange('reason', e.target.value)} rows={3}></textarea>
                     <p><strong>مجموع الأيام:</strong> {request.totalDays || 0} (باستثناء عطلة نهاية الأسبوع)</p>
                </div>
                <div className="modal-footer" style={{justifyContent: 'flex-end', gap: '1rem'}}>
                    <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-secondary" onClick={handleSubmit}>إرسال الطلب</button>
                </div>
            </div>
         </div>
    )
};


export default LeaveRequests;
