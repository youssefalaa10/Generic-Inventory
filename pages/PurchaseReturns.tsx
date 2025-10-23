import React, { useState } from 'react';
import { PurchaseReturn, Supplier, Product } from '../types';
import { PlusIcon } from '../components/Icon';
import PurchaseReturnModal from '../components/PurchaseReturnModal';


interface PurchaseReturnsProps {
    returns: PurchaseReturn[];
    suppliers: Supplier[];
    products: Product[];
    onSave: (pr: PurchaseReturn) => void;
}

const PurchaseReturns: React.FC<PurchaseReturnsProps> = ({ returns, suppliers, products, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<Partial<PurchaseReturn> | null>(null);

    const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'N/A';
    
    const getStatusChip = (status: PurchaseReturn['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Draft': { bg: 'var(--surface-bg)', text: 'var(--text-secondary)' },
            'Returned': { bg: '#3b82f6', text: '#fff' },
        }
        const currentStyle = styles[status] || styles['Draft'];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>
    };

    const handleAddNew = () => {
        setSelectedReturn({});
        setIsModalOpen(true);
    };

    const handleEdit = (pr: PurchaseReturn) => {
        setSelectedReturn(pr);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>مرتجعات المشتريات</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        مرتجع جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم المرتجع</th>
                                <th>التاريخ</th>
                                <th>المورد</th>
                                <th>الفاتورة الأصلية</th>
                                <th>المبلغ المسترجع</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map(ret => (
                                <tr key={ret.id} onClick={() => handleEdit(ret)} style={{ cursor: 'pointer' }}>
                                    <td>#{ret.id}</td>
                                    <td>{new Date(ret.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{getSupplierName(ret.supplierId)}</td>
                                    <td>#{ret.purchaseInvoiceId}</td>
                                    <td style={{fontWeight: 600, color: '#ef4444'}}>{ret.totalReturnedAmount.toLocaleString()} د.ك</td>
                                    <td>{getStatusChip(ret.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {returns.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد مرتجعات مشتريات حالياً.</p>}
                </div>
            </div>
            {isModalOpen && (
                <PurchaseReturnModal 
                    purchaseReturn={selectedReturn}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    suppliers={suppliers}
                    products={products}
                />
            )}
        </>
    );
};

export default PurchaseReturns;
