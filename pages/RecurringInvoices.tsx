import React from 'react';
import { RecurringInvoice, Customer } from '../types';
import { PlusIcon } from '../components/Icon';

interface RecurringInvoicesProps {
    invoices: RecurringInvoice[];
    customers: Customer[];
}

const RecurringInvoices: React.FC<RecurringInvoicesProps> = ({ invoices, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';
    
    const getStatusChip = (status: RecurringInvoice['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Active': { bg: '#10b981', text: '#fff' },
            'Paused': { bg: '#f59e0b', text: '#111' },
            'Ended': { bg: '#5a6472', text: '#fff' },
        }
        const currentStyle = styles[status];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>;
    };

    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>الفواتير الدورية</h3>
                <button className="btn btn-primary">
                    <PlusIcon style={{ width: '20px', height: '20px' }} />
                    إنشاء فاتورة دورية
                </button>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>تاريخ البدء</th>
                            <th>التكرار</th>
                            <th>المبلغ</th>
                            <th>تاريخ الفاتورة القادمة</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td>{getCustomerName(inv.customerId)}</td>
                                <td>{new Date(inv.startDate).toLocaleDateString('ar-EG')}</td>
                                <td>{inv.frequency}</td>
                                <td style={{fontWeight: 600}}>{inv.totalAmount.toLocaleString()} د.ك</td>
                                <td>{new Date(inv.nextInvoiceDate).toLocaleDateString('ar-EG')}</td>
                                <td>{getStatusChip(inv.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {invoices.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد فواتير دورية حالياً.</p>}
            </div>
        </div>
    );
};

export default RecurringInvoices;
