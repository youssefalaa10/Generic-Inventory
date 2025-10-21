import React, { useState } from 'react';
import { PlusIcon } from '../components/Icon';
import JournalVoucherModal from '../components/JournalVoucherModal';
import { Account, JournalVoucher } from '../types';

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
            <div className="glass-pane journal-entries-container" style={{ padding: '1.5rem' }}>
                <div className="journal-entries-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="journal-entries-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>القيود اليومية</h3>
                    <button className="btn btn-primary journal-entries-button" onClick={handleAddNew}>
                        <PlusIcon className="journal-entries-button-icon" style={{ width: '20px', height: '20px' }} />
                        <span className="journal-entries-button-text">قيد يومية جديد</span>
                    </button>
                </div>
                <div className="table-wrapper journal-entries-table-wrapper">
                    <table className="journal-entries-table">
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
                                <tr key={voucher.id} onClick={() => handleEdit(voucher)} className="journal-entries-row" style={{cursor: 'pointer'}}>
                                    <td className="journal-entries-id">JV-{voucher.id}</td>
                                    <td className="journal-entries-date">{new Date(voucher.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="journal-entries-reference">{voucher.reference}</td>
                                    <td className="journal-entries-amount" style={{textAlign: 'right', fontWeight: 600}}>{totalAmount(voucher).toLocaleString('ar-EG', {minimumFractionDigits: 2})} د.ك</td>
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