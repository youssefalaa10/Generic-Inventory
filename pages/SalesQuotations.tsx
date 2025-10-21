import React, { useMemo, useState } from 'react';
import { PlusIcon } from '../components/Icon';
import SalesQuotationModal from '../components/SalesQuotationModal';
import { Customer, Product, SalesQuotation } from '../types';

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

    const getStatusChipClass = (status: SalesQuotation['status']) => {
        switch (status) {
            case 'Draft': return 'status-chip status-chip-draft';
            case 'Sent': return 'status-chip status-chip-sent';
            case 'Accepted': return 'status-chip status-chip-accepted';
            case 'Rejected': return 'status-chip status-chip-rejected';
            case 'Expired': return 'status-chip status-chip-expired';
            default: return 'status-chip status-chip-draft';
        }
    };

    const getStatusText = (status: SalesQuotation['status']) => {
        switch (status) {
            case 'Draft': return 'مسودة';
            case 'Sent': return 'مرسل';
            case 'Accepted': return 'مقبول';
            case 'Rejected': return 'مرفوض';
            case 'Expired': return 'منتهي الصلاحية';
            default: return status;
        }
    };
    
    const sortedQuotations = useMemo(() => 
        [...quotations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [quotations]);

    return (
        <>
            <div className="glass-pane sales-page-container">
                <div className="sales-page-header">
                    <h3 className="sales-page-title">إدارة عروض الأسعار</h3>
                    <div className="sales-page-actions">
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            <PlusIcon style={{ width: '20px', height: '20px' }} />
                            عرض سعر جديد
                        </button>
                    </div>
                </div>
                <div className="sales-table-wrapper">
                    <table className="sales-table">
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
                                <tr key={quote.id} onClick={() => handleEdit(quote)}>
                                    <td>{quote.quoteNumber}</td>
                                    <td>{new Date(quote.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{getCustomerName(quote.customerId)}</td>
                                    <td>{new Date(quote.expiryDate).toLocaleDateString('ar-EG')}</td>
                                    <td className="amount-positive">{quote.totalAmount.toLocaleString()} د.ك</td>
                                    <td>
                                        <span className={getStatusChipClass(quote.status)}>
                                            {getStatusText(quote.status)}
                                        </span>
                                    </td>
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
