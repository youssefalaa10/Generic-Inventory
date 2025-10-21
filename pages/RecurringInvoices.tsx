import React from 'react';
import { PlusIcon } from '../components/Icon';
import { Customer, RecurringInvoice } from '../types';

interface RecurringInvoicesProps {
    invoices: RecurringInvoice[];
    customers: Customer[];
}

const RecurringInvoices: React.FC<RecurringInvoicesProps> = ({ invoices, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';
    
    const getStatusChipClass = (status: RecurringInvoice['status']) => {
        switch (status) {
            case 'Active': return 'status-chip status-chip-active';
            case 'Paused': return 'status-chip status-chip-paused';
            case 'Ended': return 'status-chip status-chip-ended';
            default: return 'status-chip status-chip-active';
        }
    };

    const getStatusText = (status: RecurringInvoice['status']) => {
        switch (status) {
            case 'Active': return 'نشط';
            case 'Paused': return 'متوقف';
            case 'Ended': return 'منتهي';
            default: return status;
        }
    };

    return (
        <div className="glass-pane sales-page-container">
            <div className="sales-page-header">
                <h3 className="sales-page-title">الفواتير الدورية</h3>
                <div className="sales-page-actions">
                    <button className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إنشاء فاتورة دورية
                    </button>
                </div>
            </div>
            <div className="sales-table-wrapper">
                <table className="sales-table">
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
                                <td className="amount-positive">{inv.totalAmount.toLocaleString()} د.ك</td>
                                <td>{new Date(inv.nextInvoiceDate).toLocaleDateString('ar-EG')}</td>
                                <td>
                                    <span className={getStatusChipClass(inv.status)}>
                                        {getStatusText(inv.status)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.length === 0 && <p className="sales-empty-state">لا توجد فواتير دورية حالياً.</p>}
            </div>
        </div>
    );
};

export default RecurringInvoices;
