import React, { useState, useMemo } from 'react';
import { EmployeeData, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceProps {
    employees: EmployeeData[];
    attendanceRecords: AttendanceRecord[];
    onRecordAttendance: (records: AttendanceRecord[]) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ employees, attendanceRecords, onRecordAttendance }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const dailyRecords = useMemo(() => {
        const recordsForDay: { [employeeId: number]: AttendanceRecord } = {};
        attendanceRecords
            .filter(r => r.date === selectedDate)
            .forEach(r => {
                recordsForDay[r.employeeId] = r;
            });
        return recordsForDay;
    }, [attendanceRecords, selectedDate]);

    const [localRecords, setLocalRecords] = useState<{ [employeeId: number]: Partial<AttendanceRecord> }>({});

    const handleStatusChange = (employeeId: number, status: AttendanceStatus) => {
        setLocalRecords(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                employeeId,
                date: selectedDate,
                status,
                lateMinutes: status !== 'Late' ? 0 : (prev[employeeId]?.lateMinutes || 0)
            }
        }));
    };

    const handleLateMinutesChange = (employeeId: number, minutes: number) => {
        setLocalRecords(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                employeeId,
                date: selectedDate,
                status: 'Late',
                lateMinutes: minutes,
            }
        }));
    };
    
    const handleSaveChanges = () => {
        // Fix: Explicitly type the parameter 'r' to resolve type inference issue.
        const recordsToSave = Object.values(localRecords).filter((r: Partial<AttendanceRecord>) => r.status).map(r => r as AttendanceRecord);
        if (recordsToSave.length > 0) {
            onRecordAttendance(recordsToSave);
            setLocalRecords({});
        }
    };
    
    const getEmployeeRecord = (employeeId: number) => {
        return localRecords[employeeId] || dailyRecords[employeeId];
    };

    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>تسجيل الحضور والانصراف</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                     <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)} 
                        className="form-input"
                        style={{width: '200px'}}
                    />
                    <button onClick={handleSaveChanges} className="btn btn-secondary" disabled={Object.keys(localRecords).length === 0}>
                        حفظ التغييرات
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th style={{width: '40%'}}>الحالة</th>
                            <th style={{width: '150px'}}>دقائق التأخير</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => {
                            const record = getEmployeeRecord(emp.id);
                            const status = record?.status || 'Present';
                            return (
                                <tr key={emp.id}>
                                    <td>{emp.name}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {(['Present', 'Late', 'Absent'] as AttendanceStatus[]).map(s => (
                                                <button 
                                                    key={s} 
                                                    onClick={() => handleStatusChange(emp.id, s)}
                                                    style={{
                                                        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)',
                                                        cursor: 'pointer',
                                                        background: status === s ? 'var(--primary-color)' : 'var(--surface-bg)',
                                                        color: status === s ? 'white' : 'var(--text-primary)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {s === 'Present' ? 'حاضر' : s === 'Late' ? 'متأخر' : 'غائب'}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        {status === 'Late' && (
                                            <input
                                                type="number"
                                                value={record?.lateMinutes || ''}
                                                onChange={(e) => handleLateMinutesChange(emp.id, parseInt(e.target.value) || 0)}
                                                className="form-input"
                                                style={{textAlign: 'center'}}
                                            />
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;