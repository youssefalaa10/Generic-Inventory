import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Product, InventoryItem, Sale, SaleItem, PaymentMethod, IntegrationSettings, Customer, Branch } from '../types';
import { AuthContext } from '../App';
import { useToasts } from '../components/Toast';
import { PlusIcon, MinusIcon, TrashIcon, ShoppingCartIcon, UserAddIcon, SearchIcon, FolderDownloadIcon, SaveIcon, XIcon } from '../components/Icon';
import PaymentModal from '../components/PaymentModal';
import SaleCompleteModal from '../components/SaleCompleteModal';
import QuantityInputModal from '../components/QuantityInputModal';
import CustomerModal from '../components/CustomerModal';
import MyFatoorahLinkModal from '../components/MyFatoorahLinkModal';


interface POSProps {
    products: Product[];
    inventory: InventoryItem[];
    customers: Customer[];
    onSaveCustomer: (customer: Customer) => Customer;
    onSave: (sale: Sale) => void;
    integrationSettings: IntegrationSettings;
    branches: Branch[];
    posView?: 'default' | 'kuwaitMagic';
}

type ParkedSale = {
    id: number;
    timestamp: Date;
    items: SaleItem[];
    customerId?: number;
    customerName: string;
}

const POS: React.FC<POSProps> = ({ products, inventory, customers, onSaveCustomer, onSave, integrationSettings, branches, posView = 'default' }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState<Sale | null>(null);
    const [isQtyModalOpen, setQtyModalOpen] = useState(false);
    const [productForQty, setProductForQty] = useState<(Product & {stock: number}) | null>(null);
    
    // Payment Link Modal State
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

    // New features state
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);
    const [isParkedSalesModalOpen, setParkedSalesModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);

    useEffect(() => {
        // Set default customer on mount
        const cashCustomer = customers.find(c => c.id === 4); // ID 4 is "زبون نقدي عام"
        if(cashCustomer) {
            setSelectedCustomer(cashCustomer);
        }
    }, [customers]);

    const availableProducts = useMemo(() => {
        if (!user?.branchId) return [];
        const branchInventory = inventory.filter(i => i.branchId === user.branchId);
        
        return products.map(product => {
            let stock = 0;
            // For Sets, calculate availability based on components
            if (product.category === 'Set' && product.components && product.components.length > 0) {
                let maxSets = Infinity;
                for (const component of product.components) {
                    const componentInventory = branchInventory.find(i => i.productId === component.productId);
                    const componentStock = componentInventory ? componentInventory.quantity : 0;
                    const possibleSetsFromComponent = Math.floor(componentStock / component.quantity);
                    if (possibleSetsFromComponent < maxSets) {
                        maxSets = possibleSetsFromComponent;
                    }
                }
                stock = maxSets === Infinity ? 0 : maxSets;
            } else {
                 // For regular products, find direct inventory
                const inventoryItem = branchInventory.find(i => i.productId === product.id);
                stock = inventoryItem ? inventoryItem.quantity : 0;
            }
            
            return { ...product, stock };
        });
    }, [inventory, products, user]);

    const productCategories = useMemo(() => {
        if (posView === 'kuwaitMagic') {
            return ['all'];
        }
        return ['all', ...new Set(products.map(p => p.category))];
    }, [products, posView]);

    const filteredProducts = useMemo(() => {
        if (posView === 'kuwaitMagic') {
            return availableProducts.filter(p => p.category === 'Set');
        }
        if (selectedCategory === 'all') return availableProducts;
        return availableProducts.filter(p => p.category === selectedCategory);
    }, [availableProducts, selectedCategory, posView]);


    const handleProductClick = (product: Product & { stock: number }) => {
        if (product.stock <= 0) {
            addToast('هذا المنتج غير متوفر في المخزون.', 'error');
            return;
        }
        
        if (product.baseUnit === 'g' || product.baseUnit === 'ml') {
            setProductForQty(product);
            setQtyModalOpen(true);
        } else {
            const existingItem = cart.find(item => item.productId === product.id);
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    updateQuantity(product.id, 1);
                } else {
                    addToast(`لا يوجد المزيد من ${product.name} في المخزون.`, 'info');
                }
            } else {
                const newItem: SaleItem = {
                    id: Date.now(),
                    productId: product.id,
                    productName: product.name,
                    quantity: 1,
                    unitPrice: product.unitPrice,
                    total: product.unitPrice
                };
                setCart(prevCart => [...prevCart, newItem]);
            }
        }
    };
    
    const addCustomQuantityToCart = (product: Product, quantity: number) => {
        const stockItem = availableProducts.find(p => p.id === product.id);
        if (!stockItem || quantity > stockItem.stock) {
            addToast(`الكمية المطلوبة تتجاوز المخزون المتاح (${stockItem?.stock || 0}).`, 'error');
            return;
        }
        
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
             setCart(prevCart => prevCart.map(item =>
                item.productId === product.id 
                ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.unitPrice } 
                : item
            ));
        } else {
            const newItem: SaleItem = {
                id: Date.now(),
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                unitPrice: product.unitPrice,
                total: product.unitPrice * quantity
            };
            setCart(prevCart => [...prevCart, newItem]);
        }
        setQtyModalOpen(false);
        setProductForQty(null);
    };
    
    const updateQuantity = (productId: number, delta: number) => {
        setCart(currentCart => {
            const itemInCart = currentCart.find(item => item.productId === productId);
            const productInStock = availableProducts.find(p => p.id === productId);
            if (!itemInCart || !productInStock) return currentCart;
            
            if (productInStock.baseUnit !== 'pcs') {
                 addToast('لا يمكن تعديل كمية هذا المنتج من هنا.', 'info');
                 return currentCart;
            }

            const newQuantity = itemInCart.quantity + delta;
            if (newQuantity > productInStock.stock) {
                addToast(`متوفر فقط ${productInStock.stock} من ${productInStock.name}.`, 'info');
                return currentCart;
            }

            if (newQuantity <= 0) {
                return currentCart.filter(item => item.productId !== productId);
            }

            return currentCart.map(item =>
                item.productId === productId ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice } : item
            );
        });
    };
    
    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const { subtotal, tax, total } = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
        const tax = 0;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);

    const handlePaymentConfirm = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        if (paymentMethod === 'Credit' || paymentMethod === 'MyFatoorah') {
            setPaymentModalOpen(false);
            setLinkModalOpen(true);
        } else {
            handleFinalizeSale(paymentMethod);
        }
    };
    
    const handleFinalizeSale = (paymentMethod: PaymentMethod) => {
        if (!user?.branchId) return;

        const branch: Branch | undefined = branches.find(b => b.id === user.branchId);
        const project = branch ? (branch.projectId === 2 ? 'Arabiva' : 'Generic') : 'Generic';
        
        const newSale: Omit<Sale, 'id' | 'invoiceNumber'> = {
            brand: project as 'Arabiva' | 'Generic',
            branchId: user.branchId,
            customerName: selectedCustomer?.name || 'زبون نقدي عام',
            customerId: selectedCustomer?.id || 4, 
            date: new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod,
            paymentStatus: 'Paid',
            items: cart,
            totalAmount: total,
        };
        onSave(newSale as Sale);
        setCompletedSale(newSale as Sale);
        
        setPaymentModalOpen(false);
        setLinkModalOpen(false);
    };
    
    const startNewSale = () => {
        setCart([]);
        setCompletedSale(null);
        const cashCustomer = customers.find(c => c.id === 4);
        if(cashCustomer) setSelectedCustomer(cashCustomer);
    };

    const handleParkSale = () => {
        if (cart.length === 0) {
            addToast('لا يمكن تعليق سلة فارغة.', 'info');
            return;
        }
        const newParkedSale: ParkedSale = {
            id: Date.now(),
            timestamp: new Date(),
            items: cart,
            customerId: selectedCustomer?.id,
            customerName: selectedCustomer?.name || 'زبون نقدي عام'
        };
        setParkedSales(prev => [...prev, newParkedSale]);
        startNewSale();
        addToast(`تم تعليق الفاتورة بنجاح.`, 'success');
    };

    const handleRetrieveSale = (saleId: number) => {
        const saleToRetrieve = parkedSales.find(s => s.id === saleId);
        if (saleToRetrieve) {
            if (cart.length > 0 && !window.confirm('لديك عناصر في السلة الحالية. هل تريد استبدالها؟')) {
                return;
            }
            setCart(saleToRetrieve.items);
            const customer = customers.find(c => c.id === saleToRetrieve.customerId);
            setSelectedCustomer(customer || customers.find(c => c.id === 4) || null);
            setParkedSales(prev => prev.filter(s => s.id !== saleId));
            setParkedSalesModalOpen(false);
            addToast('تم استرجاع الفاتورة.', 'success');
        }
    };

    const handleDeleteParkedSale = (saleId: number) => {
        setParkedSales(prev => prev.filter(s => s.id !== saleId));
        addToast('تم حذف الفاتورة المعلقة.', 'info');
    };

    const handleSaveNewCustomer = (customer: Customer) => {
        const savedCustomer = onSaveCustomer(customer);
        setSelectedCustomer(savedCustomer);
        setCustomerModalOpen(false);
        addToast('تم إضافة العميل بنجاح!', 'success');
    };

    const customerSearchResults = useMemo(() => {
        if (customerSearchTerm.length < 2) return [];
        const term = customerSearchTerm.toLowerCase();
        return customers.filter(c => c.id !== 4 && (c.name.toLowerCase().includes(term) || c.phone.includes(term)));
    }, [customerSearchTerm, customers]);
    
    const formatCurrency = (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', height: 'calc(100vh - 110px)' }}>
                {/* Product Grid */}
                <div className="glass-pane" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {posView === 'default' && (
                         <div className="pos-category-bar">
                            {productCategories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`pos-category-btn ${selectedCategory === cat ? 'active' : ''}`}>
                                    {cat === 'all' ? 'الكل' : cat === 'Set' ? 'مجموعات' : cat}
                                </button>
                            ))}
                        </div>
                    )}
                   
                    <div style={{ flex: 1, overflowY: 'auto', padding: posView === 'default' ? '0 1.5rem 1.5rem 1.5rem' : '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                            {filteredProducts.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => p.stock > 0 && handleProductClick(p)}
                                    style={{
                                        padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)',
                                        textAlign: 'center', cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                                        opacity: p.stock > 0 ? 1 : 0.5, transition: 'all 0.2s ease', position: 'relative',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                                    }}
                                    onMouseEnter={(e) => { if (p.stock > 0) e.currentTarget.style.boxShadow = '0 0 15px var(--highlight-hover)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }} >
                                    <span style={{position: 'absolute', top: '8px', right: '8px', background: 'var(--surface-bg)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem'}}>
                                        المخزون: {(p.baseUnit === 'g' || p.baseUnit === 'ml') ? p.stock.toFixed(3) : p.stock.toLocaleString()} {p.baseUnit !== 'pcs' ? p.baseUnit : ''}
                                    </span>
                                    <div style={{height: '60px', marginBottom: '0.5rem', background: 'var(--highlight-hover)', borderRadius: '8px'}}></div>
                                    <div>
                                        <p style={{ fontWeight: 600, minHeight: '40px' }}>{p.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-0.25rem' }}>{p.sku}</p>
                                        <p style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                                            {p.unitPrice.toFixed(2)} د.ك {p.baseUnit !== 'pcs' ? ` / ${p.baseUnit}`: ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart */}
                <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                     <div className="pos-customer-section">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                            <h4 style={{fontSize: '1.1rem', fontWeight: 600}}>العميل: {selectedCustomer?.name}</h4>
                            <button className="btn btn-ghost" style={{padding: '0.5rem'}} onClick={() => setCustomerModalOpen(true)}>
                                <UserAddIcon style={{width: '20px', height: '20px'}} />
                            </button>
                        </div>
                        <div style={{position: 'relative'}}>
                            <input type="text" placeholder="ابحث عن عميل بالاسم أو الهاتف..." value={customerSearchTerm} onChange={e => setCustomerSearchTerm(e.target.value)} className="form-input" />
                            <SearchIcon style={{position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-placeholder)'}} />
                            {customerSearchResults.length > 0 && (
                                <div className="glass-pane" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20, maxHeight: '200px', overflowY: 'auto' }}>
                                    <ul style={{ listStyle: 'none', padding: '0.5rem', margin: 0 }}>
                                        {customerSearchResults.map(c => (
                                            <li key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearchTerm(''); }} style={{ padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--highlight-hover)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <p style={{ fontWeight: 600 }}>{c.name}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCartIcon style={{width: '28px', height: '28px'}} /> السلة</h3>
                        <span style={{color: 'var(--text-secondary)'}}>{cart.length} أصناف</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                        {cart.length === 0 ? (
                            <div style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem'}}>
                                <p>السلة فارغة</p>
                            </div>
                        ) : (
                            cart.map(item => {
                                const productInfo = availableProducts.find(p => p.id === item.productId);
                                const stock = productInfo ? productInfo.stock : 0;
                                const isAtMaxStock = productInfo?.baseUnit === 'pcs' && item.quantity >= stock;

                                return (
                                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                                    <div style={{flex: 1}}>
                                        <p style={{ fontWeight: 600 }}>{item.productName}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            SKU: {productInfo?.sku}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {(productInfo?.baseUnit === 'g' || productInfo?.baseUnit === 'ml') ? item.quantity.toFixed(3) : item.quantity} {productInfo?.baseUnit !== 'pcs' ? productInfo?.baseUnit : ''} x {item.unitPrice.toFixed(2)} د.ك
                                        </p>
                                    </div>
                                    {productInfo?.baseUnit === 'pcs' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="btn-ghost" style={{width: '32px', height: '32px', padding: 0, borderRadius: '50%'}}><MinusIcon style={{width: '16px', height: '16px'}}/></button>
                                        <span style={{width: '2rem', textAlign: 'center', fontWeight: '600'}}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="btn-ghost" style={{width: '32px', height: '32px', padding: 0, borderRadius: '50%', opacity: isAtMaxStock ? 0.5 : 1}} disabled={isAtMaxStock}>
                                            <PlusIcon style={{width: '16px', height: '16px'}}/>
                                        </button>
                                    </div>
                                    ) : <div style={{width: '106px'}}></div>}
                                    <p style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>{item.total.toFixed(2)} د.ك</p>
                                     <button onClick={() => removeFromCart(item.productId)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width:'20px', height:'20px'}}/></button>
                                </div>
                            )})
                        )}
                    </div>
                    {cart.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                <span>المجموع الفرعي</span>
                                <span>{formatCurrency(subtotal)} د.ك</span>
                            </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                <span>الضريبة (0%)</span>
                                <span>{formatCurrency(tax)} د.ك</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', padding: '1rem 0', borderTop: '1px solid var(--surface-border)' }}>
                                <span>الإجمالي</span>
                                <span style={{color: 'var(--primary-color)'}}>{formatCurrency(total)} د.ك</span>
                            </div>
                        </div>
                    )}
                     <div style={{display: 'flex', gap: '0.5rem', marginTop: 'auto'}}>
                        <button onClick={handleParkSale} className="btn btn-warning" style={{flex: 1}} disabled={cart.length === 0}><SaveIcon style={{width: '20px', height: '20px'}}/> تعليق</button>
                        <button onClick={() => setParkedSalesModalOpen(true)} className="btn btn-ghost" style={{flex: 1}} disabled={parkedSales.length === 0}><FolderDownloadIcon style={{width: '20px', height: '20px'}}/> استرجاع ({parkedSales.length})</button>
                    </div>
                    <button onClick={() => setPaymentModalOpen(true)} className="btn btn-secondary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem' }} disabled={cart.length === 0}>
                        الدفع
                    </button>
                </div>
            </div>
            
            {isPaymentModalOpen && (
                <PaymentModal 
                    totalAmount={total}
                    onClose={() => setPaymentModalOpen(false)}
                    onConfirm={handlePaymentConfirm}
                    integrationSettings={integrationSettings}
                />
            )}
            
            {completedSale && (
                <SaleCompleteModal
                    sale={completedSale}
                    onNewSale={startNewSale}
                    products={products}
                    integrationSettings={integrationSettings}
                />
            )}
            
            {isQtyModalOpen && productForQty && (
                <QuantityInputModal
                    product={productForQty}
                    onClose={() => { setQtyModalOpen(false); setProductForQty(null); }}
                    onConfirm={addCustomQuantityToCart}
                />
            )}

            {isLinkModalOpen && selectedPaymentMethod && (
                <MyFatoorahLinkModal
                    totalAmount={total}
                    onClose={() => setLinkModalOpen(false)}
                    onConfirm={() => handleFinalizeSale(selectedPaymentMethod)}
                />
            )}

            {isParkedSalesModalOpen && (
                <ParkedSalesModal 
                    parkedSales={parkedSales}
                    onClose={() => setParkedSalesModalOpen(false)}
                    onRetrieve={handleRetrieveSale}
                    onDelete={handleDeleteParkedSale}
                />
            )}
            {isCustomerModalOpen && (
                <CustomerModal
                    customer={{} as Customer}
                    onClose={() => setCustomerModalOpen(false)}
                    onSave={handleSaveNewCustomer}
                    branches={branches}
                />
            )}
        </>
    );
};

// --- Parked Sales Modal ---
const ParkedSalesModal: React.FC<{parkedSales: ParkedSale[], onClose: () => void, onRetrieve: (id: number) => void, onDelete: (id: number) => void}> = ({ parkedSales, onClose, onRetrieve, onDelete }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{maxWidth: '48rem'}}>
                <div className="modal-header"><h2 style={{fontSize: '1.5rem', fontWeight: 600}}>الفواتير المعلقة</h2></div>
                <div className="modal-body">
                    {parkedSales.length > 0 ? (
                        parkedSales.map(sale => {
                            const total = sale.items.reduce((sum, item) => sum + item.total, 0);
                            return (
                                <div key={sale.id} className="parked-sale-item">
                                    <div>
                                        <p style={{fontWeight: 600}}>
                                            {sale.customerName} - {sale.items.length} أصناف
                                        </p>
                                        <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                            عُلّقت في: {sale.timestamp.toLocaleTimeString('ar-EG')} - الإجمالي: {total.toFixed(2)} د.ك
                                        </p>
                                    </div>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <button onClick={() => onRetrieve(sale.id)} className="btn btn-secondary">استرجاع</button>
                                        <button onClick={() => onDelete(sale.id)} className="btn btn-ghost"><TrashIcon style={{width: '20px', height: '20px', color: '#ef4444'}}/></button>
                                    </div>
                                </div>
                            );
                        })
                    ) : <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>لا توجد فواتير معلقة حالياً.</p>}
                </div>
                <div className="modal-footer" style={{justifyContent: 'flex-end'}}><button onClick={onClose} className="btn btn-primary">إغلاق</button></div>
            </div>
        </div>
    )
}

export default POS;