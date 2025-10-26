import React, { useState } from 'react';
import { PlusIcon } from '../components/Icon';
import { useAppSelector, selectAll } from '../src/store';
import { Product } from '../types';

interface ProductsPageProps {
    onProductSelect: (product: Product) => void;
    onAddNew: () => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onProductSelect, onAddNew }) => {
    // Get products from Redux store
    const products = useAppSelector(s => selectAll(s, 'products')) as Product[];
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="glass-pane products-page-container">
                <div className="products-page-header">
                    <div>
                        <h3 className="products-page-title">المنتجات والخدمات</h3>
                        <p className="products-page-description">اختر منتجاً لعرض تفاصيله أو أضف منتجاً جديداً.</p>
                    </div>
                    <button onClick={onAddNew} className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إضافة منتج جديد
                    </button>
                </div>
                <div className="products-search-section">
                    <input 
                        type="text"
                        placeholder="ابحث بالاسم، SKU، أو الفئة..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input products-search-input"
                    />
                </div>
                <div className="products-table-wrapper">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>الاسم</th>
                                <th>الفئة</th>
                                <th>الوحدة الأساسية</th>
                                <th>سعر الوحدة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr key={String((product as any)._id ?? product.id) || `${product.sku}-${index}`}
                                    onClick={() => onProductSelect(product)}
                                    style={{ cursor: 'pointer' }}>
                                    <td>{product.sku}</td>
                                    <td style={{fontWeight: 600}}>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.baseUnit}</td>
                                    <td style={{color: 'var(--secondary-color)'}}>{Number(product.unitPrice ?? 0).toFixed(3)} د.ك</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
