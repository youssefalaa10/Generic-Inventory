import React, { useEffect, useState } from 'react';
import { PlusIcon } from '../components/Icon';
import InventoryRequisitionModal from '../components/InventoryRequisitionModal';
import { InventoryRequisition } from '../types';
import { useAppDispatch, useAppSelector, slices } from '../redux-store/src';

const InventoryRequisitions: React.FC = () => {
    const dispatch = useAppDispatch();
    const reqState = useAppSelector(s => (s as any).inventoryrequisitions || {});
    const requisitions = ((reqState.allIds || []) as string[]).map(id => (reqState.byId || {})[id]).filter(Boolean) as InventoryRequisition[];
    const branchesState = useAppSelector(s => (s as any).branchinventories || {});
    const branches = ((branchesState.allIds || []) as string[]).map(id => (branchesState.byId || {})[id]).filter(Boolean) as any[];
    const productsState = useAppSelector(s => (s as any).products || {});
    const products = ((productsState.allIds || []) as string[]).map(id => (productsState.byId || {})[id]).filter(Boolean) as any[];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
    const [selectedReq, setSelectedReq] = useState<InventoryRequisition | null>(null);

    useEffect(() => {
        dispatch(slices.inventoryrequisitions.thunks.list(undefined));
        if (!branches?.length) dispatch(slices.branchinventories.thunks.list({ params: { page: 1, limit: 100 } }));
        if (!products?.length) dispatch(slices.products.thunks.list(undefined));
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
        dispatch(slices.inventoryrequisitions.thunks.createOne(payload as any)).finally(() => {
            setIsModalOpen(false);
            dispatch(slices.inventoryrequisitions.thunks.list(undefined));
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
        dispatch(slices.inventoryrequisitions.thunks.updateOne({ id, body: payload as any })).finally(() => {
            setIsModalOpen(false);
            setSelectedReq(null);
            setModalMode('create');
            dispatch(slices.inventoryrequisitions.thunks.list(undefined));
        });
    };

    const handleDelete = (req: any) => {
        const id = String(req?._id || req?.id);
        if (!id) return;
        if (!window.confirm('هل أنت متأكد من حذف هذه الطلبية؟')) return;
        dispatch(slices.inventoryrequisitions.thunks.removeOne(id)).finally(() => {
            dispatch(slices.inventoryrequisitions.thunks.list(undefined));
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