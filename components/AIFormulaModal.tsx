import React, { useState } from 'react';
import { FormulaLine, Product, NewProductIdeaResponse, InventoryItem } from '../types';
import { getFormulaSuggestion, getNewProductIdea } from '../services/geminiService';
import { SparklesIcon } from './Icon';
import { useToasts } from './Toast';

interface AIFormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFormula: (formula: FormulaLine[], productName?: string) => void;
    rawMaterials: Product[];
    inventory: InventoryItem[];
    branchId: number;
}

type AITab = 'formula' | 'idea';

const AIFormulaModal: React.FC<AIFormulaModalProps> = ({ isOpen, onClose, onApplyFormula, rawMaterials, inventory, branchId }) => {
    const { addToast } = useToasts();
    const [activeTab, setActiveTab] = useState<AITab>('formula');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<FormulaLine[] | NewProductIdeaResponse | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            addToast('Please enter a description or theme.', 'error');
            return;
        }

        setIsLoading(true);
        setResult(null);

        const branchInventory = inventory.filter(i => i.branchId === branchId);

        const materialContext = rawMaterials.map(m => {
            const stockItem = branchInventory.find(i => i.productId === m.id);
            return {
                id: m.id,
                name: m.name,
                sku: m.sku,
                baseUnit: m.baseUnit,
                availableQuantity: stockItem?.quantity || 0,
            };
        });

        try {
            if (activeTab === 'formula') {
                const formula = await getFormulaSuggestion({ prompt, rawMaterials: materialContext });
                setResult(formula);
            } else {
                const idea = await getNewProductIdea({ prompt, rawMaterials: materialContext });
                setResult(idea);
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to get AI suggestion. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (!result) return;
        if (activeTab === 'formula') {
            onApplyFormula(result as FormulaLine[]);
        } else {
            const idea = result as NewProductIdeaResponse;
            onApplyFormula(idea.formula, idea.productName);
        }
    };

    const reset = () => {
        setPrompt('');
        setResult(null);
    }
    
    const switchTab = (tab: AITab) => {
        if (isLoading) return;
        setActiveTab(tab);
        reset();
    }

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '50rem' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SparklesIcon /> مساعد التركيبات الذكي
                    </h2>
                </div>
                <div className="tab-buttons-container" style={{ padding: '0 1.5rem' }}>
                    <button className={`tab-button ${activeTab === 'formula' ? 'active' : ''}`} onClick={() => switchTab('formula')}>اقتراح صيغة</button>
                    <button className={`tab-button ${activeTab === 'idea' ? 'active' : ''}`} onClick={() => switchTab('idea')}>اقتراح فكرة منتج جديد</button>
                </div>
                <div className="modal-body">
                    {activeTab === 'formula' ? (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            صف العطر الذي تتخيله (مثال: "عطر صيفي منعش بالحمضيات والنعناع للرجال") وسيقوم الذكاء الاصطناعي بإنشاء صيغة لك.
                        </p>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            أعطِ الذكاء الاصطناعي فكرة عامة (مثال: "عطر شرقي فاخر للمناسبات") وسيقوم باقتراح اسم ونوتات وصيغة كاملة.
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="form-input"
                            rows={3}
                            placeholder={activeTab === 'formula' ? "صف العطر هنا..." : "اكتب الفكرة العامة هنا..."}
                            disabled={isLoading}
                        />
                        <button onClick={handleGenerate} className="btn btn-secondary" disabled={isLoading}>
                            {isLoading ? '...' : 'إنشاء'}
                        </button>
                    </div>

                    {isLoading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '150px', color: 'var(--text-secondary)' }}>
                            <div className="thinking-indicator"><span></span><span></span><span></span></div>
                            <p style={{ marginTop: '1rem' }}>جاري التفكير...</p>
                        </div>
                    )}

                    {result && (
                        <div>
                            {activeTab === 'formula' && <FormulaDisplay formula={result as FormulaLine[]} />}
                            {activeTab === 'idea' && <ProductIdeaDisplay idea={result as NewProductIdeaResponse} />}
                        </div>
                    )}
                </div>
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <button onClick={onClose} className="btn btn-ghost">إغلاق</button>
                    <button onClick={handleApply} className="btn btn-primary" disabled={!result}>
                        تطبيق الصيغة
                    </button>
                </div>
            </div>
        </div>
    );
};

const FormulaDisplay: React.FC<{ formula: FormulaLine[] }> = ({ formula }) => {
    const total = formula.reduce((sum, item) => sum + item.percentage, 0);
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr><th>المادة</th><th>النوع</th><th>النسبة %</th></tr>
                </thead>
                <tbody>
                    {formula.map(item => (
                        <tr key={item.materialId}>
                            <td>{item.materialName}</td>
                            <td>{item.kind}</td>
                            <td style={{ fontWeight: 'bold' }}>{item.percentage.toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>الإجمالي</td>
                        <td style={{ fontWeight: 'bold' }}>{total.toFixed(2)}%</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const ProductIdeaDisplay: React.FC<{ idea: NewProductIdeaResponse }> = ({ idea }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-pane" style={{ padding: '1rem 1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{idea.productName}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <NoteCard title="Top Notes" notes={idea.fragranceNotes.top} />
                <NoteCard title="Middle Notes" notes={idea.fragranceNotes.middle} />
                <NoteCard title="Base Notes" notes={idea.fragranceNotes.base} />
            </div>
            <FormulaDisplay formula={idea.formula} />
        </div>
    );
};

const NoteCard: React.FC<{title: string, notes: string}> = ({title, notes}) => (
    <div style={{background: 'var(--surface-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)'}}>
        <h4 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500}}>{title}</h4>
        <p style={{fontWeight: 600, marginTop: '0.25rem'}}>{notes}</p>
    </div>
)


export default AIFormulaModal;