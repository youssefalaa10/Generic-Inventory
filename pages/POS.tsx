
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import CustomerModal from '../components/CustomerModal';
import { FolderDownloadIcon, MinusIcon, PlusIcon, SaveIcon, SearchIcon, ShoppingCartIcon, TrashIcon, UserAddIcon, XIcon } from '../components/Icon';
import PaymentModal from '../components/PaymentModal';
import QuantityInputModal from '../components/QuantityInputModal';
import SaleCompleteModal from '../components/SaleCompleteModal';
import { useToasts } from '../components/Toast';
import { useAppDispatch, useAppSelector, slices } from '../redux-store/src';
import { selectAll } from '../src/store/selectors.ts';
import { Branch, Customer, IntegrationSettings, InventoryItem, PaymentMethod, Product, Sale, SaleItem } from '../types';


interface POSProps {
    products: Product[];
    inventory: InventoryItem[];
    customers: Customer[];
    onSaveCustomer: (customer: Customer) => Customer;
    onSave: (sale: Sale) => void;
    integrationSettings: IntegrationSettings;
    branches: Branch[];
}

type ParkedSale = {
    id: number;
    timestamp: Date;
    items: SaleItem[];
    customerId?: number;
    customerName: string;
}

const POS: React.FC<POSProps> = ({ products, inventory, customers, onSaveCustomer, onSave, integrationSettings, branches }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const dispatch = useAppDispatch();
    
    // Redux state (use centralized products slice when searching)
    const posProducts = useAppSelector(s => selectAll(s as any, 'products')) as Product[];
    const posLoading = useAppSelector(s => !!(s as any)?.products?.loading?.list);
    const posError = useAppSelector(s => (s as any)?.products?.error?.list as string | null);
    
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState<Sale | null>(null);
    const [isQtyModalOpen, setQtyModalOpen] = useState(false);
    const [productForQty, setProductForQty] = useState<(Product & {stock: number}) | null>(null);
    const [isQrModalOpen, setQrModalOpen] = useState(false);
    const [paymentMethodForQr, setPaymentMethodForQr] = useState<PaymentMethod | null>(null);

    // New features state
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);
    const [isParkedSalesModalOpen, setParkedSalesModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
    
    // Product search state
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [useReduxProducts, setUseReduxProducts] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');

    useEffect(() => {
        // Set default customer on mount
        const cashCustomer = customers.find(c => c.id === 4); // ID 4 is "زبون نقدي عام"
        if(cashCustomer) {
            setSelectedCustomer(cashCustomer);
        }
    }, [customers]);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (searchTerm: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    if (searchTerm.trim()) {
                        dispatch(slices.products.thunks.list({ params: { q: searchTerm, status: 'Active', page: 1, limit: 20 } }))
                        .unwrap()
                        .then((result) => {
                            setUseReduxProducts(true);
                        })
                        .catch((error) => {
                            console.error('Search products error:', error);
                            addToast('خطأ في البحث عن المنتجات', 'error');
                            setUseReduxProducts(false);
                        });
                    } else {
                        setUseReduxProducts(false);
                        // keep existing products list; user is not in search mode
                    }
                }, 300);
            };
        })(),
        [dispatch, addToast]
    );

    // Handle product search input
    useEffect(() => {
        debouncedSearch(productSearchTerm);
    }, [productSearchTerm, debouncedSearch]);

    // Handle barcode scanner input (local search, or ensure products loaded with search)
    const handleBarcodeInput = useCallback((value: string) => {
        // Validation: Check for valid barcode format
        if (!value || value.trim().length < 3) {
            return;
        }
        
        // Try local search first (props products)
        const trimmed = value.trim();
        const localProduct = products.find(p => p.sku === trimmed || p.name.toLowerCase().includes(trimmed.toLowerCase()));
        if (localProduct) {
            addToast('تم العثور على المنتج محلياً', 'info');
            let stock = 0;
            if (user?.branchId) {
                const branchInventory = inventory.filter(i => i.branchId === user.branchId);
                const inventoryItem = branchInventory.find(i => i.productId === localProduct.id);
                stock = inventoryItem ? inventoryItem.quantity : 0;
            } else {
                const inventoryItems = inventory.filter(i => i.productId === localProduct.id);
                stock = inventoryItems.reduce((total, item) => total + item.quantity, 0);
            }
            if (stock <= 0) { addToast('هذا المنتج غير متوفر في المخزون', 'error'); return; }
            const productWithStock = { ...localProduct, stock } as any;
            handleProductClick(productWithStock);
            setBarcodeInput('');
            return;
        }
        // If not found, trigger a redux-store search to load candidates
        dispatch(slices.products.thunks.list({ params: { q: trimmed, page: 1, limit: 20 } }))
          .unwrap()
          .then(() => {
            const candidate = (selectAll({ products: ( (window as any).__APP_STORE__?.getState?.()?.products ) } as any, 'products') || posProducts).find(p => p.sku === trimmed || (p as any).name?.toLowerCase?.().includes(trimmed.toLowerCase()));
            if (!candidate) { addToast('المنتج غير موجود', 'error'); return; }
            // Compute stock similarly to above
            let stock = 0;
            const id = (candidate as any)._id || (candidate as any).id;
            if (user?.branchId) {
              const branchInventory = inventory.filter(i => i.branchId === user.branchId);
              const inventoryItem = branchInventory.find(i => i.productId === id);
              stock = inventoryItem ? inventoryItem.quantity : 0;
            } else {
              const inventoryItems = inventory.filter(i => i.productId === id);
              stock = inventoryItems.reduce((total, item) => total + item.quantity, 0);
            }
            if (stock <= 0) { addToast('هذا المنتج غير متوفر في المخزون', 'error'); return; }
            const productWithStock = { ...(candidate as any), stock };
            handleProductClick(productWithStock as any);
            setBarcodeInput('');
          })
          .catch(() => addToast('المنتج غير موجود', 'error'));
    }, [dispatch, addToast, inventory, user, products]);

    // Handle product lookup result
    const handleProductLookup = useCallback((product: any) => {
        // Convert Redux product to local product format
        const localProduct = {
            id: parseInt(product._id) || 0, // Convert to number for compatibility
            _id: product._id, // Keep string version for Redux compatibility
            name: product.name,
            sku: product.sku,
            category: product.category,
            unitPrice: product.unitPrice,
            baseUnit: product.baseUnit,
            stock: 0 // Will be calculated from inventory
        };

        // Find stock for this product
        if (user?.branchId) {
            const branchInventory = inventory.filter(i => i.branchId === user.branchId);
            const inventoryItem = branchInventory.find(i => i.productId === localProduct.id);
            const stock = inventoryItem ? inventoryItem.quantity : 0;
            
            if (stock <= 0) {
                addToast('هذا المنتج غير متوفر في المخزون', 'error');
                return;
            }

            const productWithStock = { ...localProduct, stock };
            handleProductClick(productWithStock);
        }
    }, [inventory, user, addToast]);

    // Handle barcode input change with debouncing
    useEffect(() => {
        if (barcodeInput && barcodeInput.length >= 3) {
            const timeoutId = setTimeout(() => {
                handleBarcodeInput(barcodeInput);
            }, 500);
            
            return () => clearTimeout(timeoutId);
        }
    }, [barcodeInput, handleBarcodeInput]);

    const availableProducts = useMemo(() => {
        // Always use Products Management data to keep POS in sync
        const sourceProducts = products;

        return sourceProducts.map(product => {
            let stock = 0;
            const productId = (product as any)._id || product.id;
            
            // Handle inventory based on user role
            if (user?.branchId) {
                // Branch-specific users: only show inventory from their branch
                const branchInventory = inventory.filter(i => i.branchId === user.branchId);
                
                if (useReduxProducts) {
                    // For Redux products, check inventory by product ID
                    const inventoryItem = branchInventory.find(i => i.productId === productId);
                    stock = inventoryItem ? inventoryItem.quantity : 0;
                } else {
                    // For local products, handle components if they exist
                    if (product.components && product.components.length > 0) {
                        const componentStocks = product.components.map(comp => {
                            const invItem = branchInventory.find(i => i.productId === comp.productId);
                            const available = invItem ? invItem.quantity : 0;
                            return Math.floor(available / comp.quantity);
                        });
                        stock = isFinite(Math.min(...componentStocks)) ? Math.min(...componentStocks) : 0;
                    } else {
                        const inventoryItem = branchInventory.find(i => i.productId === productId);
                        stock = inventoryItem ? inventoryItem.quantity : 0;
                    }
                }
            } else {
                // Non-branch users (Super Admin, Accountant): show total inventory across all branches
                const allInventory = inventory;
                
                if (useReduxProducts) {
                    // For Redux products, sum inventory across all branches
                    const inventoryItems = allInventory.filter(i => i.productId === productId);
                    stock = inventoryItems.reduce((total, item) => total + item.quantity, 0);
                } else {
                    // For local products, handle components if they exist
                    if (product.components && product.components.length > 0) {
                        const componentStocks = product.components.map(comp => {
                            const invItems = allInventory.filter(i => i.productId === comp.productId);
                            const available = invItems.reduce((total, item) => total + item.quantity, 0);
                            return Math.floor(available / comp.quantity);
                        });
                        stock = isFinite(Math.min(...componentStocks)) ? Math.min(...componentStocks) : 0;
                    } else {
                        const inventoryItems = allInventory.filter(i => i.productId === productId);
                        stock = inventoryItems.reduce((total, item) => total + item.quantity, 0);
                    }
                }
            }
            
            return { ...product, stock };
        });
    }, [inventory, products, posProducts, useReduxProducts, user]);

    const productCategories = useMemo(() => {
        const sourceProducts = useReduxProducts ? posProducts : products;
        return ['all', ...new Set(sourceProducts.map(p => p.category))];
    }, [products, posProducts, useReduxProducts]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return availableProducts;
        return availableProducts.filter(p => p.category === selectedCategory);
    }, [availableProducts, selectedCategory]);

    // Pagination handlers
    const handleLoadMore = useCallback(() => {
        // Optional: implement pagination by tracking page state locally and calling thunks.list with next page
        if (productSearchTerm.trim()) {
          // Example next-page call could go here
        }
    }, [productSearchTerm]);

    // Clear search when category changes
    useEffect(() => {
        if (selectedCategory !== 'all' && useReduxProducts) {
            setUseReduxProducts(false);
            setProductSearchTerm('');
            // no-op for centralized products slice
        }
    }, [selectedCategory, useReduxProducts, dispatch]);


    const handleProductClick = (product: Product & { stock: number }) => {
        // Validation: Check if product has required fields
        if (!product.id && !product._id) {
            addToast('خطأ في بيانات المنتج', 'error');
            return;
        }
        
        if (product.stock <= 0) {
            addToast('هذا المنتج غير متوفر في المخزون.', 'error');
            return;
        }
        
        // Use _id for Redux products, id for local products
        const productId = (product as any)._id || product.id;
        
        if (product.baseUnit === 'g' || product.baseUnit === 'ml') {
            setProductForQty(product);
            setQtyModalOpen(true);
        } else {
            const existingItem = cart.find(item => item.productId === productId);
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    updateQuantity(productId, 1);
                } else {
                    addToast(`لا يوجد المزيد من ${product.name} في المخزون.`, 'info');
                }
            } else {
                const newItem: SaleItem = {
                    id: Date.now(),
                    productId: productId,
                    productName: product.name,
                    quantity: 1,
                    unitPrice: product.unitPrice,
                    total: product.unitPrice
                };
                setCart([...cart, newItem]);
            }
        }
    };
    
    const addCustomQuantityToCart = (product: Product, quantity: number) => {
        // Validation: Check quantity
        if (quantity <= 0) {
            addToast('الكمية يجب أن تكون أكبر من صفر', 'error');
            return;
        }
        
        const productId = (product as any)._id || product.id;
        const stockItem = availableProducts.find(p => (p._id || p.id) === productId);
        
        if (!stockItem || quantity > stockItem.stock) {
            addToast(`الكمية المطلوبة تتجاوز المخزون المتاح (${stockItem?.stock || 0}).`, 'error');
            return;
        }
        
        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
             setCart(cart.map(item =>
                item.productId === productId 
                ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.unitPrice } 
                : item
            ));
        } else {
            const newItem: SaleItem = {
                id: Date.now(),
                productId: productId,
                productName: product.name,
                quantity: quantity,
                unitPrice: product.unitPrice,
                total: product.unitPrice * quantity
            };
            setCart([...cart, newItem]);
        }
        setQtyModalOpen(false);
        setProductForQty(null);
    };
    
    const updateQuantity = (productId: number | string, delta: number) => {
        const productInStock = availableProducts.find(p => (p._id || p.id) === productId);
        setCart(currentCart => {
            const itemInCart = currentCart.find(item => item.productId === productId);
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
    
    const removeFromCart = (productId: number | string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const { subtotal, tax, total } = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
        const tax = 0;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);

    const handlePaymentConfirm = (paymentMethod: PaymentMethod) => {
        if (paymentMethod === 'MyFatoorah') {
            setPaymentMethodForQr(paymentMethod);
            setPaymentModalOpen(false);
            setQrModalOpen(true);
        } else {
            handleFinalizeSale(paymentMethod);
        }
    };
    
    const handleFinalizeSale = (paymentMethod: PaymentMethod) => {
        // Determine effective branch: use user's branch if available, else fallback to first branch
        const effectiveBranchId = user?.branchId ?? branches[0]?.id;
        if (!effectiveBranchId) {
            addToast('يرجى تحديد فرع صالح قبل إتمام الدفع', 'error');
            return;
        }

        // Validation: Check if cart is not empty
        if (cart.length === 0) {
            addToast('لا يمكن إتمام عملية بيع فارغة', 'error');
            return;
        }

        // Validation: Check if all items have valid data
        const invalidItems = cart.filter(item => 
            !item.productId || 
            !item.productName || 
            item.quantity <= 0 || 
            item.unitPrice <= 0
        );
        
        if (invalidItems.length > 0) {
            addToast('يوجد عناصر غير صالحة في السلة', 'error');
            return;
        }

        const brand: 'Arabiva' | 'Generic' = [1, 2, 3].includes(effectiveBranchId as number) ? 'Arabiva' : 'Generic';

        const newSale: Omit<Sale, 'id' | 'invoiceNumber'> = {
            brand,
            branchId: effectiveBranchId as number,
            customerName: selectedCustomer?.name || 'زبون نقدي عام',
            customerId: (typeof selectedCustomer?.id === 'number' && Number.isFinite(selectedCustomer?.id as number)) ? (selectedCustomer?.id as number) : 4,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod,
            paymentStatus: 'Paid',
            items: cart,
            totalAmount: total,
        };
        
        try {
            onSave(newSale as Sale);
            setCompletedSale(newSale as Sale);
            addToast('تم إتمام البيع بنجاح', 'success');
        } catch (error) {
            console.error('Sale finalization error:', error);
            addToast('خطأ في إتمام البيع', 'error');
            return;
        }
        
        setPaymentModalOpen(false);
        setQrModalOpen(false);
    };
    
    const startNewSale = () => {
        setCart([]);
        setCompletedSale(null);
        const cashCustomer = customers.find(c => c.id === 4);
        if(cashCustomer) setSelectedCustomer(cashCustomer);
    };

    const handleParkSale = () => {
        // Validation: Check if cart is not empty
        if (cart.length === 0) {
            addToast('لا يمكن تعليق سلة فارغة.', 'info');
            return;
        }

        // Validation: Check if all items have valid data
        const invalidItems = cart.filter(item => 
            !item.productId || 
            !item.productName || 
            item.quantity <= 0 || 
            item.unitPrice <= 0
        );
        
        if (invalidItems.length > 0) {
            addToast('يوجد عناصر غير صالحة في السلة', 'error');
            return;
        }

        try {
            const newParkedSale: ParkedSale = {
                id: Date.now(),
                timestamp: new Date(),
                items: cart,
                customerId: (typeof selectedCustomer?.id === 'number' && Number.isFinite(selectedCustomer?.id as number)) ? (selectedCustomer?.id as number) : undefined,
                customerName: selectedCustomer?.name || 'زبون نقدي عام'
            };
            setParkedSales(prev => [...prev, newParkedSale]);
            startNewSale();
            addToast(`تم تعليق الفاتورة بنجاح.`, 'success');
        } catch (error) {
            console.error('Park sale error:', error);
            addToast('خطأ في تعليق الفاتورة', 'error');
        }
    };

    const handleRetrieveSale = (saleId: number) => {
        const saleToRetrieve = parkedSales.find(s => s.id === saleId);
        if (!saleToRetrieve) {
            addToast('الفاتورة المعلقة غير موجودة', 'error');
            return;
        }

        // Validation: Check if parked sale has valid items
        const invalidItems = saleToRetrieve.items.filter(item => 
            !item.productId || 
            !item.productName || 
            item.quantity <= 0 || 
            item.unitPrice <= 0
        );
        
        if (invalidItems.length > 0) {
            addToast('الفاتورة المعلقة تحتوي على عناصر غير صالحة', 'error');
            return;
        }

        if (cart.length > 0 && !window.confirm('لديك عناصر في السلة الحالية. هل تريد استبدالها؟')) {
            return;
        }

        try {
            setCart(saleToRetrieve.items);
            const customer = customers.find(c => c.id === saleToRetrieve.customerId);
            setSelectedCustomer(customer || customers.find(c => c.id === 4) || null);
            setParkedSales(prev => prev.filter(s => s.id !== saleId));
            setParkedSalesModalOpen(false);
            addToast('تم استرجاع الفاتورة.', 'success');
        } catch (error) {
            console.error('Retrieve sale error:', error);
            addToast('خطأ في استرجاع الفاتورة', 'error');
        }
    };

    const handleDeleteParkedSale = (saleId: number) => {
        const saleToDelete = parkedSales.find(s => s.id === saleId);
        if (!saleToDelete) {
            addToast('الفاتورة المعلقة غير موجودة', 'error');
            return;
        }

        if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة المعلقة؟')) {
            return;
        }

        try {
            setParkedSales(prev => prev.filter(s => s.id !== saleId));
            addToast('تم حذف الفاتورة المعلقة.', 'info');
        } catch (error) {
            console.error('Delete parked sale error:', error);
            addToast('خطأ في حذف الفاتورة المعلقة', 'error');
        }
    };

    const handleSaveNewCustomer = async (customer: Customer) => {
        // Validation: Check if customer has required fields
        if (!customer.name || customer.name.trim().length === 0) {
            addToast('اسم العميل مطلوب', 'error');
            return;
        }

        if (!customer.phone || customer.phone.trim().length === 0) {
            addToast('رقم الهاتف مطلوب', 'error');
            return;
        }

        try {
            const savedCustomer = onSaveCustomer(customer);
            setSelectedCustomer(savedCustomer);
            setCustomerModalOpen(false);
            addToast('تم إضافة العميل بنجاح!', 'success');
        } catch (error) {
            console.error('Save customer error:', error);
            addToast('خطأ في إضافة العميل', 'error');
        }
    };

    const customerSearchResults = useMemo(() => {
        if (customerSearchTerm.length < 2) return [];
        const term = customerSearchTerm.toLowerCase();
        return customers.filter(c => c.id !== 4 && (c.name.toLowerCase().includes(term) || c.phone.includes(term)));
    }, [customerSearchTerm, customers]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.pos-customer-search-container')) {
                setIsSearchResultsOpen(false);
            }
        };

        if (isSearchResultsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSearchResultsOpen]);
    
    const formatCurrency = (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <>
            <div className="pos-container">
                <div className="pos-header">
                    <h3 className="pos-header-title">نقطة البيع</h3>
                    <div className="pos-header-actions">
                        <button onClick={startNewSale} className="btn btn-ghost">
                            <XIcon style={{width: '20px', height: '20px'}} />
                            بدء جديد
                        </button>
                    </div>
                </div>
                
                <div className="pos-main-content">
                    {/* Products Section */}
                    <div className="pos-products-section">
                        <div className="pos-products-header">
                            <h3 className="pos-products-title">المنتجات</h3>
                            <div className="pos-category-filter">
                                {productCategories.map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setSelectedCategory(cat)} 
                                        className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                        {cat === 'all' ? 'الكل' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Product Search */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                                <input 
                                    id="product-search-input"
                                    name="productSearch"
                                    type="text" 
                                    placeholder="ابحث عن منتج بالاسم أو SKU..." 
                                    value={productSearchTerm} 
                                    onChange={e => setProductSearchTerm(e.target.value)} 
                                    className="form-input pos-search-input" 
                                    style={{ width: '100%', paddingRight: '2.5rem' }}
                                    autoComplete="off"
                                />
                                <SearchIcon style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-placeholder)', pointerEvents: 'none' }} />
                            </div>
                            
                            {/* Barcode Scanner Input */}
                            <div style={{ position: 'relative' }}>
                                <input 
                                    id="barcode-input"
                                    name="barcodeInput"
                                    type="text" 
                                    placeholder="مسح الباركود أو إدخال SKU يدوياً..." 
                                    value={barcodeInput} 
                                    onChange={e => setBarcodeInput(e.target.value)} 
                                    className="form-input pos-search-input" 
                                    style={{ width: '100%', paddingRight: '2.5rem' }}
                                    autoComplete="off"
                                />
                                <SearchIcon style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-placeholder)', pointerEvents: 'none' }} />
                            </div>
                            
                            {/* Loading and Error States */}
                            {posLoading && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '1rem', 
                                    color: 'var(--text-secondary)',
                                    background: 'var(--highlight-hover)',
                                    borderRadius: '8px',
                                    margin: '0.5rem 0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <div style={{ 
                                            width: '16px', 
                                            height: '16px', 
                                            border: '2px solid var(--primary-color)', 
                                            borderTop: '2px solid transparent', 
                                            borderRadius: '50%', 
                                            animation: 'spin 1s linear infinite' 
                                        }}></div>
                                        جاري البحث...
                                    </div>
                                </div>
                            )}
                            
                            {posError && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '1rem', 
                                    color: '#ef4444',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    margin: '0.5rem 0'
                                }}>
                                    خطأ في البحث: {posError}
                                </div>
                            )}

                            {/* Search Status */}
                            {useReduxProducts && productSearchTerm && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '0.5rem 1rem', 
                                    color: 'var(--primary-color)',
                                    background: 'var(--highlight-hover)',
                                    borderRadius: '6px',
                                    margin: '0.5rem 0',
                                    fontSize: '0.875rem'
                                }}>
                                    عرض نتائج البحث لـ: "{productSearchTerm}"
                                </div>
                            )}

                            {/* No Results Message */}
                            {useReduxProducts && productSearchTerm && posProducts.length === 0 && !posLoading && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '1rem', 
                                    color: 'var(--text-secondary)',
                                    background: 'var(--surface-bg)',
                                    border: '1px solid var(--surface-border)',
                                    borderRadius: '8px',
                                    margin: '0.5rem 0'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                                    <p style={{ margin: '0 0 0.5rem 0' }}>لم يتم العثور على منتجات</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-placeholder)' }}>
                                        جرب البحث بكلمات مختلفة أو تحقق من الإملاء
                                    </p>
                                </div>
                            )}

                        </div>
                        
                        <div className="pos-customer-section-compact">
                            <div className="pos-customer-compact-header">
                                <div className="pos-customer-compact-info">
                                  
                                    <div className="pos-customer-compact-details">
                                        <span className="pos-customer-compact-name">
                                            {selectedCustomer?.name || 'زبون نقدي عام'}
                                        </span>
                                        {selectedCustomer?.phone && selectedCustomer.id !== 4 && (
                                            <span className="pos-customer-compact-phone">
                                                {selectedCustomer.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="pos-customer-compact-actions">
                                    <button 
                                        className="btn btn-ghost btn-xs pos-customer-compact-add-btn" 
                                        onClick={() => setCustomerModalOpen(true)}
                                        title="إضافة عميل جديد"
                                    >
                                        <UserAddIcon style={{width: '25px', height: '20px'}} />
                                    </button>
                                    {selectedCustomer && selectedCustomer.id !== 4 && (
                                        <button 
                                            className="btn btn-ghost btn-xs pos-customer-compact-clear-btn" 
                                            onClick={() => {
                                                const cashCustomer = customers.find(c => c.id === 4);
                                                setSelectedCustomer(cashCustomer || null);
                                                setCustomerSearchTerm('');
                                            }}
                                            title="العودة للزبون النقدي العام"
                                        >
                                            <XIcon style={{width: '12px', height: '12px'}} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pos-customer-search-container-compact">
                                <div className="pos-customer-search-wrapper-compact" style={{ position: 'relative' }}>
                                    <input 
                                        id="customer-search-input"
                                        name="customerSearch"
                                        type="text" 
                                        placeholder="ابحث عن عميل..." 
                                        value={customerSearchTerm} 
                                        onChange={e => {
                                            setCustomerSearchTerm(e.target.value);
                                            setIsSearchResultsOpen(e.target.value.length >= 2);
                                        }} 
                                        className="form-input pos-customer-search-input-compact"
                                        autoComplete="off"
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 2rem 0.5rem 0.75rem',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--input-border)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.8rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                            e.target.style.borderColor = 'var(--primary-color)';
                                            e.target.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--primary-color) 15%, transparent)';
                                            e.target.style.background = 'var(--surface-bg)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--input-border)';
                                            e.target.style.boxShadow = 'none';
                                            e.target.style.background = 'var(--input-bg)';
                                        }}
                                    />
                                    <SearchIcon 
                                        className="pos-customer-search-icon-compact"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '0.5rem',
                                            transform: 'translateY(-50%)',
                                            width: '14px',
                                            height: '14px',
                                            color: 'var(--text-placeholder)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </div>
                                
                                {isSearchResultsOpen && customerSearchResults.length > 0 && (
                                    <div className="pos-customer-search-results" style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 0.5rem)',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--surface-bg)',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                        zIndex: 30,
                                        maxHeight: '300px',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="search-results-header" style={{
                                            padding: '0.75rem 1rem',
                                            background: 'var(--highlight-hover)',
                                            borderBottom: '1px solid var(--surface-border)'
                                        }}>
                                            <span className="search-results-count" style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 600
                                            }}>
                                                {customerSearchResults.length} عميل
                                            </span>
                                        </div>
                                        <ul className="search-results-list" style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            {customerSearchResults.map(c => (
                                                <li 
                                                    key={c.id} 
                                                    className="search-result-item"
                                                    onClick={() => { 
                                                        setSelectedCustomer(c); 
                                                        setCustomerSearchTerm(''); 
                                                        setIsSearchResultsOpen(false);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.75rem 1rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        borderBottom: '1px solid var(--surface-border)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'var(--highlight-hover)';
                                                        e.currentTarget.style.transform = 'translateX(4px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                    }}
                                                >
                                                    <div className="search-result-avatar" style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                        flexShrink: 0
                                                    }}>
                                                        <span>{c.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="search-result-info" style={{
                                                        flex: 1,
                                                        minWidth: 0
                                                    }}>
                                                        <p className="search-result-name" style={{
                                                            fontWeight: 600,
                                                            color: 'var(--text-primary)',
                                                            margin: '0 0 0.25rem 0',
                                                            fontSize: '0.875rem',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>{c.name}</p>
                                                        <p className="search-result-phone" style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-secondary)',
                                                            margin: 0
                                                        }}>{c.phone}</p>
                                                    </div>
                                                    <div className="search-result-indicator" style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '20px',
                                                        height: '20px'
                                                    }}>
                                                        <span className="indicator-dot" style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: 'var(--primary-color)',
                                                            opacity: 0.6
                                                        }}></span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {isSearchResultsOpen && customerSearchTerm.length >= 2 && customerSearchResults.length === 0 && (
                                    <div className="pos-customer-no-results" style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 0.5rem)',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--surface-bg)',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                        zIndex: 30,
                                        padding: '1.5rem',
                                        textAlign: 'center'
                                    }}>
                                        <div className="no-results-icon" style={{
                                            fontSize: '2rem',
                                            marginBottom: '0.75rem',
                                            opacity: 0.6
                                        }}>🔍</div>
                                        <p className="no-results-text" style={{
                                            color: 'var(--text-secondary)',
                                            margin: '0 0 1rem 0',
                                            fontSize: '0.875rem'
                                        }}>لم يتم العثور على عملاء</p>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setCustomerModalOpen(true)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                borderRadius: '6px',
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--primary-color-dark)';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--primary-color)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            إضافة عميل جديد
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="pos-products-grid">
                            {filteredProducts.map(p => (
                                <div
                                    key={p._id || p.id}
                                    onClick={() => p.stock > 0 && handleProductClick(p)}
                                    className="pos-product-card"
                                    style={{
                                        opacity: p.stock > 0 ? 1 : 0.5,
                                        cursor: p.stock > 0 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <span className="pos-product-category">
                                        المخزون: {(p.baseUnit === 'g' || p.baseUnit === 'ml') ? p.stock.toFixed(3) : p.stock.toLocaleString()} {p.baseUnit !== 'pcs' ? p.baseUnit : ''}
                                    </span>
                                    <div style={{height: '60px', marginBottom: '0.5rem', background: 'var(--highlight-hover)', borderRadius: '8px'}}></div>
                                    <div>
                                        <p className="pos-product-name">{p.name}</p>
                                        <p className="pos-product-stock">{p.sku}</p>
                                        <p className="pos-product-price">
                                            {p.unitPrice.toFixed(2)} د.ك {p.baseUnit !== 'pcs' ? ` / ${p.baseUnit}`: ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination Controls removed - implement later if backend supports paginated search */}
                    </div>

                    {/* Cart Section */}
                    <div className="pos-cart-section">
                        <div className="pos-cart-header">
                            <h3 className="pos-cart-title">
                                <ShoppingCartIcon style={{width: '28px', height: '28px'}} />
                                السلة ({cart.length} أصناف)
                            </h3>
                        </div>
                        
                        <div className="pos-cart-items">
                            {cart.length === 0 ? (
                                <div style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem'}}>
                                    <p>السلة فارغة</p>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const productInfo = availableProducts.find(p => (p._id || p.id) === item.productId);
                                    const stock = productInfo ? productInfo.stock : 0;
                                    const isAtMaxStock = productInfo?.baseUnit === 'pcs' && item.quantity >= stock;

                                    return (
                                        <div key={item.productId} className="pos-cart-item">
                                            <div className="pos-cart-item-info">
                                                <p className="pos-cart-item-name">{item.productName}</p>
                                                <p className="pos-cart-item-price">
                                                    SKU: {productInfo?.sku} | {(productInfo?.baseUnit === 'g' || productInfo?.baseUnit === 'ml') ? item.quantity.toFixed(3) : item.quantity} {productInfo?.baseUnit !== 'pcs' ? productInfo?.baseUnit : ''} x {item.unitPrice.toFixed(2)} د.ك
                                                </p>
                                            </div>
                                            <div className="pos-cart-item-controls">
                                                {productInfo?.baseUnit === 'pcs' ? (
                                                    <div className="pos-cart-item-quantity">
                                                        <button onClick={() => updateQuantity(item.productId, -1)} className="btn-ghost" style={{width: '32px', height: '32px', padding: 0, borderRadius: '50%'}}>
                                                            <MinusIcon style={{width: '16px', height: '16px'}}/>
                                                        </button>
                                                        <span style={{width: '2rem', textAlign: 'center', fontWeight: '600'}}>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.productId, 1)} className="btn-ghost" style={{width: '32px', height: '32px', padding: 0, borderRadius: '50%', opacity: isAtMaxStock ? 0.5 : 1}} disabled={isAtMaxStock}>
                                                            <PlusIcon style={{width: '16px', height: '16px'}}/>
                                                        </button>
                                                    </div>
                                                ) : <div style={{width: '106px'}}></div>}
                                                <p className="pos-cart-item-total">{item.total.toFixed(2)} د.ك</p>
                                                <button onClick={() => removeFromCart(item.productId)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}>
                                                    <TrashIcon style={{width:'20px', height:'20px'}}/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        
                        {cart.length > 0 && (
                            <div className="pos-cart-footer">
                                <div className="pos-cart-total">
                                    <span>الإجمالي</span>
                                    <span style={{color: 'var(--primary-color)'}}>{formatCurrency(total)} د.ك</span>
                                </div>
                                <div className="pos-cart-actions">
                                    <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                        <button onClick={handleParkSale} className="btn btn-warning pos-cart-action-btn" disabled={cart.length === 0}>
                                            <SaveIcon style={{width: '20px', height: '20px'}}/> تعليق
                                        </button>
                                        <button onClick={() => setParkedSalesModalOpen(true)} className="btn btn-ghost pos-cart-action-btn" disabled={parkedSales.length === 0}>
                                            <FolderDownloadIcon style={{width: '20px', height: '20px'}}/> استرجاع ({parkedSales.length})
                                        </button>
                                    </div>
                                    <button onClick={() => setPaymentModalOpen(true)} className="btn btn-secondary pos-cart-action-btn" disabled={cart.length === 0}>
                                        الدفع
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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

            {isQrModalOpen && (
                <MyFatoorahQRModal
                    totalAmount={total}
                    onClose={() => setQrModalOpen(false)}
                    onConfirm={() => handleFinalizeSale(paymentMethodForQr!)}
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
                    existingCustomers={customers}
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

// --- MyFatoorah QR Modal Component ---
interface MyFatoorahQRModalProps {
    totalAmount: number;
    onClose: () => void;
    onConfirm: () => void;
}
const MyFatoorahQRModal: React.FC<MyFatoorahQRModalProps> = ({ totalAmount, onClose, onConfirm }) => {
    const qrCanvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const renderQR = async () => {
            if (!qrCanvasRef.current) return;
            try {
                const lib: any = await import('qrcode');
                const toCanvas = lib?.toCanvas || lib?.default?.toCanvas;
                if (typeof toCanvas === 'function') {
                    const qrData = `https://www.myfatoorah.com/pg/invoice?id=${Date.now()}&amount=${totalAmount}`;
                    toCanvas(qrCanvasRef.current, qrData, { width: 256, margin: 2 }, (error: any) => {
                        if (error) console.error(error);
                    });
                } else {
                    console.error('QRCode library not available.');
                }
            } catch (e) {
                console.error('Failed to load QRCode library:', e);
            }
        };
        renderQR();
    }, [totalAmount]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '32rem', textAlign: 'center' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>الدفع عبر MyFatoorah</h2>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>يرجى مسح الـ QR Code من قبل العميل لإتمام الدفع.</p>
                    <canvas ref={qrCanvasRef} style={{ borderRadius: '12px', border: '1px solid var(--surface-border)' }} />
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: '1rem 0' }}>
                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك
                    </p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={onConfirm} className="btn btn-secondary">تم استلام المبلغ</button>
                </div>
            </div>
        </div>
    );
}

export default POS;
