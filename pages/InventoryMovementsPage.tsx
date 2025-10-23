import React, { useMemo, useState } from 'react';
import { InventoryMovement, Sale, PurchaseInvoice, InventoryAdjustmentLog, Product, Branch, User, SaleItem } from '../types';

interface InventoryMovementsPageProps {
    sales: Sale[];
    purchaseInvoices: PurchaseInvoice[];
    inventoryAdjustmentLogs: InventoryAdjustmentLog[];
    products: Product[];
    branches: Branch[];
    users: User[];
}

const InventoryMovementsPage: React.FC<InventoryMovementsPageProps> = ({ sales, purchaseInvoices, inventoryAdjustmentLogs, products, branches, users }) => {
    
    const [filters, setFilters] = useState({
        productId: 'all',
        branchId: 'all',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const allMovements = useMemo(() => {
        const movements: (Omit<InventoryMovement, 'quantityAfter'> & { productId: number })[] = [];

        sales.forEach(sale => {
            sale.items.forEach(item => {
                movements.push({
                    id: `sale-${sale.id}-${item.id}`,
                    date: sale.date,
                    type: 'بيع',
                    quantityChange: -item.quantity,
                    relatedDoc: `فاتورة #${sale.invoiceNumber}`,
                    user: sale.customerName,
                    branchId: sale.branchId,
                    productId: item.productId,
                });
            });
        });

        purchaseInvoices.forEach(purchase => {
            purchase.items.forEach(item => {
                movements.push({
                    id: `purchase-${purchase.id}-${item.id}`,
                    date: purchase.date,
                    type: 'شراء',
                    quantityChange: item.quantity,
                    relatedDoc: `فاتورة شراء #${purchase.id}`,
                    user: 'System',
                    branchId: purchase.branchId,
                    productId: item.productId,
                });
            });
        });
        
        inventoryAdjustmentLogs.forEach(log => {
             movements.push({
                id: `adj-${log.id}`,
                date: log.date,
                type: `تعديل (${log.reason})`,
                quantityChange: log.newQuantity - log.oldQuantity,
                relatedDoc: `تعديل يدوي`,
                user: users.find(u => u.id === log.adjustedByUserId)?.name || 'System',
                branchId: log.branchId,
                productId: log.productId,
            });
        });
        
        // Add other movement types here like returns, transfers if data becomes available.

        return movements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, purchaseInvoices, inventoryAdjustmentLogs, users]);

    const filteredMovements = useMemo(() => {
        return allMovements.filter(m => {
            const date = new Date(m.date);
            const productMatch = filters.productId === 'all' || m.productId === parseInt(filters.productId);
            const branchMatch = filters.branchId === 'all' || m.branchId === parseInt(filters.branchId);
            const startDateMatch = !filters.startDate || date >= new Date(filters.startDate);
            let endDateMatch = true;
             if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999); // Include the whole day
                endDateMatch = date <= end;
            }
            return productMatch && branchMatch && startDateMatch && endDateMatch;
        });
    }, [allMovements, filters]);

    const getProductName = (id: number) => products.find(p => p.id === id)?.name || 'Unknown';
    const getBranchName = (id: number) => branches.find(b => b.id === id)?.name || 'Unknown';

    return (
        <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>تتبع حركة المخزون</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.5rem' }}>
                <select name="productId" value={filters.productId} onChange={handleFilterChange} className="form-select">
                    <option value="all">كل المنتجات</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="branchId" value={filters.branchId} onChange={handleFilterChange} className="form-select">
                    <option value="all">كل الفروع</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-input" />
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-input" />
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>التاريخ والوقت</th>
                            <th>المنتج</th>
                            <th>الفرع</th>
                            <th>النوع</th>
                            <th>التغيير في الكمية</th>
                            <th>المستند المرتبط</th>
                            <th>المستخدم</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.map(m => (
                            <tr key={m.id}>
                                <td>{new Date(m.date).toLocaleString('ar-EG')}</td>
                                <td>{getProductName(m.productId)}</td>
                                <td>{getBranchName(m.branchId)}</td>
                                <td>{m.type}</td>
                                <td style={{fontWeight: 'bold', color: m.quantityChange > 0 ? 'var(--secondary-color)' : '#ef4444'}}>
                                    {m.quantityChange > 0 ? '+' : ''}{m.quantityChange.toLocaleString()}
                                </td>
                                <td>{m.relatedDoc}</td>
                                <td>{m.user}</td>
                            </tr>
                        ))}
                         {filteredMovements.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                                    لا توجد حركات مخزنية تطابق معايير البحث.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryMovementsPage;