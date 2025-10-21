import React, { useState, useMemo } from 'react';
import { Account, Sale, PurchaseInvoice, Expense, GeneralLedgerEntry } from '../types';
import { ChevronDownIcon, PlusIcon, CollectionIcon } from '../components/Icon';

interface ChartOfAccountsPageProps {
    accounts: Account[];
    sales: Sale[];
    purchases: PurchaseInvoice[];
    expenses: Expense[];
    onSave: (account: Account) => void;
}

interface AccountNodeProps {
    account: Account;
    onSelect: (id: string) => void;
    isSelected: boolean;
    expandedNodes: Set<string>;
    toggleNode: (id: string) => void;
}

const AccountNode: React.FC<AccountNodeProps> = ({ account, onSelect, isSelected, expandedNodes, toggleNode }) => {
    const isParent = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);

    return (
        <li className="coa-node">
            <div 
                className={`coa-node-content ${isParent ? 'parent' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(account.id)}
            >
                <div className="coa-info">
                    {isParent ? (
                        <button onClick={(e) => { e.stopPropagation(); toggleNode(account.id); }} className={`coa-toggle ${isExpanded ? 'expanded' : ''}`}>
                             <ChevronDownIcon style={{ transform: 'rotate(-90deg)' }} />
                        </button>
                    ) : (
                        <span style={{ width: '44px', display: 'inline-block' }}></span> // Spacer
                    )}
                    <span className="coa-id">{account.id}</span>
                    <span className="coa-name">{account.name}</span>
                </div>
                <span className="coa-type">{account.type}</span>
            </div>
            {isParent && isExpanded && (
                <ul className="coa-node-children">
                    {account.children?.map(child => (
                        <AccountNode 
                            key={child.id} 
                            account={child} 
                            onSelect={onSelect}
                            isSelected={isSelected} // Pass down isSelected for subtree highlighting if needed
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const formatCurrency = (val: number) => val.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ChartOfAccountsPage: React.FC<ChartOfAccountsPageProps> = ({ accounts, sales, purchases, expenses, onSave }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']));
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const allAccountIds = useMemo(() => {
        const ids: string[] = [];
        const traverse = (accs: Account[]) => {
            accs.forEach(acc => {
                ids.push(acc.id);
                if (acc.children) traverse(acc.children);
            });
        };
        traverse(accounts);
        return ids;
    }, [accounts]);

    const accountBalances = useMemo(() => {
        const balances = new Map<string, { debit: number, credit: number }>();
        allAccountIds.forEach(id => balances.set(id, { debit: 0, credit: 0 }));

        // Process transactions
        sales.forEach(s => {
            balances.get('1-1200')!.debit += s.totalAmount; // الذمم المدينة
            if (s.brand === 'Arabiva') balances.get('4-1100')!.credit += s.totalAmount; // مبيعات Arabiva
            else balances.get('4-1200')!.credit += s.totalAmount; // مبيعات Generic
        });
        purchases.forEach(p => {
            balances.get('1-1300')!.debit += p.amount; // المخزون
            balances.get('2-1100')!.credit += p.amount; // الذمم الدائنة
        });
        expenses.forEach(e => {
            // A simple model: all expenses debit a general expense account and credit cash
            balances.get('5-2000')!.debit += e.amount; // مصروفات تشغيلية
            balances.get('1-1100')!.credit += e.amount; // النقدية
        });

        // Propagate balances up the tree
        const propagate = (account: Account): { debit: number, credit: number } => {
            const myTotals = balances.get(account.id)!;
            if (!account.children) return myTotals;
            
            const childrenTotals = account.children.map(propagate).reduce((sum, current) => ({
                debit: sum.debit + current.debit,
                credit: sum.credit + current.credit,
            }), { debit: 0, credit: 0 });
            
            myTotals.debit += childrenTotals.debit;
            myTotals.credit += childrenTotals.credit;
            return myTotals;
        };
        accounts.forEach(propagate);

        return balances;
    }, [accounts, sales, purchases, expenses, allAccountIds]);
    
    const selectedAccountDetails = useMemo(() => {
        if (!selectedAccountId) return null;
        
        const findAccount = (id: string, accs: Account[]): Account | null => {
            for (const acc of accs) {
                if (acc.id === id) return acc;
                if (acc.children) {
                    const found = findAccount(id, acc.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const account = findAccount(selectedAccountId, accounts);
        if (!account) return null;

        const balance = accountBalances.get(selectedAccountId) || { debit: 0, credit: 0 };
        const netBalance = balance.debit - balance.credit;

        const entries: GeneralLedgerEntry[] = [];
        sales.forEach(s => {
            if (selectedAccountId === '1-1200') entries.push({ id: `s-d-${s.id}`, date: s.date, account: s.customerName, description: `From Sales Invoice #${s.invoiceNumber}`, debit: s.totalAmount, credit: 0, sourceType: 'Sale', sourceId: s.id });
            const revAcc = s.brand === 'Arabiva' ? '4-1100' : '4-1200';
            if (selectedAccountId === revAcc) entries.push({ id: `s-c-${s.id}`, date: s.date, account: revAcc, description: `Sales Invoice #${s.invoiceNumber}`, debit: 0, credit: s.totalAmount, sourceType: 'Sale', sourceId: s.id });
        });
         purchases.forEach(p => {
            if (selectedAccountId === '1-1300') entries.push({ id: `p-d-${p.id}`, date: p.date, account: 'Inventory', description: `From Purchase #${p.id}`, debit: p.amount, credit: 0, sourceType: 'Purchase', sourceId: p.id });
            if (selectedAccountId === '2-1100') entries.push({ id: `p-c-${p.id}`, date: p.date, account: 'Accounts Payable', description: `Purchase #${p.id}`, debit: 0, credit: p.amount, sourceType: 'Purchase', sourceId: p.id });
        });
        expenses.forEach(e => {
             if (selectedAccountId === '5-2000') entries.push({ id: `e-d-${e.id}`, date: e.date, account: e.category, description: e.description, debit: e.amount, credit: 0, sourceType: 'Expense', sourceId: e.id });
             if (selectedAccountId === '1-1100') entries.push({ id: `e-c-${e.id}`, date: e.date, account: 'Cash/Bank', description: `Payment for ${e.description}`, debit: 0, credit: e.amount, sourceType: 'Expense', sourceId: e.id });
        });
        
        return { account, balance, netBalance, transactions: entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20) };
    }, [selectedAccountId, accounts, accountBalances, sales, purchases, expenses]);


    return (
        <div className="coa-container">
            <div className="coa-tree-pane glass-pane">
                 <div style={{padding: '1.5rem 1.5rem 0.5rem 1.5rem'}}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>دليل الحسابات</h3>
                 </div>
                 <ul className="coa-tree" style={{padding: '0.5rem 1.5rem 1.5rem 1.5rem'}}>
                    {accounts.map(account => (
                        <AccountNode 
                            key={account.id}
                            account={account}
                            onSelect={setSelectedAccountId}
                            isSelected={selectedAccountId === account.id}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    ))}
                </ul>
            </div>
            <div className="coa-detail-pane">
                {selectedAccountDetails ? (
                    <>
                        <div className="coa-detail-header">
                            <h3>{selectedAccountDetails.account.name}</h3>
                            <p>#{selectedAccountDetails.account.id} - {selectedAccountDetails.account.type}</p>
                        </div>
                        <div className="summary-grid" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
                            <div className="summary-item">
                                <p className="summary-item-label">إجمالي المدين</p>
                                <p className="summary-item-value">{formatCurrency(selectedAccountDetails.balance.debit)}</p>
                            </div>
                            <div className="summary-item">
                                <p className="summary-item-label">إجمالي الدائن</p>
                                <p className="summary-item-value">{formatCurrency(selectedAccountDetails.balance.credit)}</p>
                            </div>
                            <div className="summary-item">
                                <p className="summary-item-label">الرصيد الصافي</p>
                                <p className="summary-item-value" style={{color: selectedAccountDetails.netBalance >= 0 ? 'var(--secondary-color)' : '#ef4444'}}>
                                    {formatCurrency(selectedAccountDetails.netBalance)}
                                </p>
                            </div>
                        </div>
                        <div className="glass-pane">
                            <h4 style={{padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', fontWeight: 600}}>آخر الحركات</h4>
                            <div className="table-wrapper" style={{background: 'transparent', border: 'none'}}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>التاريخ</th>
                                            <th>الوصف</th>
                                            <th style={{textAlign: 'center'}}>مدين</th>
                                            <th style={{textAlign: 'center'}}>دائن</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedAccountDetails.transactions.map(t => (
                                            <tr key={t.id}>
                                                <td>{t.date}</td>
                                                <td>{t.description}</td>
                                                <td style={{textAlign: 'center', color: t.debit > 0 ? 'var(--text-primary)' : 'var(--text-secondary)'}}>{t.debit > 0 ? formatCurrency(t.debit) : '-'}</td>
                                                <td style={{textAlign: 'center', color: t.credit > 0 ? 'var(--text-primary)' : 'var(--text-secondary)'}}>{t.credit > 0 ? formatCurrency(t.credit) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {selectedAccountDetails.transactions.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد حركات لعرضها.</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="coa-detail-placeholder glass-pane">
                        <CollectionIcon style={{width: 48, height: 48, marginBottom: '1rem'}}/>
                        <h3 style={{fontSize: '1.25rem', fontWeight: 600}}>اختر حساباً من الدليل</h3>
                        <p>لعرض تفاصيله المالية وحركاته الأخيرة.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartOfAccountsPage;