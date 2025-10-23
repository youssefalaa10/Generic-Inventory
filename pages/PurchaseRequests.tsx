
import React, { useState } from 'react';
import { PurchaseRequest, EmployeeData, Branch, Product } from '../types';
import { PlusIcon } from '../components/Icon';
import PurchaseRequestModal from '../components/PurchaseRequestModal';

interface PurchaseRequestsProps {
    requests: PurchaseRequest[];
    employees: EmployeeData[];
    branches: Branch[];
    products: Product[];
    onSave: (request: PurchaseRequest) => void;
}

const PurchaseRequests: React.FC<PurchaseRequestsProps> = ({ requests, employees, branches, products, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Partial<PurchaseRequest> | null>(null);

    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'N/A';
    const getBranchName = (id: number) => branches.find(b => b.id === id)?.name || 'N/A';
    
    const getStatusChip = (status: PurchaseRequest['status']) => {
        const styles: {[key: string]: {bg: string, text: string}} = {
            'Draft': { bg: 'var(--surface-bg)', text: 'var(--text-secondary)' },
            'Pending Approval': { bg: '#f59e0b', text: '#111' },
            'Approved': { bg: '#10b981', text: '#fff' },
            'Rejected': { bg: '#ef4444', text: '#fff' },
            'Ordered': { bg: '#3b82f6', text: '#fff' },
        }
        const currentStyle = styles[status] || styles['Draft'];
        return <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', color: currentStyle.text, background: currentStyle.bg }}>{status}</span>
    };
    
    const handleAddNew = () => {
        setSelectedRequest({});
        setIsModalOpen(true);
    };

    const handleEdit = (request: PurchaseRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>طلبات الشراء</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        طلب شراء جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>التاريخ</th>
                                <th>مقدم الطلب</th>
                                <th>الفرع</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} onClick={() => handleEdit(req)} style={{cursor: 'pointer'}}>
                                    <td>#{req.id}</td>
                                    <td>{new Date(req.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{getEmployeeName(req.requestedByUserId)}</td>
                                    <td>{getBranchName(req.branchId)}</td>
                                    <td>{getStatusChip(req.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <PurchaseRequestModal
                    request={selectedRequest}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    employees={employees}
                    branches={branches}
                    products={products}
                />
            )}
        </>
    );
};

export default PurchaseRequests;
