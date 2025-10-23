

import React, { useState, useContext, ChangeEvent, useMemo } from 'react';
import { AuthContext } from '../App';
import { PurchaseInvoice, InvoiceData, Branch, Product, PurchaseInvoiceItem, PurchaseOrderSuggestionContext, SuggestedPurchaseOrderItem, Sale, InventoryItem, Supplier } from '../types';
import { getPurchaseOrderSuggestion, scanInvoiceWithGemini } from '../services/geminiService';
import { SparklesIcon, PencilIcon, CheckCircleIcon, XCircleIcon, PlusIcon, TrashIcon } from '../components/Icon';
import PurchaseDetailModal from '../components/PurchaseDetailModal';
import { useToasts } from '../components/Toast';
import AIPurchaseOrderModal from '../components/AIPurchaseOrderModal';

interface PurchaseInvoicesProps {
    invoices: PurchaseInvoice[];
    onSave: (invoice: PurchaseInvoice) => void;
    branches: Branch[];
    products: Product[];
    sales: Sale[];
    inventory: InventoryItem[];
    suppliers: Supplier[];
}

const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = ({ invoices, onSave, branches, products, sales, inventory, suppliers }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [isScanning, setIsScanning] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scannedTotal, setScannedTotal] = useState<number | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        branch: 'all',
        supplier: 'all',
        paymentStatus: 'all',
    });

    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [editedInvoice, setEditedInvoice] = useState<Partial<PurchaseInvoice> | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            branch: 'all',
            supplier: 'all',
            paymentStatus: 'all',
        });
    };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(p => {
            const branchMatch = filters.branch === 'all' || p.branchId === parseInt(filters.branch, 10);
            const supplierMatch = filters.supplier === 'all' || p.supplierId === parseInt(filters.supplier, 10);
            const statusMatch = filters.paymentStatus === 'all' || p.paymentStatus === filters.paymentStatus;
            return branchMatch && supplierMatch && statusMatch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, filters]);


    const hasPermission = (permission: 'create' | 'update' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`purchases:${permission}`);
    };

    // --- Inline Editing Handlers ---
    const handleEditClick = (invoice: PurchaseInvoice) => {
        setEditingRowId(invoice.id);
        setEditedInvoice(JSON.parse(JSON.stringify(invoice))); // Deep copy for editing
    };

    const handleCancelEdit = () => {
        setEditingRowId(null);
        setEditedInvoice(null);
    };

    const handleSaveEdit = () => {
        if (editedInvoice) {
            onSave(editedInvoice as PurchaseInvoice);
            addToast('Invoice updated successfully!', 'success');
            handleCancelEdit();
        }
    };
    
    const handleEditedDataChange = (field: keyof PurchaseInvoice, value: any) => {
        setEditedInvoice(prev => {
            if (!prev) return null;
            const updated = { ...prev, [field]: value };
            
            if (field === 'items') {
                 const totalInCurrency = (value || []).reduce((acc: number, item: PurchaseInvoiceItem) => acc + item.total, 0);
                 const amount = totalInCurrency * (updated.exchangeRate || 1);
                 updated.amountInCurrency = totalInCurrency;
                 updated.amount = amount;
            }
            
            return updated;
        });
    };

    const handleItemChange = (index: number, field: keyof PurchaseInvoiceItem, value: any) => {
        if (!editedInvoice || !editedInvoice.items) return;
        
        const newItems = [...editedInvoice.items];
        const item = { ...newItems[index] };

        if (field === 'productId') {
            const product = products.find(p => p.id === Number(value));
            item.productId = Number(value);
            item.productName = product?.name || '';
            item.unitPrice = product?.purchasePrice || 0;
        } else {
            (item as any)[field] = value;
        }
        
        item.total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        newItems[index] = item;
        handleEditedDataChange('items', newItems);
    };

    const handleAddItem = () => {
        const newItem: PurchaseInvoiceItem = { id: Date.now(), productId: 0, productName: '', quantity: 1, unitPrice: 0, total: 0 };
        handleEditedDataChange('items', [...(editedInvoice?.items || []), newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = (editedInvoice?.items || []).filter((_, i) => i !== index);
        handleEditedDataChange('items', newItems);
    };


    // --- Modal and AI Handlers ---
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        // ... (existing code for AI scan)
    };
    
    const handleSaveFromModal = (invoice: PurchaseInvoice) => {
        onSave(invoice);
        handleCloseModal();
        addToast('تم حفظ فاتورة الشراء بنجاح!', 'success');
    };

    const handleAddNew = () => {
        setSelectedInvoice({} as PurchaseInvoice);
        setScannedTotal(null);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
        setScannedTotal(null);
    };

    const handleGenerateAISuggestions = async (branchId: number, forecastDays: number, historyDays: number): Promise<SuggestedPurchaseOrderItem[]> => {
        // ... (existing code)
        return [];
    };

    const handleCreatePoFromSuggestion = (items: { productId: number; quantity: number; unitPrice: number; }[]) => {
       // ... (existing code)
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>إدارة فواتير الشراء</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>أضف فاتورة، أو استخدم الأدوات الذكية، أو قم بتعديل الفواتير مباشرة.</p>
                    </div>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* <button onClick={() => setIsAiModalOpen(true)} className="btn btn-primary">
                            <SparklesIcon style={{width: '20px', height: '20px'}}/>
                            <span>اقتراح أمر شراء (AI)</span>
                        </button>
                        <label className={`btn btn-warning ${isScanning ? 'opacity-50' : ''}`}>
                            <SparklesIcon style={{width: '20px', height: '20px'}}/>
                            <span>{isScanning ? 'جاري المسح...' : 'مسح فاتورة (AI)'}</span>
                            <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={isScanning} accept="image/png, image/jpeg, application/pdf" />
                        </label> */}
                        {hasPermission('create') && <button onClick={handleAddNew} className="btn btn-primary"><PlusIcon style={{width: '20px', height: '20px'}}/> فاتورة جديدة</button>}
                   </div>
                </div>

                <div className="glass-pane" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>سجل فواتير المشتريات</h3>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
                        <select name="branch" value={filters.branch} onChange={handleFilterChange} className="form-select" style={{flexBasis: '220px'}}>
                            <option value="all">كل الفروع</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <select name="supplier" value={filters.supplier} onChange={handleFilterChange} className="form-select" style={{flexBasis: '220px'}}>
                            <option value="all">كل الموردين</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="form-select" style={{flexBasis: '180px'}}>
                            <option value="all">كل حالات الدفع</option>
                            <option value="Paid">مدفوع</option>
                            <option value="Pending">قيد الانتظار</option>
                            <option value="Overdue">متأخر</option>
                        </select>
                        <button onClick={resetFilters} className="btn btn-ghost" style={{ marginRight: 'auto' }}>إعادة تعيين</button>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>المعرف</th>
                                    <th>العلامة التجارية</th>
                                    <th>المورد</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ (د.ك)</th>
                                    <th>حالة الدفع</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(p => {
                                    const isEditing = editingRowId === p.id;
                                    return (
                                    <React.Fragment key={p.id}>
                                        <tr style={{backgroundColor: isEditing ? 'var(--highlight-selected)' : 'transparent'}}>
                                            <td>{p.id}</td>
                                            <td>{isEditing ? (
                                                <select value={editedInvoice?.brand} onChange={e => handleEditedDataChange('brand', e.target.value)} className="form-select">
                                                    <option value="Arabiva">Arabiva</option>
                                                    <option value="Generic">Generic</option>
                                                </select>
                                            ) : p.brand}</td>
                                            <td>{isEditing ? (
                                                <select value={editedInvoice?.supplierId} onChange={e => handleEditedDataChange('supplierId', Number(e.target.value))} className="form-select">
                                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            ) : suppliers.find(s => s.id === p.supplierId)?.name}</td>
                                            <td>{isEditing ? <input type="date" value={editedInvoice?.date || ''} onChange={e => handleEditedDataChange('date', e.target.value)} className="form-input" /> : p.date}</td>
                                            <td style={{ color: '#34d399', fontWeight: '600' }}>{p.amount.toLocaleString()} د.ك</td>
                                            <td>{isEditing ? (
                                                <select value={editedInvoice?.paymentStatus} onChange={e => handleEditedDataChange('paymentStatus', e.target.value)} className="form-select">
                                                    <option value="Paid">مدفوع</option>
                                                    <option value="Pending">قيد الانتظار</option>
                                                    <option value="Overdue">متأخر</option>
                                                </select>
                                            ) : (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
                                                    color: p.paymentStatus === 'Pending' ? '#111' : '#fff',
                                                    background: p.paymentStatus === 'Paid' ? '#10b981' : p.paymentStatus === 'Pending' ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {p.paymentStatus === 'Paid' ? 'مدفوع' : p.paymentStatus === 'Pending' ? 'قيد الانتظار' : 'متأخر'}
                                                </span>
                                            )}</td>
                                            <td>
                                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={handleSaveEdit} title="Save" className="btn btn-ghost" style={{padding: '0.25rem'}}><CheckCircleIcon style={{width: 22, height: 22, color: 'var(--secondary-color)'}} /></button>
                                                            <button onClick={handleCancelEdit} title="Cancel" className="btn btn-ghost" style={{padding: '0.25rem'}}><XCircleIcon style={{width: 22, height: 22, color: '#ef4444'}}/></button>
                                                        </>
                                                    ) : (
                                                        hasPermission('update') && <button onClick={() => handleEditClick(p)} title="Edit" className="btn btn-ghost" style={{padding: '0.25rem'}}><PencilIcon style={{width:20, height:20}} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {isEditing && editedInvoice && (
                                            <tr>
                                                <td colSpan={7} style={{padding: '1rem', background: 'color-mix(in srgb, var(--surface-bg) 50%, transparent)'}}>
                                                    <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>تعديل بنود الفاتورة</h4>
                                                    <div className="table-wrapper">
                                                        <table>
                                                            <thead><tr><th>المنتج</th><th style={{width: '100px'}}>الكمية</th><th style={{width: '120px'}}>سعر الوحدة</th><th style={{width: '120px'}}>الإجمالي</th><th></th></tr></thead>
                                                            <tbody>
                                                                {editedInvoice.items?.map((item, index) => (
                                                                    <tr key={item.id}>
                                                                        <td><select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="form-select"><option>اختر...</option>{products.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}</select></td>
                                                                        <td><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="form-input" /></td>
                                                                        <td><input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="form-input" /></td>
                                                                        <td>{item.total.toLocaleString()}</td>
                                                                        <td><button onClick={() => handleRemoveItem(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width: 20, height: 20}} /></button></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem'}}>
                                                        <button onClick={handleAddItem} className="btn btn-ghost"><PlusIcon style={{width:20, height:20}}/> إضافة بند</button>
                                                        <div style={{fontWeight: 'bold'}}>الإجمالي: {editedInvoice.amount?.toLocaleString()} د.ك</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && selectedInvoice && (
                <PurchaseDetailModal
                    purchase={selectedInvoice}
                    onClose={handleCloseModal}
                    onSave={handleSaveFromModal}
                    branches={branches}
                    products={products}
                    suppliers={suppliers}
                    scannedTotal={scannedTotal}
                />
            )}
            {isAiModalOpen && (
                <AIPurchaseOrderModal 
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    branches={branches}
                    onGenerate={handleGenerateAISuggestions}
                    onCreatePO={handleCreatePoFromSuggestion}
                />
            )}
        </>
    );
};

export default PurchaseInvoices;
