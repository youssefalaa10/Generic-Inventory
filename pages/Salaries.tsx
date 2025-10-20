import React, { useState } from 'react';
import { EmployeeData, SalaryPayment, JournalEntry } from '../types';

interface SalariesProps {
    employees: EmployeeData[];
    payments: SalaryPayment[];
    onRunPayroll: (year: number, month: number) => void;
}

const Salaries: React.FC<SalariesProps> = ({ employees, payments, onRunPayroll }) => {
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    });
    const [selectedPayslip, setSelectedPayslip] = useState<SalaryPayment | null>(null);

    const handleRunPayroll = () => {
        onRunPayroll(selectedDate.year, selectedDate.month);
    };

    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'Unknown';
    
    const formatCurrency = (amount: number) => `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك`;

    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>مسير الرواتب</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                         <input 
                            type="month" 
                            defaultValue={`${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`}
                            onChange={e => {
                                const [year, month] = e.target.value.split('-').map(Number);
                                setSelectedDate({ year, month });
                            }}
                            className="form-input"
                        />
                        <button onClick={handleRunPayroll} className="btn btn-secondary">
                            بدء مسير الرواتب
                        </button>
                    </div>
                </div>
                
                {payments.length > 0 ? (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>الموظف</th>
                                <th>الراتب الإجمالي</th>
                                <th>الخصومات</th>
                                <th>الراتب الصافي</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{getEmployeeName(p.employeeId)}</td>
                                    <td>{formatCurrency(p.grossSalary)}</td>
                                    <td style={{color: '#ef4444'}}>{formatCurrency(p.deductions.total)}</td>
                                    <td style={{fontWeight: 'bold', color: 'var(--secondary-color)'}}>{formatCurrency(p.netSalary)}</td>
                                    <td>
                                        <button onClick={() => setSelectedPayslip(p)} className="btn btn-ghost" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>
                                            عرض الكشف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                    <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                        <p>لم يتم بدء مسير الرواتب لهذا الشهر بعد.</p>
                        <p>اختر الشهر والسنة ثم اضغط على "بدء مسير الرواتب".</p>
                    </div>
                )}
            </div>
            
             {payments.length > 0 && <JournalEntriesView entries={payments.flatMap(p => p.journalEntries)} />}
        </div>
        
        {selectedPayslip && <PayslipModal payment={selectedPayslip} employee={employees.find(e => e.id === selectedPayslip.employeeId)!} onClose={() => setSelectedPayslip(null)} />}
        </>
    );
};

const JournalEntriesView: React.FC<{entries: JournalEntry[]}> = ({ entries }) => {
    // Aggregate entries
    const aggregated = entries.reduce((acc: { [key: string]: { debit: number; credit: number; } }, entry) => {
        if (!acc[entry.account]) {
            acc[entry.account] = { debit: 0, credit: 0 };
        }
        acc[entry.account].debit += entry.debit;
        acc[entry.account].credit += entry.credit;
        return acc;
    }, {});

    return (
        <div className="glass-pane" style={{padding: '1.5rem'}}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>قيد اليومية المحاسبي (محاكاة)</h3>
            <div className="table-wrapper">
                 <table>
                    <thead><tr><th>الحساب</th><th style={{textAlign: 'center'}}>مدين</th><th style={{textAlign: 'center'}}>دائن</th></tr></thead>
                    <tbody>
                        {Object.entries(aggregated).map(([account, value]) => {
                            // FIX: Destructure with a type assertion to resolve type error on value from Object.entries.
                            const {debit, credit} = value as { debit: number; credit: number };
                            return (
                            <tr key={account}>
                                <td>{account}</td>
                                <td style={{textAlign: 'center'}}>{debit > 0 ? `${debit.toFixed(2)} د.ك` : '-'}</td>
                                <td style={{textAlign: 'center'}}>{credit > 0 ? `${credit.toFixed(2)} د.ك` : '-'}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                 </table>
            </div>
        </div>
    )
}

const PayslipModal: React.FC<{payment: SalaryPayment, employee: EmployeeData, onClose: () => void}> = ({payment, employee, onClose}) => (
     <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '45rem'}}>
             <div className="modal-header">
                <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>كشف راتب - {employee.name} ({payment.month}/{payment.year})</h2>
             </div>
             <div className="modal-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                <div className="glass-pane" style={{padding: '1rem'}}>
                    <h4 style={{color: 'var(--secondary-color)', marginBottom: '0.75rem'}}>الأرباح</h4>
                    <Row label="الراتب الأساسي" value={payment.basicSalary} />
                    <Row label="البدلات" value={payment.allowances} />
                    <hr style={{border: 'none', borderTop: '1px solid var(--surface-border)', margin: '0.5rem 0'}} />
                    <Row label="إجمالي الراتب" value={payment.grossSalary} isTotal />
                </div>
                 <div className="glass-pane" style={{padding: '1rem'}}>
                    <h4 style={{color: '#ef4444', marginBottom: '0.75rem'}}>الخصومات</h4>
                    <Row label="خصم السلف" value={payment.deductions.advances} />
                    <Row label="خصم التأخير" value={payment.deductions.lateness} />
                    <Row label="خصم الغياب" value={payment.deductions.absence} />
                    <Row label="إجازة غير مدفوعة" value={payment.deductions.unpaidLeave} />
                    <hr style={{border: 'none', borderTop: '1px solid var(--surface-border)', margin: '0.5rem 0'}} />
                    <Row label="إجمالي الخصومات" value={payment.deductions.total} isTotal />
                </div>
                <div className="glass-pane" style={{gridColumn: 'span 2', padding: '1.5rem', textAlign: 'center'}}>
                    <p style={{color: 'var(--text-secondary)', fontSize: '1.25rem'}}>صافي الراتب المستحق</p>
                    <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                        {payment.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك
                    </p>
                </div>
             </div>
             <div className="modal-footer" style={{justifyContent: 'flex-end'}}>
                <button onClick={onClose} className="btn btn-primary">إغلاق</button>
             </div>
        </div>
    </div>
);

const Row = ({label, value, isTotal}: {label: string, value: number, isTotal?: boolean}) => (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontWeight: isTotal ? 'bold' : 'normal', fontSize: isTotal ? '1.1rem': '1rem'}}>
        <span>{label}</span>
        <span>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك</span>
    </div>
)


export default Salaries;