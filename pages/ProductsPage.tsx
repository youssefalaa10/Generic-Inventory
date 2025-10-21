import React, { useState } from 'react';
import { Product } from '../types';
import { PlusIcon } from '../components/Icon';

interface ProductsPageProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    onAddNew: () => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, onProductSelect, onAddNew }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>المنتجات والخدمات</h3>
                        <p style={{ color: 'var(--text-secondary)'}}>اختر منتجاً لعرض تفاصيله أو أضف منتجاً جديداً.</p>
                    </div>
                    <button onClick={onAddNew} className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إضافة منتج جديد
                    </button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <input 
                        type="text"
                        placeholder="ابحث بالاسم، SKU، أو الفئة..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="table-wrapper">
                    <table>
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
                            {filteredProducts.map(product => (
                                <tr key={product.id} onClick={() => onProductSelect(product)} style={{ cursor: 'pointer' }}>
                                    <td>{product.sku}</td>
                                    <td style={{fontWeight: 600}}>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.baseUnit}</td>
                                    <td style={{color: 'var(--secondary-color)'}}>{product.unitPrice.toFixed(3)} د.ك</td>
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
