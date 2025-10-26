import React, { useEffect, useMemo, useState } from 'react';
import { InventoryRequisition, InventoryRequisitionItem, Product, Branch } from '../types';
import { PlusIcon, TrashIcon, UploadIcon } from './Icon';

interface InventoryRequisitionModalProps {
    onClose: () => void;
    onSave: (requisition: InventoryRequisition) => void;
    products: Product[];
    branches: Branch[];
    initialRequisition?: Partial<InventoryRequisition>;
    readOnly?: boolean;
}

const InventoryRequisitionModal: React.FC<InventoryRequisitionModalProps> = ({ onClose, onSave, products, branches, initialRequisition, readOnly }) => {
    const getNumericProductId = (p: any, idx: number) => {
        if (typeof p?.id === 'number' && !Number.isNaN(p.id)) return p.id;
        const asNum = Number(p?.id);
        if (!Number.isNaN(asNum) && asNum > 0) return asNum;
        return idx + 1;
    };
    const productOptions = useMemo(() => (products || []).map((p, i) => ({ id: getNumericProductId(p as any, i), name: p.name })), [products]);
    const [requisition, setRequisition] = useState<Partial<InventoryRequisition>>(() => {
        if (initialRequisition) {
            const mapped: Partial<InventoryRequisition> = {
                id: String(initialRequisition.id ?? ''),
                date: String(initialRequisition.date ?? new Date().toISOString().split('T')[0]),
                type: (initialRequisition.type as any) ?? 'Transfer',
                warehouseId: Number((initialRequisition as any).warehouseId ?? (initialRequisition as any).branchId ?? 0),
                items: (initialRequisition.items || []).map(i => ({ productId: Number((i as any).productId), quantity: Number((i as any).quantity) })),
                notes: initialRequisition.notes ?? ''
            };
            return mapped;
        }
        return {
            id: String(Math.floor(Math.random() * 90000) + 10000),
            date: new Date().toISOString().split('T')[0],
            type: 'Transfer',
            warehouseId: (branches && branches.length > 0) ? Number(((branches[0] as any)._id ?? branches[0].id) || 0) : 0,
            items: [{ productId: 0, quantity: 1 }],
            notes: '',
        };
    });

    useEffect(() => {
        if (!initialRequisition) return;
        setRequisition({
            id: String(initialRequisition.id ?? ''),
            date: String(initialRequisition.date ?? new Date().toISOString().split('T')[0]),
            type: (initialRequisition.type as any) ?? 'Transfer',
            warehouseId: Number((initialRequisition as any).warehouseId ?? (initialRequisition as any).branchId ?? 0),
            items: (initialRequisition.items || []).map(i => ({ productId: Number((i as any).productId), quantity: Number((i as any).quantity) })),
            notes: initialRequisition.notes ?? ''
        });
    }, [initialRequisition]);

    const handleFieldChange = (field: keyof InventoryRequisition, value: any) => {
        setRequisition(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof InventoryRequisitionItem, value: any) => {
        const newItems = [...(requisition.items || [])];
        if (field === 'productId') newItems[index].productId = Number(value);
        if (field === 'quantity') {
            const q = Math.max(1, Number(value) || 0);
            newItems[index].quantity = q;
        }
        setRequisition(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        const defaultProductId = productOptions && productOptions.length > 0 ? productOptions[0].id : 0;
        setRequisition(prev => ({ ...prev, items: [...(prev.items || []), { productId: defaultProductId, quantity: 1 }] }));
    };

    const handleRemoveItem = (index: number) => {
        setRequisition(prev => ({ ...prev, items: (prev.items || []).filter((_, i) => i !== index) }));
    };

    useEffect(() => {
        if (!productOptions || productOptions.length === 0) return;
        setRequisition(prev => {
            const currentItems = prev.items || [];
            if (currentItems.length === 0) {
                return { ...prev, items: [{ productId: productOptions[0].id, quantity: 1 }] };
            }
            // Normalize any 0/NaN productId to first product
            const fixed = currentItems.map(it => ({
                productId: !it.productId || Number.isNaN(Number(it.productId)) ? productOptions[0].id : Number(it.productId),
                quantity: it.quantity || 1
            }));
            return { ...prev, items: fixed };
        });
    }, [productOptions]);

    const handleSaveClick = () => {
        const items = (requisition.items || []).map(i => ({
            productId: Number((i as any).productId),
            quantity: Number((i as any).quantity)
        }));
        const hasInvalid = items.length === 0 || items.some(i => !i.productId || Number.isNaN(i.productId) || i.quantity <= 0 || Number.isNaN(i.quantity));
        if (!requisition.warehouseId || hasInvalid) {
            alert('يرجى اختيار المستودع وتحديد بنود صحيحة (منتج وكمية أكبر من 0).');
            return;
        }
        const normalized: InventoryRequisition = {
            id: String(requisition.id || ''),
            date: String(requisition.date || new Date().toISOString().split('T')[0]),
            type: (requisition.type as any) || 'Transfer',
            warehouseId: Number(requisition.warehouseId),
            items,
            notes: requisition.notes || '',
            attachments: requisition.attachments || []
        };
        onSave(normalized);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '60rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>إضافة طلبية مخزنية</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!readOnly && (
                            <button
                                onClick={handleSaveClick}
                                className="btn btn-secondary"
                                disabled={!(requisition.warehouseId && (requisition.items || []).length > 0 && (requisition.items || []).every(i => Number(i.productId) > 0 && Number(i.quantity) > 0))}
                            >حفظ</button>
                        )}
                        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-section-header">معلومات عامة</div>
                        <div className="form-section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                            <div><label className="form-label required">الكود</label><input type="text" value={requisition.id} className="form-input" disabled /></div>
                            <div><label className="form-label">التاريخ</label><input type="date" value={requisition.date} onChange={e => handleFieldChange('date', e.target.value)} className="form-input" disabled={!!readOnly} /></div>
                            <div>
                                <label className="form-label required">النوع</label>
                                <select value={requisition.type} onChange={e => handleFieldChange('type', e.target.value)} className="form-select" disabled={!!readOnly}>
                                    <option value="Transfer">تحويل</option>
                                    <option value="Purchase">شراء</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label required">المستودع</label>
                                <select value={requisition.warehouseId} onChange={e => handleFieldChange('warehouseId', e.target.value)} className="form-select" disabled={!!readOnly}>
                                    {branches.map(b => {
                                        const bid = String(((b as any)._id ?? (b as any).id) || '');
                                        return <option key={bid} value={bid}>{b.name}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">بنود الطلب المخزني</div>
                        <div className="form-section-body">
                            <div className="table-wrapper">
                                <table style={{backgroundColor: '#f9fcff'}}>
                                    <thead><tr style={{backgroundColor: '#f0f7ff'}}><th style={{padding: '0.75rem'}}>البند</th><th style={{padding: '0.75rem', width: '150px'}}>الكمية</th><th style={{width: '50px'}}></th></tr></thead>
                                    <tbody>
                                        {(requisition.items || []).map((item, index) => (
                                            <tr key={index}>
                                                <td style={{padding: '0.5rem'}}>
                                                    <select
                                                        value={item.productId}
                                                        onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                                        className="form-select"
                                                        disabled={!!readOnly}
                                                    >
                                                        <option value={0}>اختر...</option>
                                                        {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{padding: '0.5rem'}}><input type="number" min={1} value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" disabled={!!readOnly} /></td>
                                                <td>{!readOnly && (<button type="button" onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width:'20px',height:'20px'}}/></button>)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!readOnly && (<div style={{marginTop: '1rem', textAlign: 'left'}}><button type="button" onClick={handleAddItem} className="btn btn-ghost"><PlusIcon style={{width:'20px',height:'20px'}}/> إضافة بند</button></div>)}
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-header">خيارات أكثر</div>
                        <div className="form-section-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                           <div>
                                <label className="form-label">الملاحظات</label>
                                <textarea value={requisition.notes || ''} onChange={(e) => handleFieldChange('notes', e.target.value)} className="form-input" rows={5} disabled={!!readOnly}></textarea>
                           </div>
                           <div>
                                <label className="form-label">المرفقات</label>
                                <div className="file-upload-area">
                                    <UploadIcon className="icon"/>
                                    <span>أسحب الصورة هنا أو <span style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>اختر من جهازك</span></span>
                                    <p style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>أنواع الملفات المسموح بها (pdf, doc, docx, odt, png, jpg, jpeg)</p>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryRequisitionModal;