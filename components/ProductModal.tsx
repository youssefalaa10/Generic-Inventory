import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PlusIcon, TrashIcon } from './Icon';

interface ProductModalProps {
    product: Partial<Product> | null;
    allProducts: Product[];
    onClose: () => void;
    onSave: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, allProducts, onClose, onSave }) => {
    const isCreating = !product?.id;
    const [editableProduct, setEditableProduct] = useState<Partial<Product>>({});

    useEffect(() => {
        setEditableProduct(isCreating ? {
            name: '',
            sku: '',
            category: 'Finished Good',
            baseUnit: 'pcs',
            unitPrice: 0,
            components: [],
            fragranceNotes: { top: '', middle: '', base: ''}
        } : product);
    }, [product, isCreating]);

    const handleChange = (field: keyof Product, value: any) => {
        setEditableProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleNotesChange = (part: 'top' | 'middle' | 'base', value: string) => {
        setEditableProduct(prev => ({
            ...prev,
            fragranceNotes: {
                ...prev.fragranceNotes,
                [part]: value
            }
        }));
    };

    const handleComponentChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
        const newComponents = [...(editableProduct.components || [])];
        if (field === 'productId') newComponents[index].productId = Number(value);
        if (field === 'quantity') newComponents[index].quantity = Number(value);
        setEditableProduct(prev => ({ ...prev, components: newComponents }));
    };

    const addComponent = () => {
        const newComponent = { productId: 0, quantity: 1 };
        setEditableProduct(prev => ({ ...prev, components: [...(prev.components || []), newComponent] }));
    };

    const removeComponent = (index: number) => {
        const newComponents = (editableProduct.components || []).filter((_, i) => i !== index);
        setEditableProduct(prev => ({ ...prev, components: newComponents }));
    };

    const handleSave = () => {
        if (!editableProduct.name || !editableProduct.sku) {
            alert('Name and SKU are required.');
            return;
        }
        onSave(editableProduct as Product);
    };
    
    const isComposite = (editableProduct.components || []).length > 0;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '50rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div><label className="form-label">الاسم</label><input type="text" value={editableProduct.name || ''} onChange={e => handleChange('name', e.target.value)} className="form-input" /></div>
                        <div><label className="form-label">SKU</label><input type="text" value={editableProduct.sku || ''} onChange={e => handleChange('sku', e.target.value)} className="form-input" /></div>
                        <div><label className="form-label">الفئة</label><input type="text" value={editableProduct.category || ''} onChange={e => handleChange('category', e.target.value)} className="form-input" placeholder="e.g., Raw Material, Finished Good" /></div>
                        <div><label className="form-label">خط الإنتاج</label><input type="text" value={editableProduct.productLine || ''} onChange={e => handleChange('productLine', e.target.value)} className="form-input" placeholder="e.g., Oud Collection" /></div>
                        <div>
                            <label className="form-label">الوحدة الأساسية</label>
                            <select value={editableProduct.baseUnit} onChange={e => handleChange('baseUnit', e.target.value)} className="form-select">
                                <option value="pcs">قطعة (pcs)</option><option value="g">جرام (g)</option><option value="ml">مل (ml)</option>
                            </select>
                        </div>
                        <div><label className="form-label">سعر الوحدة</label><input type="number" step="0.01" value={editableProduct.unitPrice || ''} onChange={e => handleChange('unitPrice', parseFloat(e.target.value))} className="form-input" /></div>
                        <div><label className="form-label">الكثافة (g/ml)</label><input type="number" step="0.01" value={editableProduct.density || ''} onChange={e => handleChange('density', parseFloat(e.target.value))} className="form-input" /></div>
                    </div>
                    {/* Fragrance Notes */}
                    <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>مكونات العطر (Fragrance Notes)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div><label className="form-label">Top Notes</label><textarea value={editableProduct.fragranceNotes?.top || ''} onChange={e => handleNotesChange('top', e.target.value)} className="form-input" rows={2}></textarea></div>
                            <div><label className="form-label">Middle Notes</label><textarea value={editableProduct.fragranceNotes?.middle || ''} onChange={e => handleNotesChange('middle', e.target.value)} className="form-input" rows={2}></textarea></div>
                            <div><label className="form-label">Base Notes</label><textarea value={editableProduct.fragranceNotes?.base || ''} onChange={e => handleNotesChange('base', e.target.value)} className="form-input" rows={2}></textarea></div>
                        </div>
                    </div>
                    {/* Components for Composite Products */}
                    <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>مكونات المنتج (للمنتجات المركبة)</h4>
                        <div className="table-wrapper">
                            <table>
                                <thead><tr><th>المكون</th><th>الكمية</th><th></th></tr></thead>
                                <tbody>
                                    {(editableProduct.components || []).map((comp, index) => (
                                        <tr key={index}>
                                            <td style={{padding: '0.5rem'}}><select value={comp.productId} onChange={e => handleComponentChange(index, 'productId', e.target.value)} className="form-select"><option>اختر مكون...</option>{allProducts.filter(p => p.id !== product?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                            <td style={{padding: '0.5rem', width: '120px'}}><input type="number" value={comp.quantity} onChange={e => handleComponentChange(index, 'quantity', e.target.value)} className="form-input" /></td>
                                            <td style={{width: '50px'}}><button type="button" onClick={() => removeComponent(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width:'20px',height:'20px'}}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{marginTop: '0.5rem'}}>
                            <button type="button" onClick={addComponent} className="btn btn-ghost"><PlusIcon style={{width:'20px',height:'20px'}}/> إضافة مكون</button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button type="button" onClick={handleSave} className="btn btn-secondary">{isCreating ? 'حفظ المنتج' : 'حفظ التعديلات'}</button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;