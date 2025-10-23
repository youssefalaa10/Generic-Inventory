import React, { useState } from 'react';
import { JournalVoucher, Account } from '../types';
import { PlusIcon } from '../components/Icon';
import JournalVoucherModal from '../components/JournalVoucherModal';

interface JournalEntriesPageProps {
    journalVouchers: JournalVoucher[];
    onSave: (voucher: JournalVoucher) => void;
    accounts: Account[];
}

const JournalEntriesPage: React.FC<JournalEntriesPageProps> = ({ journalVouchers, onSave, accounts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Partial<JournalVoucher> | null>(null);
    
    const handleAddNew = () => {
        setSelectedVoucher({});
        setIsModalOpen(true);
    };

    const handleEdit = (voucher: JournalVoucher) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    const handleSaveAndClose = (voucher: JournalVoucher) => {
        onSave(voucher);
        setIsModalOpen(false);
        setSelectedVoucher(null);
    };

    const totalAmount = (voucher: JournalVoucher) => {
        return voucher.lines.reduce((sum, line) => sum + line.debit, 0);
    }

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>القيود اليومية</h3>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <PlusIcon style={{ width: '20px', height: '20px' }} />
                        قيد يومية جديد
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>التاريخ</th>
                                <th>البيان / المرجع</th>
                                <th style={{textAlign: 'right'}}>المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journalVouchers.map(voucher => (
                                <tr key={voucher.id} onClick={() => handleEdit(voucher)} style={{cursor: 'pointer'}}>
                                    <td>JV-{voucher.id}</td>
                                    <td>{new Date(voucher.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{voucher.reference}</td>
                                    <td style={{textAlign: 'right', fontWeight: 600}}>{totalAmount(voucher).toLocaleString('ar-EG', {minimumFractionDigits: 2})} د.ك</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <JournalVoucherModal
                    voucher={selectedVoucher}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAndClose}
                    accounts={accounts}
                />
            )}
        </>
    );
};

export default JournalEntriesPage;