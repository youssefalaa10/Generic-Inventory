
import React, { useState, useMemo } from 'react';
import { Product, InventoryItem, Sale, PurchaseInvoice, User, Branch, InventoryAdjustmentLog, InventoryMovement, SaleItem, Supplier } from '../types';
import { PencilIcon, SwitchHorizontalIcon, AdjustmentsIcon } from '../components/Icon';

interface ProductDetailPageProps {
    product: Product;
    inventory: InventoryItem[];
    sales: Sale[];
    purchaseInvoices: PurchaseInvoice[];
    users: User[];
    branches: Branch[];
    products: Product[];
    suppliers: Supplier[];
    inventoryAdjustmentLogs: InventoryAdjustmentLog[];
    onBack: () => void;
    onEditProduct: (product: Partial<Product>) => void;
    onTransferInventory: (data: any) => void;
    onAdjustInventory: (data: any) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
    product,
    inventory,
    sales,
    purchaseInvoices,
    users,
    branches,
    inventoryAdjustmentLogs,
    onBack,
    onEditProduct,
    onTransferInventory,
    onAdjustInventory,
    suppliers
}) => {
    const [activeTab, setActiveTab] = useState('info');

    const totalStock = useMemo(() => {
        return inventory.filter(i => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
    }, [inventory, product.id]);
    
    const soldLast7Days = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sales
            .filter(s => new Date(s.date) >= sevenDaysAgo)
            .flatMap(s => s.items)
            .filter(item => item.productId === product.id)
            .reduce((sum, item) => sum + item.quantity, 0);
    }, [sales, product.id]);
    
    const soldLast28Days = useMemo(() => {
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
        return sales
            .filter(s => new Date(s.date) >= twentyEightDaysAgo)
            .flatMap(s => s.items)
            .filter(item => item.productId === product.id)
            .reduce((sum, item) => sum + item.quantity, 0);
    }, [sales, product.id]);

    const inventoryByBranch = useMemo(() => {
        return inventory.filter(i => i.productId === product.id);
    }, [inventory, product.id]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return <InfoTab product={product} totalStock={totalStock} soldLast7Days={soldLast7Days} soldLast28Days={soldLast28Days} inventoryByBranch={inventoryByBranch} branches={branches} onAdjustInventory={onAdjustInventory} suppliers={suppliers} />;
            case 'movements':
                return <MovementsTab product={product} sales={sales} purchaseInvoices={purchaseInvoices} inventoryAdjustmentLogs={inventoryAdjustmentLogs} users={users} branches={branches} inventory={inventory} />;
            case 'timeline':
                return <TimelineTab product={product} sales={sales} purchaseInvoices={purchaseInvoices} />;
            case 'activity':
                return <ActivityLogTab product={product} />;
            default:
                return null;
        }
    };

    return (
        <div className="product-detail-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="product-detail-header glass-pane" style={{padding: '1.5rem'}}>
                <div className="product-title-group" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <button onClick={onBack} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>&larr;</button>
                    <h2>{product.name} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>#{product.sku}</span></h2>
                </div>
                <div className="product-actions">
                    <button className="btn btn-ghost" onClick={() => onTransferInventory({productId: product.id})}><SwitchHorizontalIcon/> نقل المخزون</button>
                    <button className="btn btn-ghost" onClick={() => onAdjustInventory({productId: product.id})}><AdjustmentsIcon/> تعديل يدوي</button>
                    <button className="btn btn-primary" onClick={() => onEditProduct(product)}><PencilIcon/> تعديل</button>
                </div>
            </div>

            <div className="tab-buttons-container glass-pane" style={{borderRadius: '16px 16px 0 0', padding: '0'}}>
                 <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>معلومات</button>
                 <button className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`} onClick={() => setActiveTab('movements')}>حركة المخزون</button>
                 <button className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>الجدول الزمني</button>
                 <button className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>سجل النشاطات</button>
            </div>

            <div className="panel-content glass-pane" style={{flex: 1, marginTop: '-1.5rem', borderRadius: '0 0 16px 16px'}}>
                {renderTabContent()}
            </div>
        </div>
    );
};


const InfoTab = ({ product, totalStock, soldLast7Days, soldLast28Days, inventoryByBranch, branches, onAdjustInventory, suppliers }: any) => {
    const supplierName = useMemo(() => {
        if (!product.supplierId) return 'غير محدد';
        const supplier = suppliers.find((s: Supplier) => s.id === product.supplierId);
        return supplier ? `${supplier.name} ${supplier.code ? `(${supplier.code})` : ''}` : 'مورد غير معروف';
    }, [product.supplierId, suppliers]);
    
    return (
        <div>
            <div className="product-stats-grid">
                <StatCard label="إجمالي المخزون" value={totalStock} />
                <StatCard label="إجمالي القطع المباعة" value="4" helpText="آخر 28 يوم" />
                <StatCard label="آخر 7 أيام" value={soldLast7Days} change="+1" comparisonText="مقارنة بـ 7 أيام سابقة" />
                <StatCard label="آخر 28 أيام" value={soldLast28Days} change="+1" comparisonText="مقارنة بـ 28 أيام سابقة" />
            </div>
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>تفاصيل المنتج</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <DetailItem label="كود المنتج (SKU)" value={product.sku} />
                        <DetailItem label="سعر البيع" value={`${product.unitPrice.toFixed(3)} د.ك`} />
                        <DetailItem label="المورد الأساسي" value={supplierName} />
                        <DetailItem label="الماركة" value="Arabiva" />
                        <DetailItem label="نوع التتبع" value="الكمية فقط" />
                    </div>
                     <div style={{ float: 'left', width: '200px', height: '200px', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', margin: '1rem 0 0 1rem', cursor: 'pointer', flexDirection: 'column' }}>
                        <span>Click here to upload</span>
                        <span>product photos</span>
                    </div>
                </div>
                <div>
                     <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>المخزون حسب الفرع</h4>
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>الفرع</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead>
                            <tbody>
                                {inventoryByBranch.map((item: InventoryItem) => (
                                    <tr key={item.branchId}>
                                        <td>{branches.find((b:Branch) => b.id === item.branchId)?.name}</td>
                                        <td style={{fontWeight: 'bold'}}>{item.quantity}</td>
                                        <td>{item.expiryDate || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
};

const MovementsTab = ({ product, sales, purchaseInvoices, inventoryAdjustmentLogs, users, branches, inventory }: any) => {
    
    const movements: InventoryMovement[] = useMemo(() => {
        const allMovements: any[] = [];

        sales.forEach((sale: Sale) => {
            sale.items.forEach((item: SaleItem) => {
                if (item.productId === product.id) {
                    allMovements.push({
                        id: `sale-${sale.id}-${item.id}`,
                        date: sale.date,
                        type: 'بيع',
                        quantityChange: -item.quantity,
                        relatedDoc: `فاتورة #${sale.invoiceNumber}`,
                        user: sale.customerName,
                        branchId: sale.branchId
                    });
                }
            });
        });

        purchaseInvoices.forEach((purchase: PurchaseInvoice) => {
            purchase.items.forEach((item: any) => {
                if (item.productId === product.id) {
                     allMovements.push({
                        id: `purchase-${purchase.id}-${item.id}`,
                        date: purchase.date,
                        type: 'شراء',
                        quantityChange: item.quantity,
                        relatedDoc: `فاتورة شراء #${purchase.id}`,
                        user: 'System',
                        branchId: purchase.branchId
                    });
                }
            });
        });
        
        inventoryAdjustmentLogs.filter((log: InventoryAdjustmentLog) => log.productId === product.id).forEach((log: InventoryAdjustmentLog) => {
             allMovements.push({
                id: `adj-${log.id}`,
                date: log.date,
                type: `تعديل (${log.reason})`,
                quantityChange: log.newQuantity - log.oldQuantity,
                relatedDoc: `تعديل يدوي`,
                user: users.find((u:User) => u.id === log.adjustedByUserId)?.name || 'System',
                branchId: log.branchId
            });
        });

        // Group movements by branchId
        const movementsByBranch = allMovements.reduce((acc, mov) => {
            if (!acc[mov.branchId]) {
                acc[mov.branchId] = [];
            }
            acc[mov.branchId].push(mov);
            return acc;
        }, {} as Record<number, any[]>);

        let finalMovements: InventoryMovement[] = [];

        // For each branch, calculate running total backwards
        Object.keys(movementsByBranch).forEach(branchIdStr => {
            const branchId = Number(branchIdStr);
            const branchMovements = movementsByBranch[branchId];

            // Sort this branch's movements reverse-chronologically (newest first)
            branchMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const currentStockItem = inventory.find((i: InventoryItem) => i.productId === product.id && i.branchId === branchId);
            let runningStock = currentStockItem ? currentStockItem.quantity : 0;
            
            const processedMovements = branchMovements.map((mov: any) => {
                const movWithStock = { ...mov, quantityAfter: runningStock };
                runningStock -= mov.quantityChange; // Work backwards to find previous stock
                return movWithStock;
            });
            
            finalMovements.push(...processedMovements);
        });

        // Final sort to display all movements chronologically (newest first)
        return finalMovements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [product.id, sales, purchaseInvoices, inventoryAdjustmentLogs, users, inventory]);


    return (
         <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>العملية</th>
                        <th>حركة</th>
                        <th>المخزون بعد</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map(m => (
                        <tr key={m.id}>
                            <td>
                                <p style={{fontWeight: 600}}>{m.relatedDoc}</p>
                                <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                    {new Date(m.date).toLocaleString('ar-EG')} بواسطة {m.user} في {branches.find((b:Branch) => b.id === m.branchId)?.name}
                                </p>
                            </td>
                            <td style={{fontWeight: 'bold', color: m.quantityChange > 0 ? 'var(--secondary-color)' : '#ef4444'}}>
                                {m.quantityChange > 0 ? '+' : ''}{m.quantityChange.toLocaleString()}
                            </td>
                            <td style={{fontWeight: 'bold'}}>
                                {m.quantityAfter.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                     {movements.length === 0 && (
                        <tr>
                            <td colSpan={3} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                                لا توجد حركات مخزنية مسجلة لهذا المنتج.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
    )
};


const TimelineTab = () => <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>Timeline View Coming Soon</div>;
const ActivityLogTab = () => <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>Activity Log View Coming Soon</div>;

const StatCard = ({ label, value, change, comparisonText, helpText }: any) => (
    <div className="product-stat-card">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label} {helpText && <span title={helpText}>&#9432;</span>}</div>
        {change && <div className={`stat-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>{change}</div>}
        {comparisonText && <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{comparisonText}</div>}
    </div>
);

const DetailItem = ({ label, value }: any) => (
    <div>
        <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>{label}</p>
        <p style={{fontWeight: 600}}>{value}</p>
    </div>
);


export default ProductDetailPage;
