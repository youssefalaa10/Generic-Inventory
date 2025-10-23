import React, { useState, useMemo, useEffect } from 'react';
import { Branch, Product, InventoryItem, AdjustmentReason } from '../types';
import { useToasts } from './Toast';

interface InventoryAdjustmentModalProps {
    onClose: () => void;
    onAdjust: (data: { branchId: number; productId: number; newQuantity: number; reason: AdjustmentReason; notes?: string; }) => void;
    branches: Branch[];
    products: Product[];
    inventory: InventoryItem[];
}

const adjustmentReasons: { value: AdjustmentReason, label: string }[] = [
    { value: 'Stock Count Correction', label: 'تصحيح جرد' },
    { value: 'Damaged Goods', label: 'تلف بضاعة' },
    { value: 'Return to Supplier', label: 'مرتجع للمورد' },
    { value: 'Initial Stock', label: 'رصيد افتتاحي' },
    { value: 'Other', label: 'أخرى' },
];

const InventoryAdjustmentModal: React.FC<InventoryAdjustmentModalProps> = ({ onClose, onAdjust, branches, products, inventory }) => {
    const { addToast } = useToasts();
    const [branchId, setBranchId] = useState<number | ''>('');
    const [productId, setProductId] = useState<number | ''>('');
    const [newQuantity, setNewQuantity] = useState<number | ''>('');
    const [reason, setReason] = useState<AdjustmentReason>('Stock Count Correction');
    const [notes, setNotes] = useState('');

    const productsInBranch = useMemo(() => {
        if (!branchId) return [];
        const branchInventory = inventory.filter(i => i.branchId === branchId);
        return products.filter(p => branchInventory.some(i => i.productId === p.id));
    }, [branchId, inventory, products]);
    
    const currentStock = useMemo(() => {
        if (!branchId || !productId) return null;
        const item = inventory.find(i => i.branchId === branchId && i.productId === productId);
        return item ? item.quantity : 0;
    }, [branchId, productId, inventory]);

    useEffect(() => {
        setProductId('');
    }, [branchId]);

    const handleSubmit = () => {
        if (branchId === '' || productId === '' || newQuantity === '' || Number(newQuantity) < 0) {
            addToast('يرجى ملء جميع الحقول المطلوبة بكمية صالحة.', 'error');
            return;
        }
        if (reason === 'Other' && !notes.trim()) {
            addToast('يرجى تقديم ملاحظة عند اختيار سبب "أخرى".', 'error');
            return;
        }
        
        onAdjust({
            branchId: Number(branchId),
            productId: Number(productId),
            newQuantity: Number(newQuantity),
            reason,
            notes,
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '45rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>تعديل رصيد المخزون</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="form-label">الفرع</label>
                        <select value={branchId} onChange={e => setBranchId(Number(e.target.value))} className="form-select">
                            <option value="" disabled>اختر الفرع</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">المنتج</label>
                        <select value={productId} onChange={e => setProductId(Number(e.target.value))} className="form-select" disabled={!branchId}>
                            <option value="" disabled>اختر المنتج</option>
                            {productsInBranch.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {productId && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">الكمية الحالية</label>
                                <input type="number" value={currentStock ?? ''} className="form-input" disabled style={{ opacity: 0.7 }}/>
                            </div>
                            <div>
                                <label className="form-label">الكمية الجديدة</label>
                                <input
                                    type="number"
                                    value={newQuantity}
                                    onChange={e => setNewQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="form-input"
                                    placeholder="0"
                                    min="0"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                     <div>
                        <label className="form-label">سبب التعديل</label>
                        <select value={reason} onChange={e => setReason(e.target.value as AdjustmentReason)} className="form-select">
                            {adjustmentReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    {reason === 'Other' && (
                         <div>
                            <label className="form-label">ملاحظات</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="form-input"
                                rows={2}
                                placeholder="يرجى توضيح سبب التعديل..."
                            />
                        </div>
                    )}

                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSubmit} className="btn btn-warning">تأكيد التعديل</button>
                </div>
            </div>
        </div>
    );
};

export default InventoryAdjustmentModal;