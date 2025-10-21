
import React, { useState } from 'react';
import { PurchaseOrder, Supplier, Product, PurchaseQuotation } from '../types';
import { PlusIcon } from '../components/Icon';
import PurchaseOrderModal from '../components/PurchaseOrderModal';

interface PurchaseOrdersProps {
    orders: PurchaseOrder[];
    suppliers: Supplier[];
    products: Product[];
    purchaseQuotations: PurchaseQuotation[];
    onSave: (order: PurchaseOrder) => void;
}

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({ orders, suppliers, products, purchaseQuotations, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Partial<PurchaseOrder> | null>(null);

    const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'N/A';
    
    const getStatusChip = (status: PurchaseOrder['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Draft': { bg: 'var(--surface-bg)', text: 'var(--text-secondary)' },
            'Confirmed': { bg: '#3b82f6', text: '#fff' },
            'Billed': { bg: '#10b981', text: '#fff' },
            'Completed': { bg: '#5a6472', text: '#fff' },
            'Cancelled': { bg: '#ef4444', text: '#fff' },
        }
        const currentStyle = styles[status] || styles['Draft'];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>
    };

    const handleAddNew = () => {
        setSelectedOrder({});
        setIsModalOpen(true);
    };

    const handleEdit = (order: PurchaseOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>أوامر الشراء (PO)</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        أمر شراء جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الأمر</th>
                                <th>التاريخ</th>
                                <th>المورد</th>
                                <th>المبلغ الإجمالي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} onClick={() => handleEdit(order)} style={{ cursor: 'pointer' }}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{getSupplierName(order.supplierId)}</td>
                                    <td style={{fontWeight: 600}}>{order.totalAmount.toLocaleString()} د.ك</td>
                                    <td>{getStatusChip(order.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <PurchaseOrderModal
                    order={selectedOrder}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    suppliers={suppliers}
                    purchaseQuotations={purchaseQuotations}
                    products={products}
                />
            )}
        </>
    );
};

export default PurchaseOrders;
