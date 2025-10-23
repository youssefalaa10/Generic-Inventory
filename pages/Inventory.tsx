import React, { useState, useContext, useMemo } from 'react';
import { InventoryItem, Product, Branch, AdjustmentReason } from '../types';
import { useToasts } from '../components/Toast';
import { AuthContext } from '../App';
import { SwitchHorizontalIcon, AdjustmentsIcon, BarcodeIcon, PrinterIcon } from '../components/Icon';
import InventoryTransferModal from '../components/InventoryTransferModal';
import InventoryAdjustmentModal from '../components/InventoryAdjustmentModal';


interface InventoryProps {
    inventory: InventoryItem[];
    products: Product[];
    branches: Branch[];
    onUpdateItem: (item: InventoryItem) => void;
    onTransferInventory: (data: { sourceBranchId: number; destinationBranchId: number; productId: number; quantity: number; }) => void;
    onAdjustInventory: (data: { branchId: number; productId: number; newQuantity: number; reason: AdjustmentReason; notes?: string; }) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, products, branches, onUpdateItem, onTransferInventory, onAdjustInventory }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
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
            const branchMatch = filterBranch === 'all' || item.branchId === parseInt(filterBranch);
            const categoryMatch = filterCategory === 'all' || item.product?.category === filterCategory;
            return branchMatch && categoryMatch;
        });
    }, [inventoryWithProductInfo, filterBranch, filterCategory]);
    
    const productCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);


    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>نظرة عامة على المخزون</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '200px' }}>
                            <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory} className="form-select">
                                <option value="all">كل الفئات</option>
                                {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ width: '250px' }}>
                            <select onChange={(e) => setFilterBranch(e.target.value)} value={filterBranch} className="form-select">
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
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الفرع</th>
                                <th>الكمية المتاحة</th>
                                <th>الحد الأدنى للمخزون</th>
                                <th>الحالة</th>
                                <th>QR Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map(item => {
                                const isLowStock = item.quantity <= item.minStock && item.minStock > 0;
                                return (
                                    <tr key={`${item.branchId}-${item.productId}`} className={isLowStock ? 'low-stock-row' : ''}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.product?.sku}</div>
                                        </td>
                                        <td>{branches.find(b => b.id === item.branchId)?.name}</td>
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
