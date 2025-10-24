import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import { AdjustmentsIcon, BarcodeIcon, PrinterIcon, SwitchHorizontalIcon } from '../components/Icon';
import InventoryAdjustmentModal from '../components/InventoryAdjustmentModal';
import InventoryTransferModal from '../components/InventoryTransferModal';
import { useToasts } from '../components/Toast';
import { AdjustmentReason, Branch, InventoryItem, Product, InventoryMovement } from '../types';


interface InventoryProps {
    inventory: InventoryItem[];
    products: Product[];
    branches: Branch[];
    onUpdateItem: (item: InventoryItem) => void;
    onTransferInventory: (data: { sourceBranchId: number; destinationBranchId: number; productId: number; quantity: number; }) => void;
    onAdjustInventory: (data: { branchId: number; productId: number; newQuantity: number; reason: AdjustmentReason; notes?: string; }) => void;
    movements?: InventoryMovement[];
}

const Inventory: React.FC<InventoryProps> = ({ inventory, products, branches, onUpdateItem, onTransferInventory, onAdjustInventory, movements = [] }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'low' | 'movements'>('all');
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [isAdjustModalOpen, setAdjustModalOpen] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ dataUrl: string; productName: string } | null>(null);
    
    const hasPermission = (permission: 'update' | 'transfer' | 'adjust') => {
        if (!user) return false;
        return user.permissions.includes(`inventory:${permission}`);
    };

    const handleMinStockChange = (item: InventoryItem, newMinStock: number) => {
        onUpdateItem({ ...item, minStock: newMinStock });
        addToast('Minimum stock updated!', 'success');
    }
    
    const handleTransfer = (data: { sourceBranchId: number; destinationBranchId: number; productId: number; quantity: number; }) => {
        onTransferInventory(data);
        setTransferModalOpen(false);
        addToast('Inventory transferred successfully!', 'success');
    };

    const handleAdjust = (data: { branchId: number; productId: number; newQuantity: number; reason: AdjustmentReason; notes?: string; }) => {
        onAdjustInventory(data);
        setAdjustModalOpen(false);
    };

    const handleShowQrCode = (product: Product) => {
        const productInfo = {
            id: product.id,
            name: product.name,
            sku: product.sku
        };
        const jsonString = JSON.stringify(productInfo);

        (window as any).QRCode.toDataURL(jsonString, { width: 300, margin: 2 }, (err: any, url: string) => {
            if (err) {
                console.error(err);
                addToast('Failed to generate QR code.', 'error');
                return;
            }
            setQrCodeData({ dataUrl: url, productName: product.name });
        });
    };

    const inventoryWithProductInfo = inventory.map(i => ({
        ...i,
        product: products.find(p => p.id === i.productId),
    })).filter(i => i.product);

    const filteredInventory = useMemo(() => {
        return inventoryWithProductInfo.filter(item => {
            const branchMatch = filterBranch === 'all' || String(item.branchId) === filterBranch;
            const categoryMatch = filterCategory === 'all' || item.product?.category === filterCategory;
            return branchMatch && categoryMatch;
        });
    }, [inventoryWithProductInfo, filterBranch, filterCategory]);

    const stats = useMemo(() => {
        const totalItems = filteredInventory.length;
        const activeItems = filteredInventory.filter(i => i.quantity > 0).length;
        const lowStockItems = filteredInventory.filter(i => i.quantity <= i.minStock && i.minStock > 0).length;
        const attentionItems = lowStockItems;
        const totalValue = filteredInventory.reduce((sum, i) => {
            const unitCost = i.product?.purchasePrice ?? i.product?.unitPrice ?? 0;
            return sum + unitCost * i.quantity;
        }, 0);
        const unavailableItems = filteredInventory.filter(i => i.quantity <= 0).length;
        const lockedItems = 0;
        return { totalItems, activeItems, lowStockItems, attentionItems, totalValue, unavailableItems, lockedItems };
    }, [filteredInventory]);

    const filteredMovements = useMemo(() => {
        const byBranch = movements.filter(m => filterBranch === 'all' || String(m.branchId) === filterBranch);
        return byBranch.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [movements, filterBranch]);
    
    const productCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);


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
                                <button className="btn btn-primary">إضافة صنف</button>
                            </div>
                            <div className="inventory-filter-group">
                                <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory} className="form-select inventory-filter-select">
                                    <option value="all">كل الفئات</option>
                                    {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select onChange={(e) => setFilterBranch(e.target.value)} value={filterBranch} className="form-select inventory-filter-select-wide">
                                    <option value="all">كل الفروع</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            {hasPermission('transfer') && (
                                <button onClick={() => setTransferModalOpen(true)} className="btn btn-primary">
                                    <SwitchHorizontalIcon style={{ width: '20px', height: '20px' }}/>
                                    تحويل مخزون
                                </button>
                            )}
                            {hasPermission('adjust') && (
                                <button onClick={() => setAdjustModalOpen(true)} className="btn btn-warning">
                                    <AdjustmentsIcon style={{ width: '20px', height: '20px' }}/>
                                    تعديل المخزون
                                </button>
                            )}
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
                                <th>الفرع</th>
                                <th>المخزون الحالي</th>
                                <th>الحد الأدنى</th>
                                <th>الوحدة</th>
                                <th>التكلفة/وحدة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'low' ? filteredInventory.filter(i => i.quantity <= i.minStock && i.minStock > 0) : filteredInventory).map(item => {
                                const isLowStock = item.quantity <= item.minStock && item.minStock > 0;
                                return (
                                    <tr key={`${item.branchId}-${item.productId}`} className={isLowStock ? 'low-stock-row' : ''}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.product?.sku}</div>
                                        </td>
                                        <td>{item.product?.category}</td>
                                        <td>{branches.find(b => String(b.id) === String(item.branchId))?.name}</td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isLowStock ? '#f87171' : 'var(--text-primary)' }}>
                                            {item.product?.baseUnit === 'pcs' ? item.quantity.toLocaleString() : item.quantity.toFixed(2)}
                                        </td>
                                        <td>
                                            {hasPermission('update') ? (
                                                 <input 
                                                    type="number" 
                                                    defaultValue={item.minStock}
                                                    onBlur={(e) => handleMinStockChange(item, parseInt(e.target.value) || 0)}
                                                    className="form-input"
                                                    style={{ width: '100px', textAlign: 'center', padding: '0.5rem' }}
                                                />
                                            ) : (
                                                <span>{item.minStock}</span>
                                            )}
                                        </td>
                                        <td>{item.product?.baseUnit}</td>
                                        <td style={{ color: 'var(--secondary-color)' }}>{(item.product?.purchasePrice ?? item.product?.unitPrice ?? 0).toFixed(3)} د.ك</td>
                                        <td>
                                            {isLowStock && (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
                                                    color: '#111', background: '#f59e0b'
                                                }}>
                                                    مخزون منخفض
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button onClick={() => handleShowQrCode(item.product!)} style={{color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="Generate QR Code">
                                                <BarcodeIcon style={{width:'24px', height:'24px'}}/>
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
                                        <th>التاريخ</th>
                                        <th>النوع</th>
                                        <th>التغير في الكمية</th>
                                        <th>الكمية بعد</th>
                                        <th>الوثيقة المرتبطة</th>
                                        <th>المستخدم</th>
                                        <th>الفرع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMovements.map(m => (
                                        <tr key={String(m.id)}>
                                            <td>{new Date(m.date).toLocaleString('ar-EG')}</td>
                                            <td>{m.type}</td>
                                            <td style={{ direction: 'ltr', textAlign: 'right' }}>{m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}</td>
                                            <td>{m.quantityAfter}</td>
                                            <td>{m.relatedDoc ?? '-'}</td>
                                            <td>{m.user ?? '-'}</td>
                                            <td>{branches.find(b => String(b.id) === String(m.branchId))?.name ?? m.branchId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>لا توجد بيانات حركات متاحة حالياً.</div>
                        )
                    )}
                </div>
            </div>
            {isTransferModalOpen && (
                <InventoryTransferModal
                    onClose={() => setTransferModalOpen(false)}
                    onTransfer={handleTransfer}
                    branches={branches}
                    products={products}
                    inventory={inventory}
                />
            )}
            {isAdjustModalOpen && (
                <InventoryAdjustmentModal
                    onClose={() => setAdjustModalOpen(false)}
                    onAdjust={handleAdjust}
                    branches={branches}
                    products={products}
                    inventory={inventory}
                />
            )}
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
        </>
    );
};

export default Inventory;
