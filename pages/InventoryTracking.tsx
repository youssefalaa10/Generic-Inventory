import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import { AdjustmentsIcon, BarcodeIcon, PrinterIcon, SwitchHorizontalIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchInventory, updateInventoryItem, deleteInventoryItem, createInventoryItem, InvItem } from '../src/store/slices/inventorySlice';
import { InventoryMovement } from '../types';
import { fetchMovements } from '../src/store/slices/movementsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';


const Inventory: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const dispatch = useAppDispatch();
    const { items, loading, error } = useAppSelector(s => s.inventory);
    const branchState = useAppSelector(s => s.branches);
    const branchOptions = (branchState.branches || []).map((b: any) => b.name).filter(Boolean);
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'low' | 'movements'>('all');
    const [qrCodeData, setQrCodeData] = useState<{ dataUrl: string; productName: string } | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<InvItem | null>(null);
    const [isMovementOpen, setIsMovementOpen] = useState(false);
    const [movementForm, setMovementForm] = useState<{ inventory_item_id: string; movement_type: 'in' | 'out' | 'adjustment'; quantity: number; reference_type: string; notes?: string }>({
        inventory_item_id: '',
        movement_type: 'in',
        quantity: 0,
        reference_type: 'manual',
        notes: ''
    });
    const [newItem, setNewItem] = useState<Partial<InvItem>>({
        name: '',
        unit: 'pcs',
        category: '',
        costPerUnit: 0,
        currentStock: 0,
        minimumStock: 0,
        location: '',
        sku: ''
    });
    const movementsState = useAppSelector(s => s.movements);

    useEffect(() => {
        dispatch(fetchInventory({ page: 1, limit: 50 }));
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'movements') {
            dispatch(fetchMovements({ page: 1, limit: 50 }));
        }
    }, [activeTab, dispatch]);

    useEffect(() => {
        dispatch(fetchBranches({ page: 1, limit: 100 }));
    }, [dispatch]);
    
    const hasPermission = (permission: 'update' | 'transfer' | 'adjust') => {
        if (!user) return false;
        return user.permissions.includes(`inventory:${permission}`);
    };

    const handleMinStockChange = (item: InvItem, newMinStock: number) => {
        dispatch(updateInventoryItem({ id: item.id, data: { minimumStock: newMinStock } }))
            .unwrap()
            .then(() => addToast('Minimum stock updated!', 'success'))
            .catch(() => addToast('Failed to update minimum stock', 'error'));
    }

    const handleShowQrCode = (item: InvItem) => {
        const productInfo = {
            id: item.id,
            name: item.name,
            sku: item.sku
        };
        const jsonString = JSON.stringify(productInfo);

        (window as any).QRCode.toDataURL(jsonString, { width: 300, margin: 2 }, (err: any, url: string) => {
            if (err) {
                console.error(err);
                addToast('Failed to generate QR code.', 'error');
                return;
            }
            setQrCodeData({ dataUrl: url, productName: item.name });
        });
    };

    const inventoryWithProductInfo = items;

    const filteredInventory = useMemo(() => {
        return inventoryWithProductInfo.filter(item => {
            const branchMatch = filterBranch === 'all' || String(item.location || '') === filterBranch;
            const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
            return branchMatch && categoryMatch;
        });
    }, [inventoryWithProductInfo, filterBranch, filterCategory]);

    const stats = useMemo(() => {
        const totalItems = filteredInventory.length;
        const activeItems = filteredInventory.filter(i => (i.currentStock || 0) > 0).length;
        const lowStockItems = filteredInventory.filter(i => (i.currentStock || 0) <= (i.minimumStock || 0) && (i.minimumStock || 0) > 0).length;
        const attentionItems = lowStockItems;
        const totalValue = filteredInventory.reduce((sum, i) => {
            const unitCost = i.costPerUnit ?? 0;
            return sum + unitCost * (i.currentStock || 0);
        }, 0);
        const unavailableItems = filteredInventory.filter(i => (i.currentStock || 0) <= 0).length;
        const lockedItems = 0;
        return { totalItems, activeItems, lowStockItems, attentionItems, totalValue, unavailableItems, lockedItems };
    }, [filteredInventory]);

    const filteredMovements = useMemo(() => {
        const data = movementsState.items || [];
        return data.slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [movementsState.items]);
    
    const productCategories = useMemo(() => [...new Set(items.map(p => p.category).filter(Boolean))] as string[], [items]);


    return (
        <>
            <div className="glass-pane inventory-page-container">
                <div className="inventory-page-header">
                    <h3 className="inventory-page-title">إدارة المخزون</h3>
                    <div className="inventory-page-actions">
                        <div className="inventory-filters">
                            <div className="inventory-filter-group" style={{ gap: '0.5rem' }}>
                                <button className="btn btn-ghost">تصدير</button>
                                <button className="btn btn-ghost">استيراد</button>
                                <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>إضافة صنف</button>
                            </div>
                            <div className="inventory-filter-group">
                                <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory} className="form-select inventory-filter-select">
                                    <option value="all">كل الفئات</option>
                                    {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select onChange={(e) => setFilterBranch(e.target.value)} value={filterBranch} className="form-select inventory-filter-select-wide">
                                    <option value="all">كل المواقع</option>
                                    {branchOptions.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div className="summary-grid" style={{ marginTop: '1rem' }}>
                    <div className="summary-item">
                        <div className="summary-item-label">إجمالي العناصر</div>
                        <div className="summary-item-value">{stats.totalItems}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-item-label">عناصر المخزون النشطة</div>
                        <div className="summary-item-value">{stats.activeItems}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-item-label">تنبيهات قلة المخزون</div>
                        <div className="summary-item-value">{stats.lowStockItems}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-item-label">عناصر تحتاج انتباه</div>
                        <div className="summary-item-value">{stats.attentionItems}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-item-label">قيمة المخزون الحالية</div>
                        <div className="summary-item-value">{stats.totalValue.toLocaleString('ar-EG', { maximumFractionDigits: 3 })} د.ك</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-item-label">عناصر غير متاحة</div>
                        <div className="summary-item-value">{stats.unavailableItems}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-item-label">عناصر مقفلة</div>
                        <div className="summary-item-value">{stats.lockedItems}</div>
                    </div>
                </div>

                <div className="tab-buttons-container" style={{ marginTop: '1rem' }}>
                    <button className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>جميع العناصر</button>
                    <button className={`tab-button ${activeTab === 'low' ? 'active' : ''}`} onClick={() => setActiveTab('low')}>قلة المخزون</button>
                    <button className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`} onClick={() => setActiveTab('movements')}>الحركات</button>
                </div>
                <div className="inventory-table-wrapper">
                    {activeTab !== 'movements' ? (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>النوع</th>
                                <th>الموقع</th>
                                <th>المخزون الحالي</th>
                                <th>الحد الأدنى</th>
                                <th>الوحدة</th>
                                <th>التكلفة/وحدة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'low' ? filteredInventory.filter(i => (i.currentStock || 0) <= (i.minimumStock || 0) && (i.minimumStock || 0) > 0) : filteredInventory).map(item => {
                                const isLowStock = (item.currentStock || 0) <= (item.minimumStock || 0) && (item.minimumStock || 0) > 0;
                                return (
                                    <tr key={item.id} className={isLowStock ? 'low-stock-row' : ''}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.sku}</div>
                                        </td>
                                        <td>{item.category || '-'}</td>
                                        <td>{item.location || '-'}</td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isLowStock ? '#f87171' : 'var(--text-primary)' }}>
                                            {typeof item.currentStock === 'number' ? item.currentStock : 0}
                                        </td>
                                        <td>
                                            {hasPermission('update') ? (
                                                 <input 
                                                    type="number" 
                                                    defaultValue={item.minimumStock || 0}
                                                    onBlur={(e) => handleMinStockChange(item, parseInt(e.target.value) || 0)}
                                                    className="form-input"
                                                    style={{ width: '100px', textAlign: 'center', padding: '0.5rem' }}
                                                />
                                            ) : (
                                                <span>{item.minimumStock || 0}</span>
                                            )}
                                        </td>
                                        <td>{item.unit}</td>
                                        <td style={{ color: 'var(--secondary-color)' }}>{(item.costPerUnit ?? 0).toFixed(3)} د.ك</td>
                                        <td>
                                            <button onClick={() => handleShowQrCode(item)} style={{color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="Generate QR Code">
                                                <BarcodeIcon style={{width:'24px', height:'24px'}}/>
                                            </button>
                                            <button onClick={() => { setEditItem(item); setIsEditOpen(true); }} className="btn btn-ghost" style={{marginInlineStart: '0.5rem'}}>
                                                تعديل
                                            </button>
                                            <button onClick={() => { setMovementForm({ inventory_item_id: item.id, movement_type: 'in', quantity: 0, reference_type: 'manual', notes: '' }); setIsMovementOpen(true); }} className="btn btn-warning" style={{marginInlineStart: '0.5rem'}}>
                                                تسجيل حركة
                                            </button>
                                            <button onClick={() => dispatch(deleteInventoryItem(item.id)).then(() => addToast('Deleted', 'success')).catch(() => addToast('Delete failed', 'error'))} className="btn btn-ghost" style={{marginInlineStart: '0.5rem'}}>
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    ) : (
                        filteredMovements.length > 0 ? (
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>العنصر</th>
                                        <th>نوع الحركة</th>
                                        <th>الكمية</th>
                                        <th>نوع المرجع</th>
                                        <th>الملاحظات</th>
                                        <th>التاريخ والوقت</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMovements.map((m: any) => {
                                        const itemName = m.item_name || m.inventory_item_id?.name || '-';
                                        const typeLabel = m.movement_type === 'in' ? 'إضافة' : m.movement_type === 'out' ? 'إزالة' : 'تعديل';
                                        const signedQty = m.movement_type === 'out' ? -Math.abs(m.quantity) : Math.abs(m.quantity);
                                        const refMap: Record<string, string> = {
                                            purchase_order: 'طلب شراء',
                                            usage: 'استخدام',
                                            adjustment: 'تسوية',
                                            transfer: 'تحويل',
                                            return: 'مرتجع',
                                            manual: 'إدخال يدوي',
                                        };
                                        const refLabel = refMap[m.reference_type] || m.reference_type || '-';
                                        return (
                                            <tr key={String(m._id)}>
                                                <td>{itemName}</td>
                                                <td>{typeLabel}</td>
                                                <td style={{ direction: 'ltr', textAlign: 'right' }}>{signedQty > 0 ? `+${signedQty}` : `${signedQty}`}</td>
                                                <td>{refLabel}</td>
                                                <td>{m.notes || '-'}</td>
                                                <td>{m.created_at ? new Date(m.created_at).toLocaleString('ar-EG') : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>لا توجد بيانات حركات متاحة حالياً.</div>
                        )
                    )}
                </div>
            </div>
             {qrCodeData && (
                <div className="modal-backdrop" onClick={() => setQrCodeData(null)}>
                    <div id="qr-modal-content" className="modal-content glass-pane" style={{maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>QR Code للمنتج</h2>
                        </div>
                        <div className="modal-body" style={{textAlign: 'center'}} id="qr-print-area">
                            <img src={qrCodeData.dataUrl} alt="QR Code" style={{ border: '1px solid var(--surface-border)', borderRadius: '8px' }} />
                            <h3 style={{marginTop: '1rem', color: 'var(--text-primary)'}}>{qrCodeData.productName}</h3>
                        </div>
                        <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                            <button onClick={() => window.print()} className="btn btn-ghost">
                                <PrinterIcon style={{width: '20px', height: '20px'}} />
                                طباعة QR Code
                            </button>
                            <button onClick={() => setQrCodeData(null)} className="btn btn-primary">
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isCreateOpen && (
                <div className="modal-backdrop" onClick={() => setIsCreateOpen(false)}>
                    <div className="modal-content glass-pane" style={{maxWidth: '560px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>إضافة صنف جديد</h2>
                        </div>
                        <div className="modal-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                            <div>
                                <label className="form-label">الاسم</label>
                                <input className="form-input" value={newItem.name || ''} onChange={e => setNewItem(v => ({...v, name: e.target.value}))} />
                            </div>
                            <div>
                                <label className="form-label">الوحدة</label>
                                <input className="form-input" value={newItem.unit || ''} onChange={e => setNewItem(v => ({...v, unit: e.target.value}))} />
                            </div>
                            <div>
                                <label className="form-label">الفئة</label>
                                <input className="form-input" value={newItem.category || ''} onChange={e => setNewItem(v => ({...v, category: e.target.value}))} />
                            </div>
                            <div>
                                <label className="form-label">الموقع</label>
                                <select className="form-input" value={newItem.location || ''} onChange={e => setNewItem(v => ({...v, location: e.target.value}))}>
                                    <option value="">اختر الفرع</option>
                                    {branchOptions.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">SKU</label>
                                <input className="form-input" value={newItem.sku || ''} onChange={e => setNewItem(v => ({...v, sku: e.target.value}))} />
                            </div>
                            <div>
                                <label className="form-label">التكلفة/وحدة</label>
                                <input type="number" className="form-input" value={newItem.costPerUnit ?? 0} onChange={e => setNewItem(v => ({...v, costPerUnit: parseFloat(e.target.value || '0')}))} />
                            </div>
                            <div>
                                <label className="form-label">المخزون الحالي</label>
                                <input type="number" className="form-input" value={newItem.currentStock ?? 0} onChange={e => setNewItem(v => ({...v, currentStock: parseFloat(e.target.value || '0')}))} />
                            </div>
                            <div>
                                <label className="form-label">الحد الأدنى</label>
                                <input type="number" className="form-input" value={newItem.minimumStock ?? 0} onChange={e => setNewItem(v => ({...v, minimumStock: parseFloat(e.target.value || '0')}))} />
                            </div>
                            <div style={{gridColumn: '1 / -1'}}>
                                <label className="form-label">الوصف</label>
                                <textarea className="form-input" rows={3} value={newItem.description || ''} onChange={e => setNewItem(v => ({...v, description: e.target.value}))} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                            <button onClick={() => setIsCreateOpen(false)} className="btn btn-ghost">إلغاء</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (!newItem.name || !newItem.unit) {
                                        addToast('الاسم والوحدة مطلوبة', 'error');
                                        return;
                                    }
                                    dispatch(createInventoryItem(newItem))
                                        .unwrap()
                                        .then(() => {
                                            addToast('تمت إضافة الصنف', 'success');
                                            setIsCreateOpen(false);
                                            setNewItem({ name: '', unit: 'pcs', category: '', costPerUnit: 0, currentStock: 0, minimumStock: 0, location: '', sku: '', description: '' });
                                            dispatch(fetchInventory({ page: 1, limit: 50 }));
                                        })
                                        .catch(() => addToast('فشل إضافة الصنف', 'error'));
                                }}
                            >حفظ</button>
                        </div>
                    </div>
                </div>
            )}
            {isEditOpen && editItem && (
                <div className="modal-backdrop" onClick={() => setIsEditOpen(false)}>
                    <div className="modal-content glass-pane" style={{maxWidth: '560px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>تعديل الصنف</h2>
                        </div>
                        <div className="modal-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                            <div>
                                <label className="form-label">الاسم</label>
                                <input className="form-input" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">الوحدة</label>
                                <input className="form-input" value={editItem.unit} onChange={e => setEditItem({...editItem, unit: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">الفئة</label>
                                <input className="form-input" value={editItem.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">الموقع</label>
                                <select className="form-input" value={editItem.location || ''} onChange={e => setEditItem({...editItem, location: e.target.value})}>
                                    <option value="">اختر الفرع</option>
                                    {branchOptions.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">SKU</label>
                                <input className="form-input" value={editItem.sku || ''} onChange={e => setEditItem({...editItem, sku: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">التكلفة/وحدة</label>
                                <input type="number" className="form-input" value={editItem.costPerUnit ?? 0} onChange={e => setEditItem({...editItem, costPerUnit: parseFloat(e.target.value || '0')})} />
                            </div>
                            <div>
                                <label className="form-label">الحد الأدنى</label>
                                <input type="number" className="form-input" value={editItem.minimumStock ?? 0} onChange={e => setEditItem({...editItem, minimumStock: parseFloat(e.target.value || '0')})} />
                            </div>
                            <div style={{gridColumn: '1 / -1'}}>
                                <label className="form-label">الوصف</label>
                                <textarea className="form-input" rows={3} value={editItem.description || ''} onChange={e => setEditItem({...editItem, description: e.target.value})} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                            <button onClick={() => setIsEditOpen(false)} className="btn btn-ghost">إلغاء</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (!editItem.name || !editItem.unit) {
                                        addToast('الاسم والوحدة مطلوبة', 'error');
                                        return;
                                    }
                                    const { id, ...data } = editItem as any;
                                    dispatch(updateInventoryItem({ id: editItem.id, data }))
                                        .unwrap()
                                        .then(() => { addToast('تم التحديث', 'success'); setIsEditOpen(false); dispatch(fetchInventory({ page: 1, limit: 50 })); })
                                        .catch(() => addToast('فشل التحديث', 'error'));
                                }}
                            >حفظ</button>
                        </div>
                    </div>
                </div>
            )}
            {isMovementOpen && (
                <div className="modal-backdrop" onClick={() => setIsMovementOpen(false)}>
                    <div className="modal-content glass-pane" style={{maxWidth: '520px'}} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{fontSize: '1.25rem', fontWeight: 600}}>تسجيل حركة مخزون</h2>
                        </div>
                        <div className="modal-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                            <div style={{gridColumn: '1 / -1'}}>
                                <label className="form-label">نوع الحركة</label>
                                <select className="form-input" value={movementForm.movement_type} onChange={e => setMovementForm(v => ({...v, movement_type: e.target.value as any}))}>
                                    <option value="in">إضافة</option>
                                    <option value="out">إزالة</option>
                                    <option value="adjustment">تعديل</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">الكمية</label>
                                <input type="number" className="form-input" value={movementForm.quantity} onChange={e => setMovementForm(v => ({...v, quantity: parseFloat(e.target.value || '0')}))} />
                            </div>
                            <div>
                                <label className="form-label">نوع المرجع</label>
                                <select className="form-input" value={movementForm.reference_type} onChange={e => setMovementForm(v => ({...v, reference_type: e.target.value}))}>
                                    <option value="purchase_order">طلب شراء</option>
                                    <option value="usage">استخدام</option>
                                    <option value="transfer">تحويل</option>
                                    <option value="return">مرتجع</option>
                                    <option value="manual">إدخال يدوي</option>
                                    <option value="adjustment">تسوية</option>
                                </select>
                            </div>
                            <div style={{gridColumn: '1 / -1'}}>
                                <label className="form-label">الملاحظات</label>
                                <textarea className="form-input" rows={3} value={movementForm.notes || ''} onChange={e => setMovementForm(v => ({...v, notes: e.target.value}))} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                            <button onClick={() => setIsMovementOpen(false)} className="btn btn-ghost">إلغاء</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (!movementForm.inventory_item_id || !movementForm.quantity || movementForm.quantity <= 0) {
                                        addToast('يرجى إدخال كمية صحيحة', 'error');
                                        return;
                                    }
                                    import('../src/store/slices/movementsSlice').then(({ createMovement }) => {
                                        dispatch(createMovement(movementForm as any) as any)
                                          .unwrap()
                                          .then(() => { addToast('تم تسجيل الحركة', 'success'); setIsMovementOpen(false); dispatch(fetchInventory({ page: 1, limit: 50 })); if (activeTab === 'movements') dispatch(fetchMovements({ page: 1, limit: 50 })); })
                                          .catch(() => addToast('فشل تسجيل الحركة', 'error'));
                                    });
                                }}
                            >حفظ</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inventory;
