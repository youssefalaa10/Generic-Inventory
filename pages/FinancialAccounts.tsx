import React from 'react';
import { Branch, FinancialAccount } from '../types';

interface FinancialAccountsProps {
    financialAccounts: FinancialAccount[];
    branches: Branch[];
}

const FinancialAccounts: React.FC<FinancialAccountsProps> = ({ financialAccounts, branches }) => {

    const getBranchName = (branchId?: number) => {
        if (!branchId) return 'N/A';
        return branches.find(b => b.id === branchId)?.name || 'Unknown';
    };

    return (
        <div className="glass-pane financial-accounts-container" style={{ padding: '1.5rem' }}>
            <div className="financial-accounts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="financial-accounts-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>الخزائن والحسابات البنكية</h3>
                {/* <button className="btn btn-primary">إضافة حساب جديد</button> */}
            </div>
            <div className="table-wrapper financial-accounts-table-wrapper">
                <table className="financial-accounts-table">
                    <thead>
                        <tr>
                            <th>اسم الحساب</th>
                            <th>النوع</th>
                            <th>الفرع</th>
                            <th>الرصيد الحالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financialAccounts.map(acc => (
                            <tr key={acc.id}>
                                <td style={{ fontWeight: 600 }}>{acc.name}</td>
                                <td>
                                    <span className="financial-account-type" style={{
                                        padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px',
                                        color: 'var(--text-secondary)',
                                        background: 'var(--surface-bg)',
                                        border: '1px solid var(--surface-border)'
                                    }}>
                                        {acc.type === 'Bank' ? 'بنك' : 'خزينة'}
                                    </span>
                                </td>
                                <td>{getBranchName(acc.branchId)}</td>
                                <td className="financial-account-balance" style={{ color: 'var(--secondary-color)', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ك
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialAccounts;