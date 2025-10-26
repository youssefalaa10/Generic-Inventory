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
    const isCreating = !((product as any)?.id || (product as any)?._id);
    const [editableProduct, setEditableProduct] = useState<Partial<Product>>({});
    const [extraCost, setExtraCost] = useState<number>(0);

    useEffect(() => {
        const defaults: Partial<Product> = {
            category: 'Finished Good', baseUnit: 'pcs', unitPrice: 0,
            components: [], fragranceNotes: { top: '', middle: '', base: ''},
            trackInventory: true, trackingType: 'Quantity', status: 'Active',
            purchasePrice: 0, isTaxable: false, lowestSellingPrice: 0, discountPercent: 0,
            hasExpiryDate: false, alertQuantity: 0,
        };
        setEditableProduct(isCreating ? {
            name: '', sku: '', ...defaults,
        } : { ...defaults, ...(product || {}) });
        setExtraCost(0);
    }, [product, isCreating]);

    const handleChange = (field: keyof Product, value: any) => {
        setEditableProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!editableProduct.name || !editableProduct.sku) {
            alert('Name and SKU are required.');
            return;
        }
        const componentsCost = (editableProduct.components || []).reduce((sum, c) => {
            const compProduct = allProducts.find(p => Number((p as any).id) === Number(c.productId));
            const costPerUnit = Number((compProduct?.purchasePrice ?? compProduct?.unitPrice) || 0);
            return sum + Number(c.quantity || 0) * costPerUnit;
        }, 0);
        const totalCost = componentsCost + Number(extraCost || 0);
        const payload: Product = { ...(editableProduct as Product), purchasePrice: totalCost };
        onSave(payload);
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
                                <div className="form-section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span>متغيرات المنتج</span>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            const variants = [ ...(((editableProduct as any).variants) || []), { name: '', type: 'single', options: [] } ];
                                            setEditableProduct(prev => ({ ...prev, variants }));
                                        }}
                                    >
                                        <PlusIcon/> إضافة متغير
                                    </button>
                                </div>
                                <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {(editableProduct as any).variants?.map((v: any, idx: number) => (
                                        <div key={idx} className="glass-pane" style={{padding: '0.75rem', borderRadius: 12}}>
                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                                                <div style={{fontWeight:600}}>المتغير #{idx + 1}</div>
                                                <button type="button" className="btn btn-warning" onClick={() => {
                                                    const variants = ((editableProduct as any).variants || []).filter((_: any, i: number) => i !== idx);
                                                    setEditableProduct(prev => ({ ...prev, variants }));
                                                }}><TrashIcon/></button>
                                            </div>
                                            <div className="form-grid-cols-2" style={{gap:'0.5rem'}}>
                                                <div>
                                                    <label className="form-label required">اسم المتغير *</label>
                                                    <input
                                                        className="form-input"
                                                        placeholder="مثال: اللون، الحجم"
                                                        value={v.name || ''}
                                                        onChange={e => {
                                                            const variants = [ ...((editableProduct as any).variants || []) ];
                                                            variants[idx] = { ...variants[idx], name: e.target.value };
                                                            setEditableProduct(prev => ({ ...prev, variants }));
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">نوع المتغير</label>
                                                    <select
                                                        className="form-select"
                                                        value={v.type || 'single'}
                                                        onChange={e => {
                                                            const variants = [ ...((editableProduct as any).variants || []) ];
                                                            variants[idx] = { ...variants[idx], type: e.target.value } as any;
                                                            setEditableProduct(prev => ({ ...prev, variants }));
                                                        }}
                                                    >
                                                        <option value="single">اختيار واحد</option>
                                                        <option value="multi">اختيار متعدد</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{marginTop:'0.5rem'}}>
                                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                                                    <span className="form-label">خيارات المتغير</span>
                                                    <button type="button" className="btn btn-ghost" onClick={() => {
                                                        const variants = [ ...((editableProduct as any).variants || []) ];
                                                        const options = [ ...(variants[idx]?.options || []), '' ];
                                                        variants[idx] = { ...variants[idx], options };
                                                        setEditableProduct(prev => ({ ...prev, variants }));
                                                    }}><PlusIcon/> إضافة خيار</button>
                                                </div>
                                                <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                                                    {(v.options || []).map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} className="chip">
                                                            <input
                                                                className="form-input"
                                                                style={{width: 200}}
                                                                value={opt}
                                                                onChange={e => {
                                                                    const variants = [ ...((editableProduct as any).variants || []) ];
                                                                    const options = [ ...(variants[idx].options || []) ];
                                                                    options[oIdx] = e.target.value;
                                                                    variants[idx] = { ...variants[idx], options };
                                                                    setEditableProduct(prev => ({ ...prev, variants }));
                                                                }}
                                                            />
                                                            <button type="button" className="btn btn-warning" onClick={() => {
                                                                const variants = [ ...((editableProduct as any).variants || []) ];
                                                                const options = (variants[idx].options || []).filter((_: any, j: number) => j !== oIdx);
                                                                variants[idx] = { ...variants[idx], options };
                                                                setEditableProduct(prev => ({ ...prev, variants }));
                                                            }}><TrashIcon/></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                            <input type="number" value={editableProduct.purchasePrice ?? ''} onChange={e => handleChange('purchasePrice', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                        <FormField label="سعر البيع">
                                            <input type="number" value={editableProduct.unitPrice ?? ''} onChange={e => handleChange('unitPrice', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                        <FormField label="الضريبة 1">
                                            <select className="form-select"><option>اختر ضريبة</option></select>
                                        </FormField>
                                        <FormField label="أقل سعر بيع">
                                            <input type="number" value={editableProduct.lowestSellingPrice ?? ''} onChange={e => handleChange('lowestSellingPrice', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                        <FormField label="الخصم %">
                                            <input type="number" value={editableProduct.discountPercent ?? ''} onChange={e => handleChange('discountPercent', Number(e.target.value))} className="form-input" />
                                        </FormField>
                                    </div>
                                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                        <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" checked={!!editableProduct.isTaxable} onChange={e => handleChange('isTaxable', e.target.checked)} /> خاضع للضريبة</label>
                                        <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" checked={!!editableProduct.hasExpiryDate} onChange={e => handleChange('hasExpiryDate', e.target.checked)} /> هل السلعة بتاريخ صلاحية</label>
                                    </div>
                                    <div className="form-section" style={{marginTop:'1rem'}}>
                                        <div className="form-section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <span>عناصر المخزون المطلوبة</span>
                                            <button type="button" className="btn btn-primary" onClick={() => setEditableProduct(prev => ({ ...prev, components: [ ...(prev.components || []), { productId: 0, quantity: 1, note: '' } as any ] }))}><PlusIcon/> إضافة عنصر</button>
                                        </div>
                                        <div className="form-section-body" style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                                            {(editableProduct.components || []).map((c, idx) => {
                                                const compProduct = allProducts.find(p => Number((p as any).id) === Number(c.productId));
                                                const costPerUnit = Number((compProduct?.purchasePrice ?? compProduct?.unitPrice) || 0);
                                                const lineTotal = Number(c.quantity || 0) * costPerUnit;
                                                return (
                                                    <div key={idx} className="glass-pane" style={{padding:'0.75rem', borderRadius:12}}>
                                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                                                            <div style={{fontWeight:600}}>عنصر مخزون #{idx + 1}</div>
                                                            <button type="button" className="btn btn-warning" onClick={() => {
                                                                setEditableProduct(prev => ({ ...prev, components: (prev.components || []).filter((_, i) => i !== idx) }));
                                                            }}><TrashIcon/></button>
                                                        </div>
                                                        <div className="form-grid-cols-3" style={{gap:'0.5rem'}}>
                                                            <div>
                                                                <label className="form-label required">عنصر المخزون *</label>
                                                                <select className="form-select" value={Number(c.productId) || 0} onChange={e => {
                                                                    const productId = Number(e.target.value);
                                                                    setEditableProduct(prev => {
                                                                        const components = [...(prev.components || [])];
                                                                        components[idx] = { ...components[idx], productId } as any;
                                                                        return { ...prev, components };
                                                                    });
                                                                }}>
                                                                    <option value={0}>اختر عنصر من المخزون</option>
                                                                    {allProducts
                                                                        .filter(p => typeof (p as any).id === 'number')
                                                                        .map(p => (
                                                                            <option key={String((p as any).id)} value={Number((p as any).id)}>
                                                                                {p.name}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="form-label required">الكمية المطلوبة *</label>
                                                                <input type="number" className="form-input" value={Number(c.quantity) || 0} onChange={e => {
                                                                    const quantity = Number(e.target.value);
                                                                    setEditableProduct(prev => {
                                                                        const components = [...(prev.components || [])];
                                                                        components[idx] = { ...components[idx], quantity } as any;
                                                                        return { ...prev, components };
                                                                    });
                                                                }} />
                                                            </div>
                                                            <div>
                                                                <label className="form-label">ملاحظات</label>
                                                                <input type="text" className="form-input" placeholder="ملاحظات إضافية" value={(c as any).note || ''} onChange={e => {
                                                                    const note = e.target.value;
                                                                    setEditableProduct(prev => {
                                                                        const components = [...(prev.components || [])];
                                                                        components[idx] = { ...components[idx], note } as any;
                                                                        return { ...prev, components };
                                                                    });
                                                                }} />
                                                            </div>
                                                        </div>
                                                        <div style={{marginTop:'0.5rem', textAlign:'left', color:'var(--text-secondary)'}}>الإجمالي: <b>{lineTotal.toFixed(3)}</b></div>
                                                    </div>
                                                );
                                            })}
                                            <div style={{display:'flex', gap:'0.75rem', marginTop:'0.25rem', justifyContent:'flex-end', alignItems:'center'}}>
                                                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                                                    <label className="form-label">تكلفة إضافية</label>
                                                    <input type="number" className="form-input" style={{width:140}} value={extraCost} onChange={e => setExtraCost(Number(e.target.value || 0))} />
                                                </div>
                                            </div>
                                            <div style={{display:'flex', gap:'1.5rem', marginTop:'0.25rem'}}>
                                                <div>الإجمالي من العناصر: <b>{((editableProduct.components || []).reduce((sum, c) => {
                                                    const compProduct = allProducts.find(p => Number((p as any).id) === Number(c.productId));
                                                    const costPerUnit = Number((compProduct?.purchasePrice ?? compProduct?.unitPrice) || 0);
                                                    return sum + Number(c.quantity || 0) * costPerUnit;
                                                }, 0)).toFixed(3)}</b></div>
                                                <div>التكلفة الإضافية: <b>{Number(extraCost || 0).toFixed(3)}</b></div>
                                                <div>التكلفة الإجمالية: <b>{(((editableProduct.components || []).reduce((sum, c) => {
                                                    const compProduct = allProducts.find(p => Number((p as any).id) === Number(c.productId));
                                                    const costPerUnit = Number((compProduct?.purchasePrice ?? compProduct?.unitPrice) || 0);
                                                    return sum + Number(c.quantity || 0) * costPerUnit;
                                                }, 0)) + Number(extraCost || 0)).toFixed(3)}</b></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <div className="form-section">
                                <div className="form-section-header">إدارة المخزون</div>
                                <div className="form-section-body">
                                    <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><input type="checkbox" checked={!!editableProduct.trackInventory} onChange={e => handleChange('trackInventory', e.target.checked)} /> تتبع المخزون</label>
                                    <label className="form-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}><input type="checkbox" checked={!!editableProduct.trackInventory} onChange={e => handleChange('trackInventory', e.target.checked)} /> تتبع المخزون</label>
                                    {editableProduct.trackInventory && (
                                        <div className="form-grid-cols-2">
                                             <FormField label="نوع التتبع">
                                                <select
                                                    className="form-select"
                                                    value={editableProduct.trackingType || 'Quantity'}
                                                    onChange={e => handleChange('trackingType', e.target.value as any)}
                                                >
                                                    <option value="Quantity">حسب الكمية</option>
                                                    <option value="None">بدون</option>
                                                </select>
                                             </FormField>
                                             <FormField label="المخزون"><select className="form-select"><option>Primary Warehouse</option></select></FormField>
                                             <FormField label="الكمية المبدئية"><input type="number" className="form-input" /></FormField>
                                             <FormField label="كمية التنبيه"><input type="number" value={editableProduct.alertQuantity ?? ''} onChange={e => handleChange('alertQuantity', Number(e.target.value))} className="form-input" /></FormField>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                    <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button type="button" onClick={handleSave} className="btn btn-primary">{isCreating ? 'حفظ' : 'حفظ التعديلات'}</button>
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