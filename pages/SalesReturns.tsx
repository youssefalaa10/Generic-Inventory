import React from 'react';
import { PlusIcon } from '../components/Icon';
import { Customer, Sale, SalesReturn } from '../types';

interface SalesReturnsProps {
    returns: SalesReturn[];
    sales: Sale[];
    customers: Customer[];
}

const SalesReturns: React.FC<SalesReturnsProps> = ({ returns, sales, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';
    
    const getStatusChipClass = (status: SalesReturn['status']) => {
        switch (status) {
            case 'Draft': return 'status-chip status-chip-draft';
            case 'Returned': return 'status-chip status-chip-returned';
            case 'Completed': return 'status-chip status-chip-completed';
            default: return 'status-chip status-chip-draft';
        }
    };

    const getStatusText = (status: SalesReturn['status']) => {
        switch (status) {
            case 'Draft': return 'مسودة';
            case 'Returned': return 'مرتجع';
            case 'Completed': return 'مكتمل';
            default: return status;
        }
    };

    return (
        <div className="glass-pane sales-page-container">
            <div className="sales-page-header">
                <h3 className="sales-page-title">الفواتير المرتجعة</h3>
                <div className="sales-page-actions">
                    <button className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إضافة مرتجع جديد
                    </button>
                </div>
            </div>
            <div className="sales-table-wrapper">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>رقم المرتجع</th>
                            <th>التاريخ</th>
                            <th>العميل</th>
                            <th>الفاتورة الأصلية</th>
                            <th>المبلغ المسترجع</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.map(ret => (
                            <tr key={ret.id}>
                                <td>{ret.returnNumber}</td>
                                <td>{new Date(ret.date).toLocaleDateString('ar-EG')}</td>
                                <td>{getCustomerName(ret.customerId)}</td>
                                <td>#{sales.find(s => s.id === ret.originalInvoiceId)?.invoiceNumber}</td>
                                <td className="amount-negative">{ret.totalReturnedAmount.toLocaleString()} د.ك</td>
                                <td>
                                    <span className={getStatusChipClass(ret.status)}>
                                        {getStatusText(ret.status)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {returns.length === 0 && <p className="sales-empty-state">لا توجد فواتير مرتجعة حالياً.</p>}
            </div>
        </div>
    );
};

export default SalesReturns;
