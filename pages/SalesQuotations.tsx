import React, { useState, useMemo } from 'react';
import { SalesQuotation, Customer, Product } from '../types';
import { PlusIcon } from '../components/Icon';
import SalesQuotationModal from '../components/SalesQuotationModal';

interface SalesQuotationsProps {
    quotations: SalesQuotation[];
    onSave: (quotation: SalesQuotation) => void;
    onConvertToInvoice: (quotation: SalesQuotation) => void;
    customers: Customer[];
    products: Product[];
}

const SalesQuotations: React.FC<SalesQuotationsProps> = ({ quotations, onSave, onConvertToInvoice, customers, products }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Partial<SalesQuotation> | null>(null);

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'N/A';
    
    const handleAddNew = () => {
        setSelectedQuote({});
        setIsModalOpen(true);
    };

    const handleEdit = (quote: SalesQuotation) => {
        setSelectedQuote(quote);
        setIsModalOpen(true);
    };

    const getStatusChip = (status: SalesQuotation['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Draft': { bg: 'var(--surface-bg)', text: 'var(--text-secondary)' },
            'Sent': { bg: '#3b82f6', text: '#fff' },
            'Accepted': { bg: '#10b981', text: '#fff' },
            'Rejected': { bg: '#ef4444', text: '#fff' },
            'Expired': { bg: '#5a6472', text: '#fff' },
        };
        const currentStyle = styles[status] || styles['Draft'];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>;
    };
    
    const sortedQuotations = useMemo(() => 
        [...quotations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [quotations]);

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة عروض الأسعار</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        عرض سعر جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم العرض</th>
                                <th>التاريخ</th>
                                <th>العميل</th>
                                <th>تاريخ الانتهاء</th>
                                <th>المبلغ الإجمالي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedQuotations.map(quote => (
                                <tr key={quote.id} onClick={() => handleEdit(quote)} style={{ cursor: 'pointer' }}>
                                    <td>{quote.quoteNumber}</td>
                                    <td>{new Date(quote.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{getCustomerName(quote.customerId)}</td>
                                    <td>{new Date(quote.expiryDate).toLocaleDateString('ar-EG')}</td>
                                    <td style={{fontWeight: 600}}>{quote.totalAmount.toLocaleString()} د.ك</td>
                                    <td>{getStatusChip(quote.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <SalesQuotationModal
                    quotation={selectedQuote}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    onConvertToInvoice={onConvertToInvoice}
                    customers={customers}
                    products={products}
                />
            )}
        </>
    );
};

export default SalesQuotations;
