import React, { useState, useEffect, useMemo } from 'react';
import { ProductionOrder_Legacy as ProductionOrder, Branch, Product, InventoryItem } from '../types';
import { useToasts } from './Toast';

interface ProductionOrderModalProps {
    order: ProductionOrder | null;
    onClose: () => void;
    onSave: (order: ProductionOrder) => void;
    branches: Branch[];
    products: Product[];
    inventory: InventoryItem[];
}

const ProductionOrderModal: React.FC<ProductionOrderModalProps> = ({ order, onClose, onSave, branches, products, inventory }) => {
    const isCreating = !order?.id;
    const { addToast } = useToasts();
    const [editableOrder, setEditableOrder] = useState<Partial<ProductionOrder>>(
        isCreating 
        ? {
            branchId: branches[0]?.id || 0,
            quantity: 1,
            status: 'Pending',
            creationDate: new Date().toISOString().split('T')[0]
        }
        : order
    );

    useEffect(() => {
        setEditableOrder(isCreating ? {
            branchId: branches[0]?.id || 0,
            quantity: 1,
            status: 'Pending',
            creationDate: new Date().toISOString().split('T')[0]
        } : order);
    }, [order, isCreating, branches]);

    const handleChange = (field: keyof ProductionOrder, value: string | number) => {
        setEditableOrder(prev => ({ ...prev, [field]: value }));
    };

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === editableOrder.productId);
    }, [editableOrder.productId, products]);

    const requiredMaterials = useMemo(() => {
        if (!selectedProduct || !selectedProduct.components) return [];
        return selectedProduct.components.map(component => {
            const requiredQuantity = component.quantity * (editableOrder.quantity || 1);
            const inventoryItem = inventory.find(i => i.productId === component.productId && i.branchId === editableOrder.branchId);
            const availableStock = inventoryItem ? inventoryItem.quantity : 0;
            const productName = products.find(p => p.id === component.productId)?.name || 'Unknown';
            return {
                ...component,
                productName,
                required: requiredQuantity,
                available: availableStock,
                hasEnough: availableStock >= requiredQuantity,
            };
        });
    }, [selectedProduct, editableOrder.quantity, editableOrder.branchId, inventory, products]);

    const canComplete = useMemo(() => {
        if (isCreating) return false;
        if (order?.status !== 'In Progress') return false;
        return requiredMaterials.every(m => m.hasEnough);
    }, [isCreating, order, requiredMaterials]);

    const handleSave = () => {
        if (!editableOrder.productId || !editableOrder.quantity || editableOrder.quantity <= 0) {
            addToast('Please select a product and enter a valid quantity.', 'error');
            return;
        }
        onSave(editableOrder as ProductionOrder);
    };
    
    const handleStatusUpdate = (newStatus: ProductionOrder['status']) => {
        if (newStatus === 'Completed' && !canComplete) {
            addToast('Cannot complete order due to stock shortage.', 'error');
            return;
        }
        onSave({ ...editableOrder, status: newStatus } as ProductionOrder);
    };

    const compositeProducts = useMemo(() => products.filter(p => p.components && p.components.length > 0), [products]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'أمر تصنيع جديد' : `أمر تصنيع #${order?.id}`}</h2>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label">المنتج المراد تصنيعه</label>
                            <select
                                value={editableOrder.productId || ''}
                                onChange={e => handleChange('productId', parseInt(e.target.value))}
                                className="form-select"
                                disabled={!isCreating}
                            >
                                <option value="">اختر منتج مركب...</option>
                                {compositeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">الكمية</label>
                            <input type="number" value={editableOrder.quantity || ''} onChange={e => handleChange('quantity', parseInt(e.target.value))} className="form-input" min="1" disabled={!isCreating} />
                        </div>
                        <div>
                            <label className="form-label">الفرع</label>
                            <select value={editableOrder.branchId || ''} onChange={e => handleChange('branchId', parseInt(e.target.value))} className="form-select" disabled={!isCreating}>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {selectedProduct && (
                        <div>
                            <h3 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>المواد الخام المطلوبة</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>المادة</th><th>المطلوب</th><th>المتاح</th></tr></thead>
                                    <tbody>
                                        {requiredMaterials.map(mat => (
                                            <tr key={mat.productId} style={{backgroundColor: !mat.hasEnough ? 'var(--highlight-low-stock)' : 'transparent'}}>
                                                <td>{mat.productName}</td>
                                                <td>{mat.required}</td>
                                                <td style={{fontWeight: 'bold', color: mat.hasEnough ? 'var(--secondary-color)' : '#ef4444'}}>{mat.available}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <div>
                        {!isCreating && order?.status === 'Pending' && (
                             <button onClick={() => handleStatusUpdate('In Progress')} className="btn btn-primary">بدء التنفيذ</button>
                        )}
                        {!isCreating && order?.status === 'In Progress' && (
                             <button onClick={() => handleStatusUpdate('Completed')} className="btn btn-secondary" disabled={!canComplete}>إتمام التصنيع</button>
                        )}
                    </div>
                    <div>
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                        {isCreating && <button onClick={handleSave} className="btn btn-secondary">حفظ الأمر</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionOrderModal;