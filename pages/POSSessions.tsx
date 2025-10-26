import React, { useMemo, useState } from 'react';
import { CalendarIcon, CashIcon, ChevronDownIcon, ChevronUpIcon, CreditCardIcon, CurrencyDollarIcon, DocumentTextIcon } from '../components/Icon';
import { Branch, EmployeeData, PaymentMethod, POSSession, Sale } from '../types';

interface POSSessionsProps {
    sessions: POSSession[];
    activeSession: POSSession | null;
    sales: Sale[];
    branches: Branch[];
    employees: EmployeeData[];
    onStartSession: (openingBalance: number, branchId: number) => void;
    onCloseSession: (closingBalance: number) => void;
    setActiveView: (view: string) => void;
}

const formatCurrency = (amount: number) => `${amount.toLocaleString('ar-EG', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك`;
const formatTime = (isoString?: string) => isoString ? new Date(isoString).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
const formatDate = (isoString?: string) => isoString ? new Date(isoString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

const POSSessions: React.FC<POSSessionsProps> = ({ sessions, activeSession, sales, branches, employees, onStartSession, onCloseSession, setActiveView }) => {
    const [isStartModalOpen, setStartModalOpen] = useState(false);
    const [isCloseModalOpen, setCloseModalOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const [filters, setFilters] = useState({
        branchId: 'all',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const sessionDetails = useMemo(() => {
        return sessions.map(session => {
            const sessionSales = sales.filter(s => session.salesIds.includes(s.id));
            const payments = sessionSales.reduce((acc, sale) => {
                const method = sale.paymentMethod;
                acc[method] = (acc[method] || 0) + sale.totalAmount;
                return acc;
            }, {} as Record<PaymentMethod, number>);

            const branch = branches.find(b => b.id === session.branchId);
            const employee = employees.find(e => e.branchId === session.branchId); // Simplified logic for demo

            return {
                ...session,
                branchName: branch?.name || 'Unknown',
                totalSalesValue: sessionSales.reduce((sum, s) => sum + s.totalAmount, 0),
                payments: {
                    cash: payments['Cash'] || 0,
                    knet: (payments['K-Net'] || 0) + (payments['Card'] || 0),
                    credit: payments['Credit'] || 0,
                },
                invoicesCount: sessionSales.length,
                employee: employee?.name || "موظف النظام",
                device: `Shop ${session.branchId} #${String(session.id).padStart(6, '0')}`,
                note: `ورديّة ${session.id}`
            }
        }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [sessions, sales, branches, employees]);
    
    const filteredSessionDetails = useMemo(() => {
        return sessionDetails.filter(session => {
            const sessionDate = new Date(session.startTime);
            const branchMatch = filters.branchId === 'all' || session.branchId === Number(filters.branchId);
            const startDateMatch = !filters.startDate || sessionDate >= new Date(filters.startDate);
            let endDateMatch = true;
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999); // Include the whole day
                endDateMatch = sessionDate <= end;
            }
            return branchMatch && startDateMatch && endDateMatch;
        });
    }, [sessionDetails, filters]);

    const summaryData = useMemo(() => {
        return filteredSessionDetails.reduce((acc, session) => {
            acc.totalSales += session.totalSalesValue;
            acc.totalCash += session.payments.cash;
            acc.totalKnet += session.payments.knet;
            acc.totalInvoices += session.invoicesCount;
            return acc;
        }, { totalSales: 0, totalCash: 0, totalKnet: 0, totalInvoices: 0 });
    }, [filteredSessionDetails]);

    const activeSessionDetails = useMemo(() => {
        if (!activeSession) return null;
        return sessionDetails.find(s => s.id === activeSession.id);
    }, [activeSession, sessionDetails]);
    
    const activeSessionTotals = useMemo(() => {
        if (!activeSessionDetails) return { totalSalesValue: 0, cashSales: 0, expectedCash: 0 };
        const { openingBalance, payments } = activeSessionDetails;
        return {
            totalSalesValue: activeSessionDetails.totalSalesValue,
            cashSales: payments.cash,
            expectedCash: openingBalance + payments.cash,
        }
    }, [activeSessionDetails]);


    const handleToggle = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="pos-sessions-container">
            {activeSession ? (
                 <div className="glass-pane" style={{ padding: '1.5rem' }}>
                    <div className="pos-sessions-header">
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--secondary-color)' }}>جلسة نشطة</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>بدأت في: {formatTime(activeSession.startTime)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-warning" onClick={() => setCloseModalOpen(true)}>إغلاق الجلسة</button>
                            <button className="btn btn-secondary" onClick={() => setActiveView('POS/Start')}>الانتقال إلى نقطة البيع</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-pane" style={{ padding: '2rem', textAlign: 'center' }}>
                    <CalendarIcon style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>لا توجد جلسة نشطة</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>ابدأ جلسة جديدة لتسجيل المبيعات اليومية.</p>
                    <button className="btn btn-primary" onClick={() => setStartModalOpen(true)}>+ بدء جلسة جديدة</button>
                </div>
            )}
            
            <div className="glass-pane pos-sessions-filters-enhanced">
                <div className="pos-sessions-filters-header">
                    <h3 className="pos-sessions-title">
                        <CalendarIcon style={{ width: '24px', height: '24px', marginLeft: '0.5rem' }} />
                        فلاتر البحث
                    </h3>
                    <div className="pos-sessions-filter-actions">
                        <button 
                            onClick={() => setFilters({ branchId: 'all', startDate: '', endDate: '' })}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                            مسح الفلاتر
                        </button>
                    </div>
                </div>
                
                <div className="pos-sessions-filter-grid">
                    <div className="pos-sessions-filter-item">
                        <label className="pos-sessions-filter-label">
                            <span className="filter-label-text">الفرع</span>
                            <span className="filter-label-required">*</span>
                        </label>
                        <select 
                            name="branchId" 
                            value={filters.branchId} 
                            onChange={handleFilterChange} 
                            className="form-select pos-sessions-filter-select-enhanced"
                        >
                            <option value="all">🏢 كل الفروع</option>
                            {branches.map(b => <option key={b.id} value={b.id}>🏪 {b.name}</option>)}
                    </select>
                    </div>
                    
                    <div className="pos-sessions-filter-item">
                        <label className="pos-sessions-filter-label">
                            <span className="filter-label-text">من تاريخ</span>
                        </label>
                        <input 
                            type="date" 
                            name="startDate" 
                            value={filters.startDate} 
                            onChange={handleFilterChange} 
                            className="form-input pos-sessions-filter-input-enhanced"
                            placeholder="اختر تاريخ البداية"
                        />
                    </div>
                    
                    <div className="pos-sessions-filter-item">
                        <label className="pos-sessions-filter-label">
                            <span className="filter-label-text">إلى تاريخ</span>
                        </label>
                        <input 
                            type="date" 
                            name="endDate" 
                            value={filters.endDate} 
                            onChange={handleFilterChange} 
                            className="form-input pos-sessions-filter-input-enhanced"
                            placeholder="اختر تاريخ النهاية"
                        />
                    </div>
                </div>
                
                {/* Filter Status */}
                <div className="pos-sessions-filter-status">
                    <div className="filter-status-indicators">
                        {filters.branchId !== 'all' && (
                            <span className="filter-status-badge">
                                <span className="filter-status-icon">🏪</span>
                                {branches.find(b => b.id === Number(filters.branchId))?.name || 'فرع محدد'}
                            </span>
                        )}
                        {filters.startDate && (
                            <span className="filter-status-badge">
                                <span className="filter-status-icon">📅</span>
                                من: {new Date(filters.startDate).toLocaleDateString('ar-EG')}
                            </span>
                        )}
                        {filters.endDate && (
                            <span className="filter-status-badge">
                                <span className="filter-status-icon">📅</span>
                                إلى: {new Date(filters.endDate).toLocaleDateString('ar-EG')}
                            </span>
                        )}
                    </div>
                    <div className="filter-results-count">
                        عرض {filteredSessionDetails.length} من {sessionDetails.length} جلسة
                    </div>
                </div>
            </div>

            <div className="pos-sessions-summary-grid">
                <SummaryCard title="إجمالي مبيعات جميع الجلسات" value={formatCurrency(summaryData.totalSales)} icon={CurrencyDollarIcon} />
                <SummaryCard title="إجمالي نقدي" value={formatCurrency(summaryData.totalCash)} icon={CashIcon} />
                <SummaryCard title="إجمالي Knet" value={formatCurrency(summaryData.totalKnet)} icon={CreditCardIcon} />
                <SummaryCard title="عدد الفواتير الكلي" value={summaryData.totalInvoices.toLocaleString('ar-EG')} icon={DocumentTextIcon} />
            </div>

            <div className="glass-pane" style={{ padding: '1.5rem' }}>
                <h3 className="pos-sessions-title">الجلسات</h3>
                <div className="pos-sessions-table-wrapper">
                    <table className="pos-sessions-table">
                        <thead>
                            <tr>
                                <th>الفرع</th>
                                <th>رقم الجلسة</th>
                                <th>وقت الفتح</th>
                                <th>إجمالي المبيعات</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessionDetails.map((session) => (
                                <React.Fragment key={session.id}>
                                    <tr style={{ backgroundColor: session.status === 'Open' ? 'var(--highlight-hover)' : 'transparent' }}>
                                        <td style={{ fontWeight: 600 }}>{session.branchName}</td>
                                        <td>#{session.id}</td>
                                        <td>{formatTime(session.startTime)}</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--text-primary)'}}>{formatCurrency(session.totalSalesValue)}</td>
                                        <td>
                                            <button onClick={() => handleToggle(session.id)} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                                {expandedRow === session.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                                {expandedRow === session.id ? <ChevronUpIcon style={{ width: '16px', height: '16px' }} /> : <ChevronDownIcon style={{ width: '16px', height: '16px' }} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === session.id && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: 0, background: 'rgba(0,0,0,0.05)' }}>
                                                <div className="pos-sessions-details-grid">
                                                    <DetailItem label="إجمالي المبيعات" value={formatCurrency(session.totalSalesValue)} />
                                                    <DetailItem label="نقدي" value={formatCurrency(session.payments.cash)} />
                                                    <DetailItem label="Knet" value={formatCurrency(session.payments.knet)} />
                                                    <DetailItem label="عدد الفواتير" value={session.invoicesCount} />
                                                    <DetailItem label="وقت الفتح" value={`${formatDate(session.startTime)} - ${formatTime(session.startTime)}`} />
                                                    <DetailItem label="وقت الإغلاق" value={session.endTime ? `${formatDate(session.endTime)} - ${formatTime(session.endTime)}` : 'N/A'} />
                                                    <DetailItem label="الكاشير" value={session.employee} />
                                                    <DetailItem label="الجهاز" value={session.device} />
                                                    <div style={{ gridColumn: 'span 2' }}><DetailItem label="ملاحظة" value={session.note || '-'} /></div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isStartModalOpen && <StartSessionModal branches={branches} onStart={onStartSession} onClose={() => setStartModalOpen(false)} />}
            {isCloseModalOpen && activeSession && <CloseSessionModal session={activeSession} sessionTotals={activeSessionTotals} onCloseSession={onCloseSession} onClose={() => setCloseModalOpen(false)} />}
        </div>
    );
};

const SummaryCard: React.FC<{ title: string, value: string, icon: React.FC<any> }> = ({ title, value, icon: Icon }) => (
    <div className="pos-sessions-summary-card">
        <Icon className="pos-sessions-summary-icon" />
        <div className="pos-sessions-summary-content">
            <h4 className="pos-sessions-summary-title">{title}</h4>
            <p className="pos-sessions-summary-value">{value}</p>
        </div>
    </div>
);


const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="pos-sessions-detail-item">
        <p className="pos-sessions-detail-label">{label}</p>
        <p className="pos-sessions-detail-value">{value}</p>
    </div>
);

const StartSessionModal: React.FC<{ branches: Branch[]; onStart: (balance: number, branchId: number) => void, onClose: () => void }> = ({ branches, onStart, onClose }) => {
    const [balance, setBalance] = useState('');
    const [branchId, setBranchId] = useState<string>('');

    const handleStart = () => {
        const numBalance = parseFloat(balance);
        const numBranchId = Number(branchId);
        if (!isNaN(numBalance) && numBalance >= 0 && Number.isFinite(numBranchId)) {
            onStart(numBalance, numBranchId);
            onClose();
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '32rem' }}>
                <div className="modal-header"><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>بدء جلسة جديدة</h2></div>
                <div className="modal-body">
                    <label className="form-label">الفرع</label>
                    <select className="form-select" value={branchId} onChange={e => setBranchId(e.target.value)}>
                        <option value="">اختر الفرع</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <label className="form-label">الرصيد النقدي الافتتاحي</label>
                    <input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="form-input" placeholder="0.000" autoFocus />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>أدخل المبلغ النقدي الموجود في الدرج في بداية اليوم.</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleStart} className="btn btn-secondary">بدء الجلسة</button>
                </div>
            </div>
        </div>
    )
}

const CloseSessionModal: React.FC<{ session: POSSession, sessionTotals: any, onCloseSession: (balance: number) => void, onClose: () => void }> = ({ session, sessionTotals, onCloseSession, onClose }) => {
    const [counted, setCounted] = useState('');
    const difference = useMemo(() => {
        const numCounted = parseFloat(counted);
        if (isNaN(numCounted)) return 0;
        return numCounted - sessionTotals.expectedCash;
    }, [counted, sessionTotals.expectedCash]);

    const handleClose = () => {
        const numCounted = parseFloat(counted);
        if (!isNaN(numCounted) && numCounted >= 0) {
            onCloseSession(numCounted);
            onClose();
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '36rem' }}>
                <div className="modal-header"><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>إغلاق الجلسة</h2></div>
                <div className="modal-body">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>ملخص الجلسة</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <SummaryRow label="رصيد الافتتاح" value={session.openingBalance} />
                        <SummaryRow label="مبيعات نقدية" value={sessionTotals.cashSales} />
                        <SummaryRow label="النقدية المتوقعة" value={sessionTotals.expectedCash} isTotal />
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '1rem 0' }} />
                    <div>
                        <label className="form-label">المبلغ النقدي المحسوب</label>
                        <input type="number" value={counted} onChange={e => setCounted(e.target.value)} className="form-input" placeholder="0.000" autoFocus />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <SummaryRow label="الفرق" value={difference} isTotal color={difference === 0 ? 'var(--secondary-color)' : '#ef4444'} />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleClose} className="btn btn-warning">تأكيد الإغلاق</button>
                </div>
            </div>
        </div>
    )
}

const SummaryRow = ({ label, value, isTotal, color }: { label: string, value: number, isTotal?: boolean, color?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontWeight: isTotal ? 'bold' : 'normal', fontSize: isTotal ? '1.1rem' : '1rem' }}>
        <span>{label}</span>
        <span style={{ color: color || 'var(--text-primary)' }}>{formatCurrency(value)}</span>
    </div>
)

export default POSSessions;
