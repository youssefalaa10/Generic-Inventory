import React, { useState } from 'react';
import { DebitNote, Supplier, Product } from '../types';
import { PlusIcon } from '../components/Icon';
import DebitNoteModal from '../components/DebitNoteModal';

interface DebitNotesProps {
    notes: DebitNote[];
    suppliers: Supplier[];
    products: Product[];
    onSave: (dn: DebitNote) => void;
}

const DebitNotes: React.FC<DebitNotesProps> = ({ notes, suppliers, products, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Partial<DebitNote> | null>(null);

    const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'N/A';

    const handleAddNew = () => {
        setSelectedNote({});
        setIsModalOpen(true);
    };

    const handleEdit = (note: DebitNote) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>الإشعارات المدينة</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        إشعار مدين جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الإشعار</th>
                                <th>التاريخ</th>
                                <th>المورد</th>
                                <th>مرتبط بالمرتجع رقم</th>
                                <th>المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map(note => (
                                <tr key={note.id} onClick={() => handleEdit(note)} style={{ cursor: 'pointer' }}>
                                    <td>#{note.id}</td>
                                    <td>{new Date(note.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{getSupplierName(note.supplierId)}</td>
                                    <td>#{note.purchaseReturnId}</td>
                                    <td style={{fontWeight: 600, color: '#ef4444'}}>{note.amount.toLocaleString()} د.ك</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {notes.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد إشعارات مدينة حالياً.</p>}
                </div>
            </div>
            {isModalOpen && (
                <DebitNoteModal 
                    debitNote={selectedNote}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                    suppliers={suppliers}
                    products={products}
                />
            )}
        </>
    );
};

export default DebitNotes;
