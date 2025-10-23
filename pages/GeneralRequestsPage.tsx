import React from 'react';
import { GeneralRequest, EmployeeData, RequestStatus } from '../types';

interface GeneralRequestsPageProps {
    requests: GeneralRequest[];
    employees: EmployeeData[];
    onSaveRequest: (request: GeneralRequest, newStatus?: RequestStatus) => void;
}

const GeneralRequestsPage: React.FC<GeneralRequestsPageProps> = ({ requests, employees, onSaveRequest }) => {
    
    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'Unknown';
    
    const getStatusChip = (status: RequestStatus) => {
        const style: React.CSSProperties = {
            padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
        };
        if (status === 'Approved') return <span style={{...style, color: '#fff', background: '#10b981'}}>مقبول</span>
        if (status === 'Rejected') return <span style={{...style, color: '#fff', background: '#ef4444'}}>مرفوض</span>
        return <span style={{...style, color: '#111', background: '#f59e0b'}}>معلق</span>
    }

    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>الطلبات العامة للموظفين</h3>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th>تاريخ الطلب</th>
                            <th>نوع الطلب</th>
                            <th>التفاصيل</th>
                            <th>الحالة</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r) => (
                            <tr key={r.id}>
                                <td>{getEmployeeName(r.employeeId)}</td>
                                <td>{new Date(r.requestDate).toLocaleDateString()}</td>
                                <td style={{fontWeight: 600}}>{r.type}</td>
                                <td style={{maxWidth: '300px', whiteSpace: 'pre-wrap'}}>{r.details}</td>
                                <td>{getStatusChip(r.status)}</td>
                                <td>
                                    {r.status === 'Pending' && (
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button onClick={() => onSaveRequest(r, 'Approved')} className="btn btn-secondary" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>قبول</button>
                                            <button onClick={() => onSaveRequest(r, 'Rejected')} className="btn btn-ghost" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>رفض</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {requests.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد طلبات عامة حالياً.</p>}
            </div>
        </div>
    );
};

export default GeneralRequestsPage;