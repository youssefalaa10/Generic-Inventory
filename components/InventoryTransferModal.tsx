import React, { useState, useMemo, useEffect } from 'react';
import { Branch, Product, InventoryItem } from '../types';
import { useToasts } from './Toast';

interface InventoryTransferModalProps {
    onClose: () => void;
    onTransfer: (data: { sourceBranchId: number; destinationBranchId: number; productId: number; quantity: number; }) => void;
    branches: Branch[];
    products: Product[];
    inventory: InventoryItem[];
}

const InventoryTransferModal: React.FC<InventoryTransferModalProps> = ({ onClose, onTransfer, branches, products, inventory }) => {
    const { addToast } = useToasts();
    const [sourceBranchId, setSourceBranchId] = useState<number | ''>('');
    const [destinationBranchId, setDestinationBranchId] = useState<number | ''>('');
    const [productId, setProductId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    
    const availableProductsInSource = useMemo(() => {
        if (!sourceBranchId) return [];
        const sourceInventory = inventory.filter(i => i.branchId === sourceBranchId && i.quantity > 0);
        return products.filter(p => sourceInventory.some(i => i.productId === p.id));
    }, [sourceBranchId, inventory, products]);

    const availableStock = useMemo(() => {
        if (!sourceBranchId || !productId) return 0;
        const item = inventory.find(i => i.branchId === sourceBranchId && i.productId === productId);
        return item ? item.quantity : 0;
    }, [sourceBranchId, productId, inventory]);

    // Reset product selection if source branch changes
    useEffect(() => {
        setProductId('');
    }, [sourceBranchId]);
    
    const handleSubmit = () => {
        if (!sourceBranchId || !destinationBranchId || !productId || !quantity || Number(quantity) <= 0) {
            addToast('يرجى ملء جميع الحقول بكمية صالحة.', 'error');
            return;
        }
        if (sourceBranchId === destinationBranchId) {
            addToast('لا يمكن أن يكون فرع المصدر هو نفس فرع الوجهة.', 'error');
            return;
        }
        if (Number(quantity) > availableStock) {
            addToast('الكمية المطلوبة تتجاوز المخزون المتاح.', 'error');
            return;
        }
        
        onTransfer({
            sourceBranchId: Number(sourceBranchId),
            destinationBranchId: Number(destinationBranchId),
            productId: Number(productId),
            quantity: Number(quantity)
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '45rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>تحويل مخزون بين الفروع</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">من فرع (المصدر)</label>
                            <select value={sourceBranchId} onChange={e => setSourceBranchId(Number(e.target.value))} className="form-select">
                                <option value="" disabled>اختر فرع المصدر</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">إلى فرع (الوجهة)</label>
                            <select value={destinationBranchId} onChange={e => setDestinationBranchId(Number(e.target.value))} className="form-select" disabled={!sourceBranchId}>
                                <option value="" disabled>اختر فرع الوجهة</option>
                                {branches.filter(b => b.id !== sourceBranchId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">المنتج</label>
                        <select value={productId} onChange={e => setProductId(Number(e.target.value))} className="form-select" disabled={!sourceBranchId}>
                            <option value="" disabled>اختر منتج</option>
                            {availableProductsInSource.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="form-label">الكمية</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                            className="form-input"
                            placeholder="0"
                            min="1"
                            max={availableStock}
                            disabled={!productId}
                        />
                         {productId && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>المخزون المتاح في المصدر: {availableStock}</p>}
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSubmit} className="btn btn-secondary">تأكيد التحويل</button>
                </div>
            </div>
        </div>
    );
};

export default InventoryTransferModal;