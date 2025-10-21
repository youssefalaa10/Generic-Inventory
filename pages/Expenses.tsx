import React, { useState } from 'react';
import ExpenseModal from '../components/ExpenseModal';
import { PencilIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { Branch, Expense, ExpenseCategory, FinancialAccount } from '../types';

interface ExpensesProps {
    expenses: Expense[];
    onSave: (expense: Expense) => void;
    branches: Branch[];
    financialAccounts: FinancialAccount[];
}

const categoryTranslations: { [key in ExpenseCategory]: string } = {
    'Rent': 'إيجار (التزام شهري)',
    'Salaries': 'رواتب',
    'Marketing & Branding': 'تسويق وعلامة تجارية',
    'E-commerce Fees': 'رسوم التجارة الإلكترونية',
    'Shipping & Delivery': 'شحن وتوصيل',
    'Utilities': 'خدمات ومرافق (كهرباء، ماء)',
    'Government Fees': 'رسوم حكومية',
    'Maintenance': 'صيانة',
    'Raw Materials': 'مواد خام',
    'Packaging': 'مواد تغليف',
    'Lab Supplies': 'مستلزمات المختبر',
    'Other': 'أخرى'
};


const Expenses: React.FC<ExpensesProps> = ({ expenses, onSave, branches, financialAccounts }) => {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [filterBranch, setFilterBranch] = useState<string>('all');

    const handleSave = (expense: Expense) => {
        onSave(expense);
        setIsModalOpen(false);
        setSelectedExpense(null);
        addToast(`Expense ${expense.id ? 'updated' : 'added'} successfully!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedExpense({} as Expense);
        setIsModalOpen(true);
    };
    
    const handleEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const filteredExpenses = filterBranch === 'all'
        ? expenses
        : expenses.filter(e => e.branchId === parseInt(filterBranch));

    return (
        <>
            <div className="glass-pane expenses-page-container" style={{ padding: '1.5rem' }}>
                <div className="expenses-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="expenses-page-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>سجل المصروفات</h3>
                    <div className="expenses-page-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="expenses-filter" style={{ width: '250px' }}>
                            <select onChange={(e) => setFilterBranch(e.target.value)} value={filterBranch} className="form-select">
                                <option value="all">كل الفروع</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleAddNew} className="btn btn-primary expenses-button">
                            إضافة مصروف جديد
                        </button>
                    </div>
                </div>
                <div className="table-wrapper expenses-table-wrapper">
                    <table className="expenses-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الفرع</th>
                                <th>الفئة</th>
                                <th>الوصف</th>
                                <th>المبلغ</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(e => (
                                <tr key={e.id}>
                                    <td>{e.date}</td>
                                    <td>{branches.find(b => b.id === e.branchId)?.name}</td>
                                    <td>{categoryTranslations[e.category] || e.category}</td>
                                    <td>{e.description}</td>
                                    <td className="expenses-amount" style={{ color: '#ef4444', fontWeight: 600 }}>{e.amount.toLocaleString()} د.ك</td>
                                    <td className="expenses-actions">
                                        <button onClick={() => handleEdit(e)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}>
                                            <PencilIcon style={{width:'20px', height:'20px'}}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <ExpenseModal 
                    expense={selectedExpense}
                    onClose={() => { setIsModalOpen(false); setSelectedExpense(null); }}
                    onSave={handleSave}
                    branches={branches}
                    financialAccounts={financialAccounts}
                />
            )}
        </>
    );
};

export default Expenses;
