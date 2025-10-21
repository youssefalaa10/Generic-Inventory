import React, { useMemo, useState } from 'react';
import { AcademicCapIcon, BeakerIcon, CalendarIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon, TruckIcon, UsersIcon } from '../components/Icon';
import StatCard from '../components/StatCard';
import { AdvanceRequest, AttendanceRecord, EmployeeBenefit, EmployeeData, GeneralRequest, GeneralRequestType, LeaveRequest, LeaveType, RequestStatus, SalaryPayment, User } from '../types';

interface EmployeePortalProps {
    user: User;
    employees: EmployeeData[];
    leaveRequests: LeaveRequest[];
    advanceRequests: AdvanceRequest[];
    generalRequests: GeneralRequest[];
    attendance: AttendanceRecord[];
    salaryPayments: SalaryPayment[];
    onSaveLeaveRequest: (request: LeaveRequest, newStatus?: RequestStatus) => void;
    onSaveAdvanceRequest: (request: AdvanceRequest, newStatus?: RequestStatus) => void;
    onSaveGeneralRequest: (request: GeneralRequest, newStatus?: RequestStatus) => void;
}

const benefitIcons: { [key: string]: React.FC<any> } = {
    ShieldCheckIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    TruckIcon,
    SparklesIcon,
    BeakerIcon,
};

const BenefitCard: React.FC<{ benefit: EmployeeBenefit }> = ({ benefit }) => {
    const Icon = benefitIcons[benefit.icon] || UsersIcon; // UsersIcon as a fallback
    return (
        <div className="glass-pane benefit-card">
            <Icon className="benefit-icon" />
            <div className="benefit-content">
                <h4>{benefit.title}</h4>
                <p>{benefit.description}</p>
            </div>
        </div>
    );
};

const LeaveHistoryRow: React.FC<{ request: LeaveRequest }> = ({ request }) => {
    const getStatusChip = (status: RequestStatus) => {
        const style: React.CSSProperties = {
            padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
        };
        if (status === 'Approved') return <span style={{...style, color: '#fff', background: '#10b981'}}>مقبول</span>
        if (status === 'Rejected') return <span style={{...style, color: '#fff', background: '#ef4444'}}>مرفوض</span>
        return <span style={{...style, color: '#111', background: '#f59e0b'}}>معلق</span>
    };

    const leaveTypeTranslations: {[key in LeaveType]: string} = {
        'Annual': 'سنوية',
        'Sick': 'مرضية',
        'Emergency': 'طارئة',
        'Unpaid': 'بدون أجر'
    };

    return (
        <tr>
            <td>{leaveTypeTranslations[request.leaveType] || request.leaveType}</td>
            <td>{new Date(request.startDate).toLocaleDateString('ar-EG')}</td>
            <td>{new Date(request.endDate).toLocaleDateString('ar-EG')}</td>
            <td>{request.totalDays}</td>
            <td style={{fontWeight: 600}}>{getStatusChip(request.status)}</td>
        </tr>
    );
};


const EmployeePortal: React.FC<EmployeePortalProps> = (props) => {
    const { user, employees, leaveRequests, onSaveLeaveRequest, onSaveAdvanceRequest, onSaveGeneralRequest, attendance, advanceRequests, generalRequests, salaryPayments } = props;
    const [modal, setModal] = useState<'leave' | 'advance' | 'general' | null>(null);

    const currentEmployee = useMemo(() => {
        // First try to find by user ID if it matches an employee ID
        let emp = employees.find(e => e.id === user.id);
        // Fallback for demo: find by name match
        if (!emp) {
            emp = employees.find(e => user.name.includes(e.name.split(' ')[0]));
        }
        return emp;
    }, [user, employees]);

    const leaveBalance = useMemo(() => {
        if (!currentEmployee) return { entitlement: 0, used: 0, remaining: 0 };
        const usedLeave = leaveRequests
            .filter(r => r.employeeId === currentEmployee.id && r.status === 'Approved' && r.leaveType === 'Annual')
            .reduce((sum, r) => sum + r.totalDays, 0);
        const entitlement = currentEmployee.annualLeaveDays;
        return { entitlement, used: usedLeave, remaining: entitlement - usedLeave };
    }, [currentEmployee, leaveRequests]);

    const myRequests = useMemo(() => {
        if (!currentEmployee) return [];
        const all: any[] = [
            ...leaveRequests.filter(r => r.employeeId === currentEmployee.id).map(r => ({...r, type: 'Leave'})),
            ...advanceRequests.filter(r => r.employeeId === currentEmployee.id).map(r => ({...r, type: 'Advance'})),
            ...generalRequests.filter(r => r.employeeId === currentEmployee.id).map(r => ({...r, type: 'General'})),
        ];
        return all.sort((a,b) => new Date(b.requestDate || b.startDate).getTime() - new Date(a.requestDate || a.startDate).getTime());
    }, [currentEmployee, leaveRequests, advanceRequests, generalRequests]);
    
    const myLeaveHistory = useMemo(() => {
        if (!currentEmployee) return [];
        return leaveRequests
            .filter(r => r.employeeId === currentEmployee.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [currentEmployee, leaveRequests]);
    
    const recentAttendance = useMemo(() => {
        if (!currentEmployee) return [];
        return attendance
            .filter(a => a.employeeId === currentEmployee.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7);
    }, [currentEmployee, attendance]);

    const latestPayslip = useMemo(() => {
        if (!currentEmployee) return null;
        return salaryPayments
            .filter(p => p.employeeId === currentEmployee.id)
            .sort((a, b) => new Date(`${b.year}-${b.month}-01`).getTime() - new Date(`${a.year}-${a.month}-01`).getTime())[0];
    }, [currentEmployee, salaryPayments]);


    if (!currentEmployee) {
        return <div className="glass-pane" style={{ padding: '2rem', textAlign: 'center' }}>Could not find employee data for the current user.</div>;
    }

    return (
        <>
            <div className="employee-portal-container hr-employee-portal-container">
                <div className="glass-pane employee-welcome-section hr-employee-portal-header">
                    <h2 className="hr-employee-portal-title" style={{ fontSize: '2rem', fontWeight: 700 }}>مرحباً, {currentEmployee.name}</h2>
                    <p className="hr-employee-portal-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{currentEmployee.position}</p>
                </div>
                
                <div className="employee-stats-grid hr-employee-portal-stats">
                    <StatCard title="رصيد الإجازات المتبقي" value={`${leaveBalance.remaining} يوم`} icon={CalendarIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                    <StatCard title="إجمالي السلف" value={`${currentEmployee.advances.toLocaleString()} د.ك`} icon={CurrencyDollarIcon} iconBg="linear-gradient(135deg, #f59e0b, #fbbf24)" />
                    <StatCard title="صافي الراتب الأخير" value={`${(latestPayslip?.netSalary || 0).toLocaleString()} د.ك`} icon={DocumentTextIcon} iconBg="linear-gradient(135deg, #10b981, #34d399)" />
                </div>

                <div className="glass-pane employee-actions-section hr-employee-portal-actions">
                    <button onClick={() => setModal('leave')} className="btn btn-primary hr-employee-portal-button">تقديم طلب إجازة</button>
                    <button onClick={() => setModal('advance')} className="btn btn-secondary hr-employee-portal-button">طلب سلفة</button>
                    <button onClick={() => setModal('general')} className="btn btn-ghost hr-employee-portal-button">طلب عام</button>
                </div>

                <div className="employee-main-grid hr-employee-portal-main-grid">
                     <div className="glass-pane employee-benefits-section hr-employee-portal-benefits">
                        <h3 className="hr-employee-portal-section-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <SparklesIcon style={{width: '24px', height: '24px', color: 'var(--primary-color)'}} />
                            المزايا والفوائد
                        </h3>
                        {currentEmployee.benefits && currentEmployee.benefits.length > 0 ? (
                            <div className="employee-benefits-grid hr-employee-portal-benefits-grid">
                                {currentEmployee.benefits.map((benefit, index) => (
                                    <BenefitCard key={index} benefit={benefit} />
                                ))}
                            </div>
                        ) : (
                            <p className="hr-employee-portal-no-benefits" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>لا توجد مزايا إضافية مسجلة حالياً.</p>
                        )}
                    </div>

                    <SalaryDetails payslip={latestPayslip} />
                     <div className="glass-pane attendance-section hr-employee-portal-attendance">
                        <h3 className="hr-employee-portal-section-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <ClockIcon style={{width: '24px', height: '24px', color: 'var(--primary-color)'}} />
                            سجل الحضور الأخير
                        </h3>
                        <div className="table-wrapper hr-employee-portal-attendance-table-wrapper">
                            <table className="hr-employee-portal-attendance-table">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>الحالة</th>
                                        <th>دقائق التأخير</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAttendance.length > 0 ? (
                                        recentAttendance.map(att => <AttendanceRow key={att.id} record={att} />)
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="hr-employee-portal-no-attendance" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                لا يوجد سجل حضور لعرضه.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     <div className="glass-pane employee-requests-section hr-employee-portal-requests">
                        <MyRequestsView requests={myRequests} />
                    </div>

                    <div className="glass-pane employee-leave-history-section">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CalendarIcon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
                            سجل الإجازات
                        </h3>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>نوع الإجازة</th>
                                        <th>تاريخ البدء</th>
                                        <th>تاريخ الانتهاء</th>
                                        <th>مجموع الأيام</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myLeaveHistory.length > 0 ? (
                                        myLeaveHistory.map(req => <LeaveHistoryRow key={req.id} request={req} />)
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                                لا يوجد سجل إجازات لعرضه.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
            {modal === 'leave' && <LeaveRequestModal onClose={() => setModal(null)} onSave={onSaveLeaveRequest} employee={currentEmployee} />}
            {modal === 'advance' && <AdvanceRequestModal onClose={() => setModal(null)} onSave={onSaveAdvanceRequest} employee={currentEmployee} />}
            {modal === 'general' && <GeneralRequestModal onClose={() => setModal(null)} onSave={onSaveGeneralRequest} employee={currentEmployee} />}
        </>
    );
};

// --- Sub-components & Modals ---

const MyRequestsView = ({ requests }: { requests: any[] }) => {
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('date');

    const filteredAndSortedRequests = useMemo(() => {
        let processed = [...requests];

        // Filter
        if (filter !== 'all') {
            processed = processed.filter(r => r.type === filter);
        }

        // Sort
        processed.sort((a, b) => {
            if (sort === 'status') {
                const statusOrder = { 'Pending': 1, 'Approved': 2, 'Rejected': 3 };
                return (statusOrder[a.status as RequestStatus] || 99) - (statusOrder[b.status as RequestStatus] || 99);
            }
            // Default: by date descending
            const dateA = new Date(a.requestDate || a.startDate).getTime();
            const dateB = new Date(b.requestDate || b.startDate).getTime();
            return dateB - dateA;
        });

        return processed;
    }, [requests, filter, sort]);

    return (
        <div>
            <div className="employee-requests-controls">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>طلباتي الأخيرة</h3>
                <div className="employee-requests-filters">
                    <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">كل الطلبات</option>
                        <option value="Leave">الإجازات</option>
                        <option value="Advance">السلف</option>
                        <option value="General">الطلبات العامة</option>
                    </select>
                    <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="date">الأحدث أولاً</option>
                        <option value="status">حسب الحالة</option>
                    </select>
                </div>
            </div>
            <div className="table-wrapper">
                <table>
                    <tbody>
                        {filteredAndSortedRequests.slice(0, 7).map(req => <RequestRow key={`${req.type}-${req.id}`} request={req} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SalaryDetails: React.FC<{ payslip: SalaryPayment | null | undefined }> = ({ payslip }) => (
    <div className="glass-pane salary-details-section">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DocumentTextIcon style={{width: '24px', height: '24px', color: 'var(--primary-color)'}} />
            تفاصيل الراتب
        </h3>
        {payslip ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.5rem' }}>
                    كشف راتب شهر {payslip.month}/{payslip.year}
                </p>
                <PayslipRow label="الراتب الأساسي" value={payslip.basicSalary} />
                <PayslipRow label="البدلات" value={payslip.allowances} />
                <PayslipRow label="إجمالي الراتب" value={payslip.grossSalary} isTotal />
                <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '0.5rem 0' }} />
                <PayslipRow label="خصم السلف" value={payslip.deductions.advances} isDeduction />
                <PayslipRow label="خصم التأخير" value={payslip.deductions.lateness} isDeduction />
                <PayslipRow label="خصم الغياب" value={payslip.deductions.absence} isDeduction />
                <PayslipRow label="إجازة غير مدفوعة" value={payslip.deductions.unpaidLeave} isDeduction />
                <PayslipRow label="إجمالي الخصومات" value={payslip.deductions.total} isTotal isDeduction />
                <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '0.5rem 0' }} />
                <div className="payslip-net-salary">
                    <span>صافي الراتب</span>
                    <span className="amount">
                        {payslip.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك
                    </span>
                </div>
            </div>
        ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                لا يوجد كشف راتب متاح حالياً.
            </p>
        )}
    </div>
);

const PayslipRow: React.FC<{ label: string, value: number, isTotal?: boolean, isDeduction?: boolean }> = ({ label, value, isTotal, isDeduction }) => (
    <div className={`payslip-row ${isTotal ? 'total' : ''} ${isDeduction ? 'deduction' : ''}`}>
        <span className="label">{label}</span>
        <span>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك</span>
    </div>
);

const AttendanceRow: React.FC<{ record: AttendanceRecord }> = ({ record }) => {
    const statusMap = {
        'Present': { text: 'حاضر', color: 'var(--secondary-color)' },
        'Late': { text: 'متأخر', color: '#f59e0b' },
        'Absent': { text: 'غائب', color: '#ef4444' },
    };
    const statusInfo = statusMap[record.status];

    return (
        <tr>
            <td>
                {new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })}
            </td>
            <td style={{ fontWeight: 600, color: statusInfo.color }}>{statusInfo.text}</td>
            <td>
                {record.status === 'Late' ? `${record.lateMinutes} دقيقة` : '-'}
            </td>
        </tr>
    );
};

const RequestRow: React.FC<{ request: any }> = ({ request }) => {
    const getStatusChip = (status: RequestStatus) => {
        if (status === 'Approved') return <span style={{ color: '#10b981' }}>مقبول</span>
        if (status === 'Rejected') return <span style={{ color: '#ef4444' }}>مرفوض</span>
        return <span style={{ color: '#f59e0b' }}>معلق</span>
    };
    let title = '';
    let date = new Date(request.requestDate || request.startDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });

    if(request.type === 'Leave') title = `طلب إجازة (${request.leaveType})`;
    else if(request.type === 'Advance') title = `طلب سلفة بقيمة ${request.amount} د.ك`;
    else if(request.type === 'General') title = `طلب عام: ${request.type}`;
    else title = request.details ? request.details.substring(0, 30) + '...' : 'طلب عام';

    return (
         <tr>
            <td>{date}</td>
            <td>{title}</td>
            <td style={{fontWeight: 600}}>{getStatusChip(request.status)}</td>
        </tr>
    )
}

const LeaveRequestModal = ({onClose, onSave, employee}: any) => {
    const [request, setRequest] = useState<Partial<LeaveRequest>>({
        leaveType: 'Annual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        totalDays: 1,
    });
    const handleChange = (field: keyof LeaveRequest, value: any) => {
        setRequest(prev => {
            const newReq = {...prev, [field]: value};
            if(field === 'startDate' || field === 'endDate') {
                const start = new Date(field === 'startDate' ? value : newReq.startDate!);
                const end = new Date(field === 'endDate' ? value : newReq.endDate!);
                if(end >= start) {
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    newReq.totalDays = diffDays;
                }
            }
            return newReq;
        });
    };
    const handleSubmit = () => { onSave({...request, employeeId: employee.id }); onClose(); };
    return (
         <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '40rem'}}>
                <div className="modal-header"><h2 style={{fontSize: '1.5rem', fontWeight: 600}}>تقديم طلب إجازة</h2></div>
                <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                     <select className="form-select" value={request.leaveType} onChange={e => handleChange('leaveType', e.target.value)}>
                        {(['Annual', 'Sick', 'Emergency', 'Unpaid'] as LeaveType[]).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center'}}>
                         <input type="date" className="form-input" value={request.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                         <input type="date" className="form-input" value={request.endDate} onChange={e => handleChange('endDate', e.target.value)} />
                         <p><strong>مجموع الأيام:</strong> {request.totalDays || 0}</p>
                     </div>
                     <textarea className="form-input" placeholder="السبب..." value={request.reason} onChange={e => handleChange('reason', e.target.value)} rows={3}></textarea>
                </div>
                <div className="modal-footer" style={{justifyContent: 'flex-end', gap: '1rem'}}>
                    <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-secondary" onClick={handleSubmit}>إرسال الطلب</button>
                </div>
            </div>
         </div>
    )
};

const AdvanceRequestModal = ({onClose, onSave, employee}: any) => {
    const [request, setRequest] = useState<Partial<AdvanceRequest>>({ amount: 0, reason: '' });
    const handleChange = (field: keyof AdvanceRequest, value: any) => setRequest(p => ({...p, [field]: value}));
    const handleSubmit = () => { onSave({ ...request, employeeId: employee.id, requestDate: new Date().toISOString().split('T')[0] }); onClose(); };
     return (
         <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '40rem'}}>
                <div className="modal-header"><h2 style={{fontSize: '1.5rem', fontWeight: 600}}>طلب سلفة</h2></div>
                <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                     <label className="form-label">المبلغ المطلوب (د.ك)</label>
                     <input type="number" className="form-input" value={request.amount} onChange={e => handleChange('amount', parseFloat(e.target.value))} />
                     <label className="form-label">السبب</label>
                     <textarea className="form-input" placeholder="السبب..." value={request.reason} onChange={e => handleChange('reason', e.target.value)} rows={3}></textarea>
                </div>
                <div className="modal-footer" style={{justifyContent: 'flex-end', gap: '1rem'}}>
                    <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-secondary" onClick={handleSubmit}>إرسال الطلب</button>
                </div>
            </div>
         </div>
    )
};

const GeneralRequestModal = ({onClose, onSave, employee}: any) => {
    const [request, setRequest] = useState<Partial<GeneralRequest>>({ type: 'Salary Certificate', details: '' });
    const handleChange = (field: keyof GeneralRequest, value: any) => setRequest(p => ({...p, [field]: value}));
    const handleSubmit = () => { onSave({ ...request, employeeId: employee.id, requestDate: new Date().toISOString().split('T')[0] }); onClose(); };
    const requestTypes: GeneralRequestType[] = ['Salary Certificate', 'Experience Certificate', 'Information Update', 'Other'];
     return (
         <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '40rem'}}>
                <div className="modal-header"><h2 style={{fontSize: '1.5rem', fontWeight: 600}}>تقديم طلب عام</h2></div>
                <div className="modal-body" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <label className="form-label">نوع الطلب</label>
                    <select className="form-select" value={request.type} onChange={e => handleChange('type', e.target.value)}>
                        {requestTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="form-label">التفاصيل</label>
                    <textarea className="form-input" placeholder="الرجاء توضيح تفاصيل الطلب..." value={request.details} onChange={e => handleChange('details', e.target.value)} rows={4}></textarea>
                </div>
                <div className="modal-footer" style={{justifyContent: 'flex-end', gap: '1rem'}}>
                    <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-secondary" onClick={handleSubmit}>إرسال الطلب</button>
                </div>
            </div>
         </div>
    )
};


export default EmployeePortal;