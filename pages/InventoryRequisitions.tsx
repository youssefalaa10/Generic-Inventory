import React, { useEffect, useState } from 'react';
import { PlusIcon } from '../components/Icon';
import InventoryRequisitionModal from '../components/InventoryRequisitionModal';
import { InventoryRequisition } from '../types';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchRequisitions, createRequisition, updateRequisition, deleteRequisition } from '../src/store/slices/requisitionsSlice';
import { fetchBranches } from '../src/store/slices/branchSlice';
import { fetchProducts } from '../src/store/slices/productsSlice';

const InventoryRequisitions: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: requisitions } = useAppSelector(s => s.requisitions);
    const branches = useAppSelector(s => s.branches.branches);
    const products = useAppSelector(s => s.products.items);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
    const [selectedReq, setSelectedReq] = useState<InventoryRequisition | null>(null);

    useEffect(() => {
        dispatch(fetchRequisitions());
        if (!branches?.length) dispatch(fetchBranches({ page: 1, limit: 100 }));
        if (!products?.length) dispatch(fetchProducts());
    }, [dispatch]);

    const handleSave = (req: InventoryRequisition) => {
        const selectedBranchId = String((req as any).warehouseId || '');
        const selectedBranchName = branches.find(b => String((b as any)._id || (b as any).id) === selectedBranchId)?.name;
        const payload = {
            date: req.date,
            type: req.type as any,
            items: (req.items || []).map(i => ({ productId: i.productId, quantity: i.quantity })),
            branchId: selectedBranchId,
            branchName: selectedBranchName,
            notes: req.notes || ''
        } as any;
        dispatch(createRequisition(payload)).finally(() => {
            setIsModalOpen(false);
            dispatch(fetchRequisitions());
        });
    };

    const handleUpdate = (req: InventoryRequisition, original: any) => {
        const selectedBranchId = String((req as any).warehouseId || (req as any).branchId || '');
        const selectedBranchName = branches.find(b => String((b as any)._id || (b as any).id) === selectedBranchId)?.name;
        const payload = {
            date: req.date,
            type: req.type as any,
            items: (req.items || []).map(i => ({ productId: i.productId, quantity: i.quantity })),
            branchId: selectedBranchId,
            branchName: selectedBranchName,
            notes: req.notes || ''
        } as any;
        const id = String(original?._id || original?.id);
        if (!id) return;
        dispatch(updateRequisition({ id, data: payload })).finally(() => {
            setIsModalOpen(false);
            setSelectedReq(null);
            setModalMode('create');
            dispatch(fetchRequisitions());
        });
    };

    const handleDelete = (req: any) => {
        const id = String(req?._id || req?.id);
        if (!id) return;
        if (!window.confirm('هل أنت متأكد من حذف هذه الطلبية؟')) return;
        dispatch(deleteRequisition(id)).finally(() => {
            dispatch(fetchRequisitions());
        });
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
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requisitions.map(req => (
                                <tr key={String((req as any)._id || req.id)}>
                                    <td>#{String((req as any)._id || req.id)}</td>
                                    <td>{new Date(req.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{req.type === 'Transfer' ? 'تحويل' : 'شراء'}</td>
                                    <td>{(req as any).branchName || branches.find(b => String((b as any)._id || (b as any).id) === String((req as any).branchId || (req as any).warehouseId))?.name || '-'}</td>
                                    <td>{(req.items || []).length}</td>
                                    <td>
                                        <div style={{display:'flex', gap:'0.5rem'}}>
                                            <button className="btn btn-ghost" onClick={() => { setSelectedReq(req as any); setModalMode('view'); setIsModalOpen(true); }}>عرض</button>
                                            <button className="btn btn-secondary" onClick={() => { setSelectedReq(req as any); setModalMode('edit'); setIsModalOpen(true); }}>تعديل</button>
                                            <button className="btn btn-warning" onClick={() => handleDelete(req)}>حذف</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && modalMode === 'create' && (
                <InventoryRequisitionModal 
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    products={products as any}
                    branches={branches as any}
                />
            )}
            {isModalOpen && modalMode === 'view' && selectedReq && (
                <InventoryRequisitionModal 
                    onClose={() => { setIsModalOpen(false); setSelectedReq(null); setModalMode('create'); }}
                    onSave={() => {}}
                    products={products as any}
                    branches={branches as any}
                    initialRequisition={selectedReq as any}
                    readOnly
                />
            )}
            {isModalOpen && modalMode === 'edit' && selectedReq && (
                <InventoryRequisitionModal 
                    onClose={() => { setIsModalOpen(false); setSelectedReq(null); setModalMode('create'); }}
                    onSave={(data) => handleUpdate(data, selectedReq)}
                    products={products as any}
                    branches={branches as any}
                    initialRequisition={selectedReq as any}
                />
            )}
        </>
    );
};

export default InventoryRequisitions;