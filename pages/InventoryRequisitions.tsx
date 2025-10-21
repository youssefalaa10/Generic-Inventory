import React, { useState } from 'react';
import { PlusIcon } from '../components/Icon';
import InventoryRequisitionModal from '../components/InventoryRequisitionModal';
import { Branch, InventoryRequisition, Product } from '../types';

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
            <div className="glass-pane inventory-requisitions-container">
                <div className="inventory-requisitions-header">
                    <h3 className="inventory-requisitions-title">الطلبيات المخزنية</h3>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        طلبية جديدة
                    </button>
                </div>
                <div className="inventory-requisitions-table-wrapper">
                    <table className="inventory-requisitions-table">
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