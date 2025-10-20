import React, { useState, useEffect } from 'react';
import { Expense, Branch, FinancialAccount, ExpenseCategory } from '../types';

interface ExpenseModalProps {
    expense: Expense | null;
    onClose: () => void;
    onSave: (expense: Expense) => void;
    branches: Branch[];
    financialAccounts: FinancialAccount[];
}

const expenseCategories: { value: ExpenseCategory, label: string }[] = [
    { value: 'Rent', label: 'إيجار (التزام شهري)' },
    { value: 'Salaries', label: 'رواتب' },
    { value: 'Marketing & Branding', label: 'تسويق وعلامة تجارية' },
    { value: 'E-commerce Fees', label: 'رسوم التجارة الإلكترونية' },
    { value: 'Shipping & Delivery', label: 'شحن وتوصيل' },
    { value: 'Utilities', label: 'خدمات ومرافق (كهرباء، ماء)' },
    { value: 'Government Fees', label: 'رسوم حكومية' },
    { value: 'Maintenance', label: 'صيانة' },
    { value: 'Raw Materials', label: 'مواد خام' },
    { value: 'Packaging', label: 'مواد تغليف' },
    { value: 'Lab Supplies', label: 'مستلزمات المختبر' },
    { value: 'Other', label: 'أخرى' },
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onClose, onSave, branches, financialAccounts }) => {
    const isCreating = !expense?.id;
    const [editableExpense, setEditableExpense] = useState<Partial<Expense>>(
        isCreating 
        ? { 
            date: new Date().toISOString().split('T')[0],
            branchId: branches[0]?.id || 0,
            category: 'Other',
            amount: 0,
            description: '',
            paidFromAccountId: financialAccounts[0]?.id || 0
          } 
        : expense
    );

    useEffect(() => {
        setEditableExpense(isCreating ? { 
            date: new Date().toISOString().split('T')[0],
            branchId: branches[0]?.id || 0,
            category: 'Other',
            amount: 0,
            description: '',
            paidFromAccountId: financialAccounts[0]?.id || 0
          } : expense);
    }, [expense, isCreating, branches, financialAccounts]);

    const handleChange = (field: keyof Expense, value: string | number) => {
        setEditableExpense(prev => ({ ...prev, [field as keyof Expense]: value }));
    };

    const handleSave = () => {
        if (editableExpense.amount && editableExpense.amount > 0 && editableExpense.description) {
            onSave(editableExpense as Expense);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" style={{ maxWidth: '40rem' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{isCreating ? 'إضافة مصروف جديد' : 'تعديل المصروف'}</h2>
                </div>
                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="form-label">التاريخ</label>
                        <input type="date" value={editableExpense.date || ''} onChange={(e) => handleChange('date', e.target.value)} className="form-input" />
                    </div>
                     <div>
                        <label className="form-label">الفرع</label>
                         <select value={editableExpense.branchId || ''} onChange={(e) => handleChange('branchId', parseInt(e.target.value))} className="form-select">
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">الفئة</label>
                        <select value={editableExpense.category || ''} onChange={(e) => handleChange('category', e.target.value)} className="form-select">
                            {expenseCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">المبلغ</label>
                        <input type="number" value={editableExpense.amount || ''} onChange={(e) => handleChange('amount', parseFloat(e.target.value))} className="form-input" />
                    </div>
                     <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">مدفوع من حساب</label>
                        <select value={editableExpense.paidFromAccountId || ''} onChange={(e) => handleChange('paidFromAccountId', parseInt(e.target.value))} className="form-select">
                            {financialAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">الوصف</label>
                        <textarea
                            value={editableExpense.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="form-input"
                            rows={3}
                        />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSave} className="btn btn-secondary">
                        {isCreating ? 'حفظ المصروف' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;
