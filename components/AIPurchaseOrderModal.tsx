import React, { useState } from 'react';
import { Branch, SuggestedPurchaseOrderItem } from '../types';
import { SparklesIcon, TrashIcon } from './Icon';

interface AIPurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    branches: Branch[];
    onGenerate: (branchId: number, forecastDays: number, historyDays: number) => Promise<SuggestedPurchaseOrderItem[]>;
    onCreatePO: (items: { productId: number; quantity: number; unitPrice: number; }[]) => void;
}

type Step = 'config' | 'loading' | 'review';

const AIPurchaseOrderModal: React.FC<AIPurchaseOrderModalProps> = ({ isOpen, onClose, branches, onGenerate, onCreatePO }) => {
    const [step, setStep] = useState<Step>('config');
    const [branchId, setBranchId] = useState<string>(branches.find(b => b.name.includes("Manufacturing"))?.id.toString() || branches[0]?.id.toString() || '');
    const [forecastDays, setForecastDays] = useState<number>(30);
    const [historyDays, setHistoryDays] = useState<number>(90);
    const [suggestions, setSuggestions] = useState<SuggestedPurchaseOrderItem[]>([]);
    const { addToast } = useToasts();

    const handleGenerateClick = async () => {
        if (!branchId) {
            addToast('Please select a branch.', 'error');
            return;
        }
        setStep('loading');
        try {
            const result = await onGenerate(Number(branchId), forecastDays, historyDays);
            setSuggestions(result);
            setStep('review');
        } catch (error) {
            console.error(error);
            addToast('Failed to generate suggestions.', 'error');
            setStep('config');
        }
    };

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        setSuggestions(prev => prev.map(item => 
            item.productId === productId ? { ...item, recommendedQuantity: newQuantity } : item
        ));
    };

    const handleRemoveItem = (productId: number) => {
        setSuggestions(prev => prev.filter(item => item.productId !== productId));
    };
    
    const handleCreatePOClick = () => {
        const poItems = suggestions
            .filter(s => s.recommendedQuantity > 0)
            .map(s => ({
                productId: s.productId,
                quantity: s.recommendedQuantity,
                unitPrice: 0, // Will be filled in by user in the next step
            }));
        onCreatePO(poItems);
    };

    const resetAndClose = () => {
        setStep('config');
        setSuggestions([]);
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (step) {
            case 'config':
                return (
                    <>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>سيقوم الذكاء الاصطناعي بتحليل بيانات المبيعات والمخزون لاقتراح الأصناف والكميات التي تحتاج إلى شرائها.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <FormField label="الفرع المستهدف">
                                <select value={branchId} onChange={e => setBranchId(e.target.value)} className="form-select">
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </FormField>
                            <FormField label="تغطية المخزون لمدة (يوم)">
                                <input type="number" value={forecastDays} onChange={e => setForecastDays(Number(e.target.value))} className="form-input" />
                            </FormField>
                            <FormField label="تحليل المبيعات لآخر (يوم)">
                                <input type="number" value={historyDays} onChange={e => setHistoryDays(Number(e.target.value))} className="form-input" />
                            </FormField>
                        </div>
                    </>
                );
            case 'loading':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px', color: 'var(--text-secondary)' }}>
                        <div className="thinking-indicator"><span></span><span></span><span></span></div>
                        <p style={{ marginTop: '1rem' }}>جاري تحليل البيانات وإنشاء الاقتراحات...</p>
                    </div>
                );
            case 'review':
                return (
                    <>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>راجع الاقتراحات التالية. يمكنك تعديل الكميات أو حذف أي صنف قبل إنشاء أمر الشراء.</p>
                        <div className="table-wrapper" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>المخزون الحالي</th>
                                        <th>الكمية المقترحة</th>
                                        <th>السبب</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suggestions.map(item => (
                                        <tr key={item.productId}>
                                            <td><strong>{item.productName}</strong><br/><small>{item.sku}</small></td>
                                            <td>{item.currentStock}</td>
                                            <td style={{width: '120px'}}>
                                                <input
                                                    type="number"
                                                    value={item.recommendedQuantity}
                                                    onChange={e => handleQuantityChange(item.productId, Number(e.target.value))}
                                                    className="form-input"
                                                    style={{textAlign: 'center'}}
                                                />
                                            </td>
                                            <td style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{item.reasoning}</td>
                                            <td>
                                                <button onClick={() => handleRemoveItem(item.productId)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width: '20px', height: '20px'}}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {suggestions.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>لا توجد اقتراحات. يبدو أن المخزون جيد!</p>}
                    </>
                );
        }
    };
    
    const renderFooter = () => {
         switch (step) {
            case 'config':
                return (
                    <>
                        <button onClick={resetAndClose} className="btn btn-ghost">إلغاء</button>
                        <button onClick={handleGenerateClick} className="btn btn-secondary">إنشاء الاقتراحات</button>
                    </>
                );
             case 'loading': return null;
            case 'review':
                 return (
                    <>
                        <button onClick={() => setStep('config')} className="btn btn-ghost">العودة</button>
                        <button onClick={handleCreatePOClick} className="btn btn-primary" disabled={suggestions.length === 0}>إنشاء أمر شراء</button>
                    </>
                );
        }
    }

    return (
        <div className="modal-backdrop" onClick={resetAndClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '60rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SparklesIcon /> اقتراح أمر شراء ذكي
                    </h2>
                </div>
                <div className="modal-body">{renderContent()}</div>
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>{renderFooter()}</div>
            </div>
        </div>
    );
};

const FormField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

// We need to import useToasts to use it
import { useToasts } from './Toast';

export default AIPurchaseOrderModal;
