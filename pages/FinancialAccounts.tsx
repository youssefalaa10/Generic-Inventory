import React from 'react';
import { FinancialAccount, Branch } from '../types';
import { CurrencyDollarIcon } from '../components/Icon';

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
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>الخزائن والحسابات البنكية</h3>
                {/* <button className="btn btn-primary">إضافة حساب جديد</button> */}
            </div>
            <div className="table-wrapper">
                <table>
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
                                    <span style={{
                                        padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px',
                                        color: 'var(--text-secondary)',
                                        background: 'var(--surface-bg)',
                                        border: '1px solid var(--surface-border)'
                                    }}>
                                        {acc.type === 'Bank' ? 'بنك' : 'خزينة'}
                                    </span>
                                </td>
                                <td>{getBranchName(acc.branchId)}</td>
                                <td style={{ color: 'var(--secondary-color)', fontWeight: 700, fontSize: '1.1rem' }}>
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