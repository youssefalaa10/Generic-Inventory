import React from 'react';
import { SalesReturn, Sale, Customer } from '../types';
import { PlusIcon } from '../components/Icon';

interface SalesReturnsProps {
    returns: SalesReturn[];
    sales: Sale[];
    customers: Customer[];
}

const SalesReturns: React.FC<SalesReturnsProps> = ({ returns, sales, customers }) => {

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';
    
    const getStatusChip = (status: SalesReturn['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Draft': { bg: 'var(--surface-bg)', text: 'var(--text-secondary)' },
            'Returned': { bg: '#3b82f6', text: '#fff' },
            'Completed': { bg: '#5a6472', text: '#fff' },
        }
        const currentStyle = styles[status] || styles['Draft'];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>;
    };

    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>الفواتير المرتجعة</h3>
                <button className="btn btn-primary">
                    <PlusIcon style={{ width: '20px', height: '20px' }} />
                    إضافة مرتجع جديد
                </button>
            </div>
            <div className="table-wrapper">
                <table>
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
                                <td style={{fontWeight: 600, color: '#ef4444'}}>{ret.totalReturnedAmount.toLocaleString()} د.ك</td>
                                <td>{getStatusChip(ret.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {returns.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد فواتير مرتجعة حالياً.</p>}
            </div>
        </div>
    );
};

export default SalesReturns;
