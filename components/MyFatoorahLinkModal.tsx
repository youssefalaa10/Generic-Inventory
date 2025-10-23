import React, { useEffect, useState } from 'react';
import { useToasts } from './Toast';

interface MyFatoorahLinkModalProps {
    totalAmount: number;
    onClose: () => void;
    onConfirm: () => void;
}

const MyFatoorahLinkModal: React.FC<MyFatoorahLinkModalProps> = ({ totalAmount, onClose, onConfirm }) => {
    const { addToast } = useToasts();
    const [paymentLink, setPaymentLink] = useState('');

    useEffect(() => {
        // Simulate generating a unique payment link
        const uniqueId = `km-${Date.now().toString().slice(-6)}`;
        setPaymentLink(`https://demo.myfatoorah.com/payment-gateway/${uniqueId}`);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentLink).then(() => {
            addToast('تم نسخ رابط الدفع!', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            addToast('فشل نسخ الرابط.', 'error');
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '40rem', textAlign: 'center' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>رابط الدفع MyFatoorah</h2>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        شارك هذا الرابط مع العميل لإتمام عملية الدفع.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            readOnly
                            value={paymentLink}
                            className="form-input"
                            style={{ fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}
                        />
                        <button onClick={handleCopy} className="btn btn-ghost">
                            نسخ
                        </button>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: '1rem 0' }}>
                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك
                    </p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={onConfirm} className="btn btn-secondary">
                        تم استلام المبلغ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyFatoorahLinkModal;