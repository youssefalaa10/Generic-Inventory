import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, BarcodeIcon } from './Icon';

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
            name: '', sku: '', category: 'Finished Good', baseUnit: 'pcs', unitPrice: 0,
            components: [], fragranceNotes: { top: '', middle: '', base: ''},
            trackInventory: true, status: 'Active',
            purchasePrice: 0, isTaxable: false, lowestSellingPrice: 0, discountPercent: 0,
            hasExpiryDate: false, alertQuantity: 0,
        } : product);
    }, [product, isCreating]);

    const handleChange = (field: keyof Product, value: any) => {
        setEditableProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!editableProduct.name || !editableProduct.sku) {
            alert('Name and SKU are required.');
            return;
        }
        onSave(editableProduct as Product);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'إضافة منتج جديد' : `تعديل المنتج: ${product?.name}`}</h2>
                    <div style={{display: 'flex', gap: '1rem'}}>
                         <button type="button" onClick={handleSave} className="btn btn-secondary">{isCreating ? 'حفظ' : 'حفظ التعديلات'}</button>
                         <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    </div>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                        {/* Left Column */}
                        <div>
                            <div className="form-section">
                                <div className="form-section-header">تفاصيل البند</div>
                                <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <FormField label="الاسم" required>
                                        <input type="text" value={editableProduct.name || ''} onChange={e => handleChange('name', e.target.value)} className="form-input" />
                                    </FormField>
                                    <FormField label="الوصف">
                                        <textarea value={editableProduct.description || ''} onChange={e => handleChange('description', e.target.value)} className="form-input" rows={3}></textarea>
                                    </FormField>
                                    <FormField label="الصور">
                                        <div className="file-upload-area" style={{padding: '1rem'}}>
                                            <UploadIcon className="icon" style={{width: 24, height: 24}}/>
                                            <span>أفلت الملف هنا أو <span style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>اختر من جهازك</span></span>
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                            <div className="form-section">
                                <div className="form-section-header">خيارات أخرى</div>
                                <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                     <FormField label="ملاحظات داخلية">
                                        <textarea value={editableProduct.internalNotes || ''} onChange={e => handleChange('internalNotes', e.target.value)} className="form-input" rows={2}></textarea>
                                    </FormField>
                                    <FormField label="وسوم">
                                        <input type="text" value={editableProduct.tags || ''} onChange={e => handleChange('tags', e.target.value)} className="form-input" />
                                    </FormField>
                                    <FormField label="الحالة">
                                        <select value={editableProduct.status || 'Active'} onChange={e => handleChange('status', e.target.value)} className="form-select">
                                            <option value="Active">نشط</option>
                                            <option value="Inactive">غير نشط</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                             <div className="form-section">
                                <div className="form-section-header">تفاصيل التسعير</div>
                                <div className="form-section-body">
                                    <div className="form-grid-cols-2">
                                        <FormField label="الرقم التسلسلي SKU" required>
                                            <input type="text" value={editableProduct.sku || ''} onChange={e => handleChange('sku', e.target.value)} className="form-input" />
                                        </FormField>
                                         <FormField label="سعر الشراء">
                                            <input type="number" value={editableProduct.purchasePrice || ''} onChange={e => handleChange('purchasePrice', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                        <FormField label="سعر البيع">
                                            <input type="number" value={editableProduct.unitPrice || ''} onChange={e => handleChange('unitPrice', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                        <FormField label="الضريبة 1">
                                            <select className="form-select"><option>اختر ضريبة</option></select>
                                        </FormField>
                                        <FormField label="أقل سعر بيع">
                                            <input type="number" value={editableProduct.lowestSellingPrice || ''} onChange={e => handleChange('lowestSellingPrice', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                        <FormField label="الخصم %">
                                            <input type="number" value={editableProduct.discountPercent || ''} onChange={e => handleChange('discountPercent', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                    </div>
                                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                        <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" checked={editableProduct.isTaxable} onChange={e => handleChange('isTaxable', e.target.checked)} /> خاضع للضريبة</label>
                                        <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" checked={editableProduct.hasExpiryDate} onChange={e => handleChange('hasExpiryDate', e.target.checked)} /> هل السلعة بتاريخ صلاحية</label>
                                    </div>
                                </div>
                            </div>

                             <div className="form-section">
                                <div className="form-section-header">إدارة المخزون</div>
                                <div className="form-section-body">
                                    <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}><input type="checkbox" checked={editableProduct.trackInventory} onChange={e => handleChange('trackInventory', e.target.checked)} /> تتبع المخزون</label>
                                    {editableProduct.trackInventory && (
                                        <div className="form-grid-cols-2">
                                             <FormField label="نوع التتبع"><select className="form-select"><option>حسب الكمية</option></select></FormField>
                                             <FormField label="المخزون"><select className="form-select"><option>Primary Warehouse</option></select></FormField>
                                             <FormField label="الكمية المبدئية"><input type="number" className="form-input" /></FormField>
                                             <FormField label="كمية التنبيه"><input type="number" value={editableProduct.alertQuantity || ''} onChange={e => handleChange('alertQuantity', Number(e.target.value))} className="form-input" /></FormField>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean; }> = ({ label, children, required }) => (
    <div>
        <label className={`form-label ${required ? 'required' : ''}`}>{label}</label>
        {children}
    </div>
);


export default ProductModal;