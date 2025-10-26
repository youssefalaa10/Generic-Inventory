import React, { ChangeEvent, useContext, useState } from 'react';
import { AuthContext } from '../App';
// FIX: Replaced non-existent types 'Purchase' and 'PurchaseItem' with 'PurchaseInvoice' and 'PurchaseInvoiceItem'.
import AIPurchaseOrderModal from '../components/AIPurchaseOrderModal';
import { SparklesIcon } from '../components/Icon';
import PurchaseDetailModal from '../components/PurchaseDetailModal';
import { useToasts } from '../components/Toast';
import { useAppSelector, useAppDispatch, selectAll, slices } from '../src/store';
import { getPurchaseOrderSuggestion, scanInvoiceWithGemini } from '../services/geminiService';
import { Branch, InventoryItem, InvoiceData, Product, PurchaseInvoice, PurchaseInvoiceItem, PurchaseOrderSuggestionContext, Sale, SuggestedPurchaseOrderItem, Supplier } from '../types';

interface PurchaseInvoicesProps {
    // Props removed - now using Redux
}

const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const dispatch = useAppDispatch();
    
    // Get data from Redux store
    const invoices = useAppSelector(s => selectAll(s, 'purchaseinvoices')) as PurchaseInvoice[];
    const branches = useAppSelector(s => selectAll(s, 'branchinventories')) as Branch[];
    const products = useAppSelector(s => selectAll(s, 'products')) as Product[];
    const sales = useAppSelector(s => selectAll(s, 'sales')) as Sale[];
    const inventory = useAppSelector(s => selectAll(s, 'inventoryitems')) as InventoryItem[];
    const suppliers = useAppSelector(s => selectAll(s, 'suppliers')) as Supplier[];
    
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [scannedTotal, setScannedTotal] = useState<number | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    const hasPermission = (permission: 'create' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`purchases:${permission}`);
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const mimeType = file.type;
                
                addToast('جاري مسح الفاتورة بالذكاء الاصطناعي...', 'info');
                const extractedData: InvoiceData = await scanInvoiceWithGemini(base64Image, mimeType);
                
                setScannedTotal(extractedData.amount || null);
                
                const supplier = suppliers.find(s => s.name.toLowerCase().includes((extractedData.vendor || '').toLowerCase()));

                const scannedInvoice: Partial<PurchaseInvoice> = {
                    supplierId: supplier?.id,
                    date: extractedData.date || new Date().toISOString().split('T')[0],
                    items: [],
                    paymentStatus: 'Pending',
                    type: 'Local'
                };
                setSelectedInvoice(scannedInvoice as PurchaseInvoice);
                setIsModalOpen(true);
                addToast('تم مسح الفاتورة بنجاح! يرجى مراجعة البيانات وإضافة الأصناف.', 'success');
            };
            reader.onerror = () => {
                 setScanError("فشل في قراءة الملف.");
                 addToast('فشل في قراءة الملف.', 'error');
            }
        } catch (error) {
            console.error("Error scanning invoice:", error);
            setScanError("حدث خطأ أثناء مسح الفاتورة ضوئيًا. يرجى المحاولة مرة أخرى.");
            addToast('خطأ في مسح الفاتورة.', 'error');
        } finally {
            setIsScanning(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    
    const handleSave = (invoice: PurchaseInvoice) => {
        const hasId = (invoice as any)._id || invoice.id;
        const idForApi = String((invoice as any)._id || invoice.id || '');
        const payload: Partial<PurchaseInvoice> = { ...invoice };
        if ((payload as any)._id) delete (payload as any)._id;
        
        if (hasId) {
            dispatch(slices.purchaseinvoices.thunks.updateOne({ id: idForApi, body: payload }))
                .unwrap()
                .then(() => {
                    addToast('تم تحديث فاتورة الشراء بنجاح!', 'success');
                    handleCloseModal();
                })
                .catch(() => addToast('فشل تحديث فاتورة الشراء', 'error'));
        } else {
            dispatch(slices.purchaseinvoices.thunks.createOne(payload))
                .unwrap()
                .then(() => {
                    addToast('تم إضافة فاتورة الشراء بنجاح!', 'success');
                    handleCloseModal();
                })
                .catch(() => addToast('فشل إضافة فاتورة الشراء', 'error'));
        }
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
        const branch = branches.find(b => b.id === branchId);
        if (!branch) throw new Error("Branch not found");

        const historyStartDate = new Date();
        historyStartDate.setDate(historyStartDate.getDate() - historyDays);

        const salesForBranch = sales.filter(s => s.branchId === branchId && new Date(s.date) >= historyStartDate);
        const inventoryForBranch = inventory.filter(i => i.branchId === branchId);

        const productSalesData = salesForBranch.flatMap(s => s.items).reduce((acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
        }, {} as Record<number, number>);

        const context: PurchaseOrderSuggestionContext = {
            branchName: branch.name,
            forecastDays: forecastDays,
            inventory: inventoryForBranch.map(invItem => {
                const product = products.find(p => p.id === invItem.productId);
                const totalSold = productSalesData[invItem.productId] || 0;
                return {
                    productId: invItem.productId,
                    productName: product?.name || 'Unknown',
                    sku: product?.sku || 'N/A',
                    currentStock: invItem.quantity,
                    minStock: invItem.minStock,
                    salesVelocityPerDay: totalSold / historyDays,
                };
            }),
        };

        return await getPurchaseOrderSuggestion(context);
    };

    const handleCreatePoFromSuggestion = (items: { productId: number; quantity: number; unitPrice: number; }[]) => {
        const poItems: PurchaseInvoiceItem[] = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                id: Date.now() + Math.random(),
                productName: product?.name || 'Unknown',
                total: item.quantity * item.unitPrice,
            };
        });

        const suggestedPurchase: Partial<PurchaseInvoice> = {
            date: new Date().toISOString().split('T')[0],
            items: poItems,
            paymentStatus: 'Pending',
            type: 'Local'
        };

        setIsAiModalOpen(false);
        setSelectedInvoice(suggestedPurchase as PurchaseInvoice);
        setIsModalOpen(true);
    };


    const filteredInvoices = filterBranch === 'all' 
        ? invoices 
        : invoices.filter(p => p.branchId === parseInt(filterBranch));

    return (
        <>
            <div className="purchase-invoices-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-pane purchase-invoices-header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h3 className="purchase-invoices-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>إضافة فاتورة شراء</h3>
                        <p className="purchase-invoices-description" style={{ color: 'var(--text-secondary)' }}>أضف فاتورة يدوياً أو استخدم الأدوات الذكية</p>
                    </div>
                   <div className="purchase-invoices-actions" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setIsAiModalOpen(true)} className="btn btn-primary purchase-invoices-button">
                            <SparklesIcon style={{width: '20px', height: '20px'}}/>
                            <span>اقتراح أمر شراء (AI)</span>
                        </button>
                        <label className={`btn btn-warning purchase-invoices-button ${isScanning ? 'opacity-50' : ''}`}>
                            <SparklesIcon style={{width: '20px', height: '20px'}}/>
                            <span>{isScanning ? 'جاري المسح...' : 'مسح فاتورة (AI)'}</span>
                            <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={isScanning} accept="image/png, image/jpeg, application/pdf" />
                        </label>
                        {hasPermission('create') && <button onClick={handleAddNew} className="btn btn-ghost purchase-invoices-button">إضافة يدوية</button>}
                   </div>
                </div>

                <div className="glass-pane purchase-invoices-section" style={{ padding: '1.5rem' }}>
                    <div className="purchase-invoices-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="purchase-invoices-section-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>سجل فواتير المشتريات</h3>
                        <div className="purchase-invoices-filter" style={{ width: '250px' }}>
                            <select onChange={(e) => setFilterBranch(e.target.value)} value={filterBranch} className="form-select">
                                <option value="all">كل الفروع</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="purchase-invoices-table-wrapper table-wrapper">
                        <table className="purchase-invoices-table">
                            <thead>
                                <tr>
                                    <th>المعرف</th>
                                    <th>العلامة التجارية</th>
                                    <th>المورد</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ (د.ك)</th>
                                    <th>حالة الدفع</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(p => (
                                    <tr key={p.id} style={{cursor: 'pointer'}} onClick={() => { setSelectedInvoice(p); setIsModalOpen(true); }}>
                                        <td>{p.id}</td>
                                        <td>{p.brand}</td>
                                        <td>{suppliers.find(s => s.id === p.supplierId)?.name}</td>
                                        <td>{p.date}</td>
                                        <td className="purchase-invoices-amount" style={{ color: '#34d399', fontWeight: '600' }}>{p.amount.toLocaleString()} د.ك</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px',
                                                color: p.paymentStatus === 'Pending' ? '#111' : '#fff',
                                                background: p.paymentStatus === 'Paid' ? '#10b981' : p.paymentStatus === 'Pending' ? '#f59e0b' : '#ef4444'
                                            }}>
                                                {p.paymentStatus === 'Paid' ? 'مدفوع' : p.paymentStatus === 'Pending' ? 'قيد الانتظار' : 'متأخر'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && selectedInvoice && (
                <PurchaseDetailModal
                    purchase={selectedInvoice}
                    onClose={handleCloseModal}
                    onSave={handleSave}
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