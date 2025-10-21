import React from 'react';
import { PlusIcon } from '../components/Icon';
import { CreditNote, Customer } from '../types';

interface CreditNotesProps {
    notes: CreditNote[];
    customers: Customer[];
}

const CreditNotes: React.FC<CreditNotesProps> = ({ notes, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';

    const getStatusChipClass = (status: CreditNote['status']) => {
        switch (status) {
            case 'Open': return 'status-chip status-chip-open';
            case 'Applied': return 'status-chip status-chip-applied';
            case 'Void': return 'status-chip status-chip-void';
            default: return 'status-chip status-chip-open';
        }
    };

    const getStatusText = (status: CreditNote['status']) => {
        switch (status) {
            case 'Open': return 'مفتوح';
            case 'Applied': return 'مطبق';
            case 'Void': return 'ملغي';
            default: return status;
        }
    };

    return (
        <div className="glass-pane sales-page-container">
            <div className="sales-page-header">
                <h3 className="sales-page-title">الإشعارات الدائنة</h3>
                <div className="sales-page-actions">
                    <button className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إشعار دائن جديد
                    </button>
                </div>
            </div>
            <div className="sales-table-wrapper">
                <table className="sales-table">
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
                                <td className="amount-secondary">{note.amount.toLocaleString()} د.ك</td>
                                <td>
                                    <span className={getStatusChipClass(note.status)}>
                                        {getStatusText(note.status)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {notes.length === 0 && <p className="sales-empty-state">لا توجد إشعارات دائنة حالياً.</p>}
            </div>
        </div>
    );
};

export default CreditNotes;
