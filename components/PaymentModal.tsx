import React, { useState } from 'react';
import { PaymentMethod, IntegrationSettings } from '../types';
import { CashIcon, CreditCardIcon, QrCodeIcon } from './Icon';

interface PaymentModalProps {
    totalAmount: number;
    onClose: () => void;
    onConfirm: (paymentMethod: PaymentMethod) => void;
    integrationSettings: IntegrationSettings;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ totalAmount, onClose, onConfirm, integrationSettings }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('K-Net');

    const paymentOptions: { name: string, value: PaymentMethod, icon: React.FC<any> }[] = [
        { name: 'نقداً', value: 'Cash', icon: CashIcon },
        { name: 'كي نت', value: 'K-Net', icon: CreditCardIcon },
        { name: 'فيزا/ماستركارد', value: 'Card', icon: CreditCardIcon },
        { name: 'رابط دفع', value: 'Credit', icon: CreditCardIcon },
    ];
    
    if (integrationSettings.myFatoorah.isEnabled) {
        paymentOptions.push({ name: 'MyFatoorah QR', value: 'MyFatoorah', icon: QrCodeIcon });
    }

    const handleConfirm = () => {
        onConfirm(selectedMethod);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '45rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>إتمام عملية الدفع</h2>
                </div>
                <div className="modal-body">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>المبلغ المطلوب</p>
                        <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: '0.5rem 0' }}>
                            {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        {paymentOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedMethod(opt.value)}
                                className="glass-pane"
                                style={{
                                    padding: '1.5rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid',
                                    borderColor: selectedMethod === opt.value ? 'var(--primary-color)' : 'var(--surface-border)',
                                    background: selectedMethod === opt.value ? 'var(--highlight-hover)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <opt.icon style={{ width: '32px', height: '32px', color: 'var(--text-primary)' }} />
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleConfirm} className="btn btn-secondary" style={{ minWidth: '200px' }}>
                        تأكيد الدفع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
