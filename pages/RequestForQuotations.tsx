
import React, { useState } from 'react';
import { RequestForQuotation, Supplier, Product, PurchaseRequest } from '../types';
import { PlusIcon } from '../components/Icon';
import RequestForQuotationModal from '../components/RequestForQuotationModal';

interface RequestForQuotationsProps {
    rfqs: RequestForQuotation[];
    suppliers: Supplier[];
    products: Product[];
    purchaseRequests: PurchaseRequest[];
    onSave: (rfq: RequestForQuotation) => void;
}

const RequestForQuotations: React.FC<RequestForQuotationsProps> = ({ rfqs, suppliers, products, purchaseRequests, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRfq, setSelectedRfq] = useState<Partial<RequestForQuotation> | null>(null);

    const getStatusChip = (status: RequestForQuotation['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Draft': { bg: 'var(--surface-bg)', text: 'var(--text-secondary)' },
            'Sent': { bg: '#3b82f6', text: '#fff' },
            'Closed': { bg: '#5a6472', text: '#fff' },
        }
        const currentStyle = styles[status] || styles['Draft'];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>
    };

    const handleAddNew = () => {
        setSelectedRfq({});
        setIsModalOpen(true);
    };

    const handleEdit = (rfq: RequestForQuotation) => {
        setSelectedRfq(rfq);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>طلبات عروض الأسعار (RFQ)</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إنشاء طلب جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>التاريخ</th>
                                <th>الموردون</th>
                                <th>الموعد النهائي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rfqs.map(rfq => (
                                <tr key={rfq.id} onClick={() => handleEdit(rfq)} style={{ cursor: 'pointer' }}>
                                    <td>#{rfq.id}</td>
                                    <td>{new Date(rfq.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{rfq.supplierIds.length} موردين</td>
                                    <td>{new Date(rfq.deadline).toLocaleDateString('ar-EG')}</td>
                                    <td>{getStatusChip(rfq.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {rfqs.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد طلبات عروض أسعار حالياً.</p>}
                </div>
            </div>
            {isModalOpen && (
                <RequestForQuotationModal
                    rfq={selectedRfq}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    suppliers={suppliers}
                    products={products}
                    purchaseRequests={purchaseRequests}
                />
            )}
        </>
    );
};

export default RequestForQuotations;
