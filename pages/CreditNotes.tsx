import React from 'react';
import { CreditNote, Customer } from '../types';
import { PlusIcon } from '../components/Icon';

interface CreditNotesProps {
    notes: CreditNote[];
    customers: Customer[];
}

const CreditNotes: React.FC<CreditNotesProps> = ({ notes, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';

    const getStatusChip = (status: CreditNote['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Open': { bg: '#3b82f6', text: '#fff' },
            'Applied': { bg: '#10b981', text: '#fff' },
            'Void': { bg: '#5a6472', text: '#fff' },
        }
        const currentStyle = styles[status];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>
    };

    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>الإشعارات الدائنة</h3>
                <button className="btn btn-primary">
                    <PlusIcon style={{ width: '20px', height: '20px' }} />
                    إشعار دائن جديد
                </button>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>رقم الإشعار</th>
                            <th>التاريخ</th>
                            <th>العميل</th>
                            <th>مرتبط بالمرتجع</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.map(note => (
                            <tr key={note.id}>
                                <td>{note.noteNumber}</td>
                                <td>{new Date(note.date).toLocaleDateString('ar-EG')}</td>
                                <td>{getCustomerName(note.customerId)}</td>
                                <td>{note.salesReturnId ? `#SR-${note.salesReturnId}` : 'N/A'}</td>
                                <td style={{fontWeight: 600, color: 'var(--secondary-color)'}}>{note.amount.toLocaleString()} د.ك</td>
                                <td>{getStatusChip(note.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {notes.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد إشعارات دائنة حالياً.</p>}
            </div>
        </div>
    );
};

export default CreditNotes;
