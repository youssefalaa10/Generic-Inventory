
import React, { useState } from 'react';
import { PurchaseQuotation, Supplier, RequestForQuotation, Product } from '../types';
import { PlusIcon } from '../components/Icon';
import PurchaseQuotationModal from '../components/PurchaseQuotationModal';

interface PurchaseQuotationsProps {
    quotations: PurchaseQuotation[];
    suppliers: Supplier[];
    rfqs: RequestForQuotation[];
    products: Product[];
    onSave: (quotation: PurchaseQuotation) => void;
}

const PurchaseQuotations: React.FC<PurchaseQuotationsProps> = ({ quotations, suppliers, rfqs, products, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Partial<PurchaseQuotation> | null>(null);

    const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'N/A';
    
    const getStatusChip = (status: PurchaseQuotation['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Received': { bg: '#f59e0b', text: '#111' },
            'Accepted': { bg: '#10b981', text: '#fff' },
            'Rejected': { bg: '#ef4444', text: '#fff' },
        }
        const currentStyle = styles[status];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>
    };
    
    const handleAddNew = () => {
        setSelectedQuotation({});
        setIsModalOpen(true);
    };

    const handleEdit = (quotation: PurchaseQuotation) => {
        setSelectedQuotation(quotation);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>عروض أسعار الموردين</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إضافة عرض سعر
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم العرض</th>
                                <th>مرتبط بـ RFQ</th>
                                <th>المورد</th>
                                <th>التاريخ</th>
                                <th>المبلغ الإجمالي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.map(q => (
                                <tr key={q.id} onClick={() => handleEdit(q)} style={{ cursor: 'pointer' }}>
                                    <td>#{q.id}</td>
                                    <td>#{q.rfqId}</td>
                                    <td>{getSupplierName(q.supplierId)}</td>
                                    <td>{new Date(q.date).toLocaleDateString('ar-EG')}</td>
                                    <td style={{fontWeight: 600}}>{q.totalAmount.toLocaleString()} د.ك</td>
                                    <td>{getStatusChip(q.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {quotations.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد عروض أسعار حالياً.</p>}
                </div>
            </div>
            {isModalOpen && (
                <PurchaseQuotationModal
                    quotation={selectedQuotation}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    suppliers={suppliers}
                    rfqs={rfqs}
                    products={products}
                />
            )}
        </>
    );
};

export default PurchaseQuotations;
