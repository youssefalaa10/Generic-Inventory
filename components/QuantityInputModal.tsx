import React, { useState } from 'react';
import { Product } from '../types';

interface QuantityInputModalProps {
    product: Product & { stock: number };
    onClose: () => void;
    onConfirm: (product: Product, quantity: number) => void;
}

const QuantityInputModal: React.FC<QuantityInputModalProps> = ({ product, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState('1.000');

    const handleConfirm = () => {
        const numQuantity = parseFloat(quantity);
        if (!isNaN(numQuantity) && numQuantity > 0) {
            if (numQuantity > product.stock) {
                alert(`الكمية تتجاوز المخزون المتاح: ${product.stock}`);
                return;
            }
            onConfirm(product, numQuantity);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '32rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>إدخال الكمية لـ {product.name}</h2>
                </div>
                <div className="modal-body">
                    <label className="form-label">الكمية بـ ({product.baseUnit})</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        className="form-input"
                        placeholder="0.000"
                        autoFocus
                        step="0.001"
                    />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        المخزون المتاح: {product.stock.toFixed(3)} {product.baseUnit}
                    </p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleConfirm} className="btn btn-secondary">تأكيد</button>
                </div>
            </div>
        </div>
    );
};

export default QuantityInputModal;
