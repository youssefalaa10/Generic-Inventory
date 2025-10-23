import React, { useState, useEffect, useMemo } from 'react';
import { JournalVoucher, JournalVoucherLine, Account } from '../types';
import { PlusIcon, TrashIcon } from './Icon';
import { useToasts } from './Toast';

interface JournalVoucherModalProps {
    voucher: Partial<JournalVoucher> | null;
    onClose: () => void;
    onSave: (voucher: JournalVoucher) => void;
    accounts: Account[];
}

const flattenAccounts = (accounts: Account[], indent = 0): { label: string, value: string }[] => {
    let list: { label: string, value: string }[] = [];
    accounts.forEach(account => {
        const prefix = '\u00A0\u00A0'.repeat(indent);
        list.push({ label: `${prefix}${account.name} (${account.id})`, value: account.id });
        if (account.children) {
            list = list.concat(flattenAccounts(account.children, indent + 1));
        }
    });
    return list;
};

const JournalVoucherModal: React.FC<JournalVoucherModalProps> = ({ voucher, onClose, onSave, accounts }) => {
    const isCreating = !voucher?.id;
    const { addToast } = useToasts();
    const [editableVoucher, setEditableVoucher] = useState<Partial<JournalVoucher>>({});
    
    const accountOptions = useMemo(() => flattenAccounts(accounts), [accounts]);

    useEffect(() => {
        setEditableVoucher(isCreating ? {
            date: new Date().toISOString().split('T')[0],
            reference: '',
            lines: [
                { id: 1, accountId: '', debit: 0, credit: 0, description: '' },
                { id: 2, accountId: '', debit: 0, credit: 0, description: '' },
            ],
        } : JSON.parse(JSON.stringify(voucher))); // Deep copy for editing
    }, [voucher, isCreating]);

    const handleHeaderChange = (field: keyof JournalVoucher, value: string) => {
        setEditableVoucher(prev => ({ ...prev, [field]: value }));
    };

    const handleLineChange = (id: number, field: keyof JournalVoucherLine, value: string | number) => {
        setEditableVoucher(prev => {
            const newLines = prev.lines?.map(line => {
                if (line.id === id) {
                    const updatedLine = { ...line, [field]: value };
                    if (field === 'debit' && Number(value) > 0) updatedLine.credit = 0;
                    if (field === 'credit' && Number(value) > 0) updatedLine.debit = 0;
                    return updatedLine;
                }
                return line;
            });
            return { ...prev, lines: newLines };
        });
    };

    const handleAddLine = () => {
        const newLine: JournalVoucherLine = {
            id: Date.now(),
            accountId: '',
            debit: 0,
            credit: 0,
            description: '',
        };
        setEditableVoucher(prev => ({ ...prev, lines: [...(prev.lines || []), newLine] }));
    };

    const handleRemoveLine = (id: number) => {
        if ((editableVoucher.lines?.length || 0) <= 2) {
            addToast('A journal entry must have at least two lines.', 'error');
            return;
        }
        setEditableVoucher(prev => ({ ...prev, lines: (prev.lines || []).filter(line => line.id !== id) }));
    };

    const totals = useMemo(() => {
        const totalDebit = (editableVoucher.lines || []).reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = (editableVoucher.lines || []).reduce((sum, line) => sum + (line.credit || 0), 0);
        return {
            debit: totalDebit,
            credit: totalCredit,
            difference: totalDebit - totalCredit,
        };
    }, [editableVoucher.lines]);

    const isBalanced = Math.abs(totals.difference) < 0.001;

    const handleSaveClick = () => {
        if (!isBalanced) {
            addToast('Debits must equal credits before saving.', 'error');
            return;
        }
        if ((editableVoucher.lines || []).some(line => !line.accountId)) {
            addToast('Please select an account for every line.', 'error');
            return;
        }
        if (!editableVoucher.reference?.trim()) {
            addToast('Please provide a reference for the entry.', 'error');
            return;
        }
        onSave(editableVoucher as JournalVoucher);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '60rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isCreating ? 'قيد يومية جديد' : `تعديل قيد #${voucher?.id}`}</h2>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label required">التاريخ</label>
                            <input type="date" value={editableVoucher.date} onChange={e => handleHeaderChange('date', e.target.value)} className="form-input" />
                        </div>
                        <div>
                            <label className="form-label required">البيان / المرجع</label>
                            <input type="text" value={editableVoucher.reference} onChange={e => handleHeaderChange('reference', e.target.value)} className="form-input" />
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{width: '35%'}}>الحساب</th>
                                    <th>البيان</th>
                                    <th style={{width: '120px'}}>مدين</th>
                                    <th style={{width: '120px'}}>دائن</th>
                                    <th style={{width: '50px'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(editableVoucher.lines || []).map(line => (
                                    <tr key={line.id}>
                                        <td style={{padding: '0.5rem'}}>
                                            <select value={line.accountId} onChange={e => handleLineChange(line.id, 'accountId', e.target.value)} className="form-select">
                                                <option value="" disabled>اختر حساب...</option>
                                                {accountOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </td>
                                        <td style={{padding: '0.5rem'}}><input type="text" value={line.description || ''} onChange={e => handleLineChange(line.id, 'description', e.target.value)} className="form-input" /></td>
                                        <td style={{padding: '0.5rem'}}><input type="number" step="0.001" value={line.debit || ''} onChange={e => handleLineChange(line.id, 'debit', parseFloat(e.target.value))} className="form-input" /></td>
                                        <td style={{padding: '0.5rem'}}><input type="number" step="0.001" value={line.credit || ''} onChange={e => handleLineChange(line.id, 'credit', parseFloat(e.target.value))} className="form-input" /></td>
                                        <td><button onClick={() => handleRemoveLine(line.id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><TrashIcon style={{width:'20px',height:'20px'}}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem'}}>
                         <button onClick={handleAddLine} className="btn btn-ghost"><PlusIcon style={{width:'20px',height:'20px'}}/> إضافة سطر</button>
                         <div className="journal-totals">
                            <div className="journal-totals-row"><span>إجمالي المدين</span><span>{totals.debit.toLocaleString('ar-EG', {minimumFractionDigits: 3})}</span></div>
                            <div className="journal-totals-row"><span>إجمالي الدائن</span><span>{totals.credit.toLocaleString('ar-EG', {minimumFractionDigits: 3})}</span></div>
                            <div className="journal-totals-row total">
                                <span>الفرق</span>
                                <span className={`difference ${isBalanced ? 'balanced' : 'unbalanced'}`}>
                                    {totals.difference.toLocaleString('ar-EG', {minimumFractionDigits: 3})}
                                </span>
                            </div>
                         </div>
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSaveClick} className="btn btn-secondary" disabled={!isBalanced}>
                        {isCreating ? 'حفظ القيد' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalVoucherModal;