import React from 'react';
import { PlusIcon } from '../components/Icon';
import { Customer, CustomerPayment } from '../types';

interface CustomerPaymentsProps {
    payments: CustomerPayment[];
    customers: Customer[];
}

const CustomerPayments: React.FC<CustomerPaymentsProps> = ({ payments, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';

    return (
        <div className="glass-pane sales-page-container">
            <div className="sales-page-header">
                <h3 className="sales-page-title">مدفوعات العملاء</h3>
                <div className="sales-page-actions">
                    <button className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        تسجيل دفعة جديدة
                    </button>
                </div>
            </div>
            <div className="sales-table-wrapper">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>رقم الدفعة</th>
                            <th>التاريخ</th>
                            <th>العميل</th>
                            <th>المبلغ المدفوع</th>
                            <th>طريقة الدفع</th>
                            <th>ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{p.paymentNumber}</td>
                                <td>{new Date(p.date).toLocaleDateString('ar-EG')}</td>
                                <td>{getCustomerName(p.customerId)}</td>
                                <td className="amount-secondary">{p.amount.toLocaleString()} د.ك</td>
                                <td>{p.paymentMethod}</td>
                                <td>{p.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && <p className="sales-empty-state">لا توجد مدفوعات مسجلة حالياً.</p>}
            </div>
        </div>
    );
};

export default CustomerPayments;
