import React, { useState, useMemo } from 'react';
import { Customer, Sale, Branch, SaleItem, WhatsappLog } from '../types';
import { ShoppingCartIcon, ChatIcon } from '../components/Icon';
import StatCard from '../components/StatCard';

interface CustomerDetailPageProps {
    customer: Customer;
    sales: Sale[];
    branches: Branch[];
    whatsappLogs: WhatsappLog[];
    onBack: () => void;
}

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customer, sales, branches, whatsappLogs, onBack }) => {
    const [activeTab, setActiveTab] = useState('purchases');
    const [viewingSale, setViewingSale] = useState<Sale | null>(null);

    const customerSales = useMemo(() => {
        return sales
            .filter(s => s.customerId === customer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [customer.id, sales]);

    const customerWhatsappLogs = useMemo(() => {
        return whatsappLogs
            .filter(log => log.customerId === customer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [customer.id, whatsappLogs]);

    const totalSpent = useMemo(() => customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0), [customerSales]);

    const getSaleSource = (sale: Sale) => {
        if (sale.source === 'Website') {
            return 'الموقع الإلكتروني';
        }
        return branches.find(b => b.id === sale.branchId)?.name || 'فرع غير معروف';
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-pane" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={onBack} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>&larr;</button>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{customer.name}</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>{customer.phone} &bull; {customer.email}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <StatCard title="إجمالي المبالغ المنفقة" value={`${totalSpent.toLocaleString('ar-EG', {minimumFractionDigits: 2})} د.ك`} icon={ShoppingCartIcon} iconBg="linear-gradient(135deg, #10b981, #34d399)" />
                    <StatCard title="إجمالي عدد الطلبات" value={customerSales.length.toString()} icon={ShoppingCartIcon} iconBg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
                    <StatCard title="إجمالي رسائل الواتساب" value={customerWhatsappLogs.length.toString()} icon={ChatIcon} iconBg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
                </div>

                <div className="tab-buttons-container glass-pane" style={{ borderRadius: '16px 16px 0 0', padding: '0' }}>
                    <button className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>سجل المشتريات</button>
                    <button className={`tab-button ${activeTab === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveTab('whatsapp')}>سجل التواصل</button>
                </div>
                
                <div className="panel-content glass-pane" style={{ flex: 1, marginTop: '-1.5rem', borderRadius: '0 0 16px 16px' }}>
                    {activeTab === 'purchases' ? (
                        <PurchaseHistoryTab sales={customerSales} getSaleSource={getSaleSource} onViewSale={setViewingSale} />
                    ) : (
                        <CommunicationLogTab logs={customerWhatsappLogs} />
                    )}
                </div>
            </div>

            {viewingSale && (
                <SaleItemsModal sale={viewingSale} onClose={() => setViewingSale(null)} />
            )}
        </>
    );
};

const PurchaseHistoryTab: React.FC<{sales: Sale[], getSaleSource: (s: Sale) => string, onViewSale: (s: Sale) => void}> = ({ sales, getSaleSource, onViewSale }) => (
    <div className="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>التاريخ</th>
                    <th>المصدر</th>
                    <th>الحالة</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                {sales.map(sale => (
                    <tr key={sale.id} onClick={() => onViewSale(sale)} style={{cursor: 'pointer'}}>
                        <td>{sale.invoiceNumber}</td>
                        <td>{new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                        <td>{getSaleSource(sale)}</td>
                        <td><span style={{padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'var(--secondary-color)', color: 'white', fontSize: '0.8rem'}}>{sale.paymentStatus}</span></td>
                        <td style={{fontWeight: 600}}>{sale.totalAmount.toLocaleString('ar-EG', {minimumFractionDigits: 2})} د.ك</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {sales.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد مشتريات لهذا العميل.</p>}
    </div>
);

const CommunicationLogTab: React.FC<{logs: WhatsappLog[]}> = ({ logs }) => {
    const getStatusChip = (status: WhatsappLog['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Sent': { bg: '#8a94a2', text: '#fff' },
            'Delivered': { bg: '#3b82f6', text: '#fff' },
            'Read': { bg: '#10b981', text: '#fff' },
        }
        const currentStyle = styles[status];
        const statusText = status === 'Sent' ? 'تم الإرسال' : status === 'Delivered' ? 'تم التوصيل' : 'مقروءة';
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{statusText}</span>
    };

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th style={{width: '60%'}}>الرسالة</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{new Date(log.date).toLocaleString('ar-EG')}</td>
                            <td>{log.message}</td>
                            <td>{getStatusChip(log.status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
             {logs.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا يوجد سجل تواصل لهذا العميل.</p>}
        </div>
    )
};

const SaleItemsModal: React.FC<{sale: Sale, onClose: () => void}> = ({ sale, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '40rem'}}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>تفاصيل الفاتورة #{sale.invoiceNumber}</h2>
                </div>
                <div className="modal-body">
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                            <tbody>
                                {sale.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unitPrice.toFixed(2)}</td>
                                        <td>{item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer" style={{justifyContent: 'flex-end'}}>
                    <button className="btn btn-primary" onClick={onClose}>إغلاق</button>
                </div>
            </div>
        </div>
    )
};

export default CustomerDetailPage;
