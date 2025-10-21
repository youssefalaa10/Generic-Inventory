import React, { useState } from 'react';
import { Supplier } from '../types';
import { useToasts } from '../components/Toast';
import { PencilIcon, PlusIcon } from '../components/Icon';
import SupplierModal from '../components/SupplierModal';

interface SuppliersProps {
    suppliers: Supplier[];
    onSave: (supplier: Supplier) => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, onSave }) => {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Partial<Supplier> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (supplier: Supplier) => {
        onSave(supplier);
        setIsModalOpen(false);
        setSelectedSupplier(null);
        addToast(`Supplier ${supplier.id ? 'updated' : 'added'} successfully!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedSupplier({});
        setIsModalOpen(true);
    };
    
    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const formatBalance = (balance: number) => {
        const color = balance > 0 ? '#ef4444' : balance < 0 ? '#10b981' : 'var(--text-primary)';
        const text = balance > 0 ? `مستحق له ${balance.toLocaleString()} د.ك` : balance < 0 ? `رصيد دائن ${(-balance).toLocaleString()} د.ك` : 'مسدد';
        return <span style={{ color, fontWeight: 600 }}>{text}</span>;
    };
    
    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
    );

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة الموردين</h3>
                        <p style={{ color: 'var(--text-secondary)'}}>عرض وإدارة قائمة الموردين.</p>
                    </div>
                    <button onClick={handleAddNew} className="btn btn-primary">
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إضافة مورد جديد
                    </button>
                </div>
                 <div style={{ marginBottom: '1rem' }}>
                    <input 
                        type="text"
                        placeholder="ابحث بالاسم، جهة الاتصال، أو الهاتف..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>اسم المورد</th>
                                <th>جهة الاتصال</th>
                                <th>الهاتف</th>
                                <th>البريد الإلكتروني</th>
                                <th>الرصيد</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(supplier => (
                                <tr key={supplier.id}>
                                    <td style={{fontWeight: 600}}>{supplier.name}</td>
                                    <td>{supplier.contactPerson}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.email}</td>
                                    <td>{formatBalance(supplier.balance)}</td>
                                    <td>
                                        <button onClick={() => handleEdit(supplier)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="تعديل المورد">
                                            <PencilIcon style={{width:'20px', height:'20px'}}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && selectedSupplier && (
                <SupplierModal
                    supplier={selectedSupplier}
                    onClose={() => { setIsModalOpen(false); setSelectedSupplier(null); }}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default Suppliers;