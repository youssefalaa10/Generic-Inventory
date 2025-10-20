import React, { useState } from 'react';
import { Account } from '../types';
import { ChevronDownIcon, PencilIcon, PlusIcon } from '../components/Icon';

interface ChartOfAccountsPageProps {
    accounts: Account[];
    onSave: (account: Account) => void;
}

interface AccountNodeProps {
    account: Account;
    level: number;
    expandedNodes: Set<string>;
    toggleNode: (id: string) => void;
}

const AccountNode: React.FC<AccountNodeProps> = ({ account, level, expandedNodes, toggleNode }) => {
    const isParent = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);

    return (
        <li className="coa-node">
            <div className={`coa-node-content ${isParent ? 'parent' : ''}`}>
                <div className="coa-info">
                    {isParent ? (
                        <button onClick={() => toggleNode(account.id)} className={`coa-toggle ${isExpanded ? 'expanded' : ''}`}>
                             <ChevronDownIcon style={{ transform: 'rotate(-90deg)' }} />
                        </button>
                    ) : (
                        <span style={{ width: '44px', display: 'inline-block' }}></span> // Spacer
                    )}
                    <span className="coa-id">{account.id}</span>
                    <span className="coa-name">{account.name}</span>
                </div>
                 <div className="coa-actions">
                    <button style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="Edit Account">
                        <PencilIcon style={{width:'20px', height:'20px'}}/>
                    </button>
                </div>
                <span className="coa-type">{account.type}</span>
            </div>
            {isParent && isExpanded && (
                <ul className="coa-node-children">
                    {account.children?.map(child => (
                        <AccountNode 
                            key={child.id} 
                            account={child} 
                            level={level + 1} 
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const ChartOfAccountsPage: React.FC<ChartOfAccountsPageProps> = ({ accounts, onSave }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
        new Set(['1', '2', '3', '4', '5']) // Expand top-level by default
    );

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>دليل الحسابات</h3>
                <button className="btn btn-primary">
                    <PlusIcon style={{ width: '20px', height: '20px' }} />
                    إضافة حساب جديد
                </button>
            </div>

            <div className="table-wrapper" style={{background: 'transparent', backdropFilter: 'none', border: 'none'}}>
                 <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                 }}>
                    <span style={{width: '184px', paddingRight: '44px'}}>كود الحساب</span>
                    <span style={{flexGrow: 1}}>اسم الحساب</span>
                    <span style={{width: '100px'}}>نوع الحساب</span>
                 </div>
                 <ul className="coa-tree">
                    {accounts.map(account => (
                        <AccountNode 
                            key={account.id}
                            account={account}
                            level={0}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChartOfAccountsPage;