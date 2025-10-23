import React from 'react';
import { ExclamationIcon } from './Icon';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = 'تأكيد الحذف',
    cancelButtonText = 'إلغاء'
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '32rem' }}>
                <div className="modal-body" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', margin: '0 auto 1rem',
                        background: 'var(--highlight-low-stock)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}>
                        <ExclamationIcon style={{ width: '32px', height: '32px', color: '#ef4444' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>{message}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button onClick={onClose} className="btn btn-ghost" style={{ minWidth: '120px' }}>
                            {cancelButtonText}
                        </button>
                        <button onClick={onConfirm} className="btn btn-danger" style={{ minWidth: '120px' }}>
                           {confirmButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;