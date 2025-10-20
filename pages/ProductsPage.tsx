import React, { useState } from 'react';
import { Product } from '../types';
import { useToasts } from '../components/Toast';
import { PencilIcon, PlusIcon } from '../components/Icon';
import ProductModal from '../components/ProductModal';

interface ProductsPageProps {
    products: Product[];
    onSave: (product: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, onSave }) => {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (product: Product) => {
        onSave(product);
        setIsModalOpen(false);
        setSelectedProduct(null);
        addToast(`تم ${product.id ? 'تحديث' : 'إضافة'} المنتج بنجاح!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedProduct({});
        setIsModalOpen(true);
    };
    
    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>كتالوج المنتجات</h3>
                        <p style={{ color: 'var(--text-secondary)'}}>إدارة جميع المنتجات، بما في ذلك المواد الخام والسلع التامة الصنع.</p>
                    </div>
                    <button onClick={handleAddNew} className="btn btn-primary">
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
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.sku}</td>
                                    <td style={{fontWeight: 600}}>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.baseUnit}</td>
                                    <td style={{color: 'var(--secondary-color)'}}>{product.unitPrice.toFixed(3)} د.ك</td>
                                    <td>
                                        <button onClick={() => handleEdit(product)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="تعديل المنتج">
                                            <PencilIcon style={{width:'20px', height:'20px'}}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    allProducts={products}
                    onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default ProductsPage;
