import React, { useState } from 'react';
import { InventoryRequisition, Product, Branch } from '../types';
import { PlusIcon } from '../components/Icon';
import InventoryRequisitionModal from '../components/InventoryRequisitionModal';

interface InventoryRequisitionsProps {
    requisitions: InventoryRequisition[];
    onSave: (requisition: InventoryRequisition) => void;
    products: Product[];
    branches: Branch[];
}

const InventoryRequisitions: React.FC<InventoryRequisitionsProps> = ({ requisitions, onSave, products, branches }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleSave = (req: InventoryRequisition) => {
        onSave(req);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>الطلبيات المخزنية</h3>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        طلبية جديدة
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الطلبية</th>
                                <th>التاريخ</th>
                                <th>النوع</th>
                                <th>المستودع</th>
                                <th>عدد الأصناف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requisitions.map(req => (
                                <tr key={req.id}>
                                    <td>#{req.id}</td>
                                    <td>{new Date(req.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{req.type === 'Transfer' ? 'تحويل' : 'شراء'}</td>
                                    <td>{branches.find(b => b.id === req.warehouseId)?.name}</td>
                                    <td>{req.items.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <InventoryRequisitionModal 
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    products={products}
                    branches={branches}
                />
            )}
        </>
    );
};

export default InventoryRequisitions;