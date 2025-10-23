import React from 'react';
import ReactDOM from 'react-dom/client';
import { Sale, Product, IntegrationSettings } from '../types';
import { PrinterIcon, ChatIcon } from './Icon';
import InvoiceTemplate from './InvoiceTemplate';
import StickerTemplate from './StickerTemplate';
import { useToasts } from './Toast';

interface SaleCompleteModalProps {
    sale: Sale;
    onNewSale: () => void;
    products: Product[];
    integrationSettings: IntegrationSettings;
}

const SaleCompleteModal: React.FC<SaleCompleteModalProps> = ({ sale, onNewSale, products, integrationSettings }) => {
    const { addToast } = useToasts();
    
    const handleSendWhatsapp = () => {
        // This is a simulation. In a real app, this would trigger an API call.
        addToast(`تم إرسال الفاتورة إلى ${sale.customerName} عبر واتساب (محاكاة).`, 'success');
    };

    const handlePrint = (content: React.ReactElement) => {
        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (!printWindow) {
            alert('Please allow popups for this website');
            return;
        }

        printWindow.document.write('<html><head><title>Print</title>');
        Array.from(document.styleSheets).forEach(styleSheet => {
            try {
                const cssRules = Array.from(styleSheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
                const styleElement = printWindow.document.createElement('style');
                styleElement.appendChild(printWindow.document.createTextNode(cssRules));
                printWindow.document.head.appendChild(styleElement);
            } catch (e) {
                console.warn('Could not read stylesheet', e);
            }
        });
        printWindow.document.write('</head><body dir="rtl"></body></html>');
        printWindow.document.close();
        
        const printRootEl = printWindow.document.createElement('div');
        printWindow.document.body.appendChild(printRootEl);
        
        const root = ReactDOM.createRoot(printRootEl);
        root.render(
            <React.StrictMode>
                <div id="print-area">
                    {content}
                </div>
            </React.StrictMode>
        );

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '40rem', textAlign: 'center' }}>
                <div className="modal-body">
                     <div style={{
                        width: '80px', height: '80px', margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, var(--secondary-color), #34d399)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '48px', height: '48px', color: 'white' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>تمت العملية بنجاح</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                        تم تسجيل عملية البيع بقيمة {sale.totalAmount.toFixed(2)} د.ك
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button className="btn btn-ghost" onClick={() => handlePrint(<InvoiceTemplate sale={sale} />)}>
                            <PrinterIcon style={{ width: '20px', height: '20px' }} />
                            طباعة الفاتورة
                        </button>
                         <button className="btn btn-ghost" onClick={() => handlePrint(<StickerTemplate sale={sale} products={products} />)}>
                            <PrinterIcon style={{ width: '20px', height: '20px' }} />
                            طباعة الملصقات
                        </button>
                        {integrationSettings.whatsapp.isEnabled && sale.customerId !== 4 && (
                            <button className="btn btn-ghost" onClick={handleSendWhatsapp}>
                                <ChatIcon style={{width: '20px', height: '20px'}} />
                                إرسال عبر واتساب
                            </button>
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={onNewSale} style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}>
                        عملية بيع جديدة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleCompleteModal;
