import React from 'react';
import { CustomerPayment, Customer } from '../types';
import { PlusIcon } from '../components/Icon';

interface CustomerPaymentsProps {
    payments: CustomerPayment[];
    customers: Customer[];
}

const CustomerPayments: React.FC<CustomerPaymentsProps> = ({ payments, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';

    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>مدفوعات العملاء</h3>
                <button className="btn btn-primary">
                    <PlusIcon style={{ width: '20px', height: '20px' }} />
                    تسجيل دفعة جديدة
                </button>
            </div>
            <div className="table-wrapper">
                <table>
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
                                <td style={{fontWeight: 600, color: 'var(--secondary-color)'}}>{p.amount.toLocaleString()} د.ك</td>
                                <td>{p.paymentMethod}</td>
                                <td>{p.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {payments.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد مدفوعات مسجلة حالياً.</p>}
            </div>
        </div>
    );
};

export default CustomerPayments;
