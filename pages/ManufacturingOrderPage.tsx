import React, { useState, useMemo, useEffect } from 'react';
import { ManufacturingOrder, Branch, Product, InventoryItem, EmployeeData, FormulaLine, ProcessLoss, QCCheck, PackagingItem } from '../types';
import { BeakerIcon, ChevronDownIcon, ChevronUpIcon, DocumentTextIcon, UsersIcon, LocationMarkerIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, PrinterIcon, PlusIcon, TrashIcon, CurrencyDollarIcon, CubeIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';

// Helper: Import jspdf libraries
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { amiriFont } from '../services/amiriFont'; // Font for Arabic PDF support

interface ManufacturingOrderPageProps {
    order: ManufacturingOrder; // For now, we work on a single mock order
    branches: Branch[];
    products: Product[];
    inventory: InventoryItem[];
    employees: EmployeeData[];
    onSave: (order: ManufacturingOrder) => void;
}

type ValidationErrors = { [key: string]: string };

// --- UTILS & HELPERS ---

const perfumeMath = {
    calculateTheoreticalMl: (units: number, size: number) => (units || 0) * (size || 0),
    
    calculateQuantitiesFromFormula: (formula: FormulaLine[], totalVolume: number, products: Product[]) => {
        return formula.map(line => {
            const volumeMl = (line.percentage / 100) * totalVolume;
            const product = products.find(m => m.id === line.materialId);
            const density = line.density || product?.density || 1;
            const quantityG = volumeMl * density;
            return {
                ...line,
                requiredMl: volumeMl,
                requiredG: quantityG,
            };
        });
    },

    calculateExpectedYield: (theoreticalMl: number, loss: ProcessLoss) => {
        return theoreticalMl
             * (1 - (loss.mixingLossPct || 0) / 100)
             * (1 - (loss.filtrationLossPct || 0) / 100)
             * (1 - (loss.fillingLossPct || 0) / 100);
    },
    
    calculateYieldPercentage: (actualMl?: number, theoreticalMl?: number) => {
        if (!actualMl || !theoreticalMl || theoreticalMl === 0) return 0;
        return (actualMl / theoreticalMl) * 100;
    },
};

const validateOrder = (order: ManufacturingOrder): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!order.productName) errors.productName = "اسم المنتج مطلوب.";
    if (!order.unitsRequested || order.unitsRequested <= 0) errors.unitsRequested = "الكمية يجب أن تكون أكبر من 0.";
    if (!order.bottleSizeMl || order.bottleSizeMl <= 0) errors.bottleSizeMl = "الحجم يجب أن يكون أكبر من 0.";
    if (!order.manufacturingDate) errors.manufacturingDate = "تاريخ التصنيع مطلوب.";
    
    const formulaTotal = order.formula.reduce((sum, line) => sum + (line.percentage || 0), 0);
    if (Math.abs(formulaTotal - 100) > 0.01) errors.formula = `مجموع نسب الصيغة يجب أن يكون 100% (حالياً: ${formulaTotal.toFixed(2)}%).`;
    
    if(order.manufacturingType === 'CONTRACT') {
        const distTotal = (order.distribution || []).reduce((sum, d) => sum + d.units, 0);
        if (distTotal !== order.unitsRequested) errors.distribution = `إجمالي التوزيع (${distTotal}) لا يطابق الكمية المطلوبة (${order.unitsRequested}).`;
    }

    return errors;
};


// --- SUB-COMPONENTS ---

const SectionCard: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; error?: string; }> = ({ title, icon: Icon, children, error }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="glass-pane">
            <button onClick={() => setIsOpen(!isOpen)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: isOpen ? '1px solid var(--surface-border)' : 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
                     {error && <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 500, marginRight: '1rem' }}>({error})</span>}
                </div>
                {isOpen ? <ChevronUpIcon style={{width: '24px', height: '24px', color: 'var(--text-secondary)'}}/> : <ChevronDownIcon style={{width: '24px', height: '24px', color: 'var(--text-secondary)'}}/>}
            </button>
            {isOpen && <div style={{ padding: '1.5rem' }}>{children}</div>}
        </div>
    );
};

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {children}
    </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean; error?: string }> = ({ label, children, required, error }) => (
    <div>
        <label className={`form-label ${required ? 'required' : ''}`}>{label}</label>
        {children}
        {error && <p className="error-text">{error}</p>}
    </div>
);


const OrderStatusManager: React.FC<{
    order: ManufacturingOrder;
    onStatusChange: (newStatus: ManufacturingOrder['status']) => void;
    isValid: boolean;
}> = ({ order, onStatusChange, isValid }) => {
    const { addToast } = useToasts();
    const statusConfig: Record<ManufacturingOrder['status'], { label: string; color: string; next?: { status: ManufacturingOrder['status']; label: string } }> = {
        'DRAFT': { label: 'مسودة', color: '#8a94a2', next: { status: 'IN_PROGRESS', label: 'بدء الإنتاج' } },
        'IN_PROGRESS': { label: 'قيد التنفيذ', color: '#3b82f6', next: { status: 'MACERATING', label: 'بدء التعتيق (المكسرة)' } },
        'MACERATING': { label: 'في التعتيق', color: '#8b5cf6', next: { status: 'QC', label: 'إرسال للفحص' } },
        'QC': { label: 'تحت الفحص', color: '#f59e0b', next: { status: 'PACKAGING', label: 'الموافقة والبدء بالتغليف' } },
        'PACKAGING': { label: 'تغليف', color: '#10b981', next: { status: 'DONE', label: 'إنهاء الإنتاج' } },
        'DONE': { label: 'مكتمل', color: '#16a34a', next: { status: 'CLOSED', label: 'إغلاق الأمر' } },
        'CLOSED': { label: 'مغلق', color: '#5a6472' },
    };

    const currentStatusInfo = statusConfig[order.status];
    const nextAction = currentStatusInfo.next;
    
    const handleNextAction = () => {
        if (!isValid) {
            addToast('لا يمكن المتابعة، يرجى إصلاح الأخطاء في النموذج.', 'error');
            return;
        }
        if (nextAction) {
            onStatusChange(nextAction.status);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>الحالة الحالية:</span>
                <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    backgroundColor: currentStatusInfo.color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem'
                }}>
                    {currentStatusInfo.label}
                </span>
            </div>
            {nextAction && (
                <button
                    className="btn btn-secondary"
                    onClick={handleNextAction}
                >
                    {nextAction.label}
                </button>
            )}
        </div>
    );
};


const ManufacturingOrderPage: React.FC<ManufacturingOrderPageProps> = (props) => {
    const [order, setOrder] = useState<ManufacturingOrder>(props.order);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const { addToast } = useToasts();
    
    useEffect(() => {
        setErrors(validateOrder(order));
    }, [order]);
    
    const handleSave = () => {
        const currentErrors = validateOrder(order);
        setErrors(currentErrors);
        if (Object.keys(currentErrors).length > 0) {
            addToast('يرجى إصلاح الأخطاء قبل الحفظ.', 'error');
            return;
        }
        props.onSave(order);
        addToast('تم حفظ أمر التصنيع بنجاح!', 'success');
    };

    // Recalculate everything on order change
    useEffect(() => {
        const theoreticalMl = perfumeMath.calculateTheoreticalMl(order.unitsRequested, order.bottleSizeMl);
        const expectedMl = perfumeMath.calculateExpectedYield(theoreticalMl, order.processLoss);
        const expectedUnits = Math.floor(expectedMl / order.bottleSizeMl);
        const yieldPercentage = perfumeMath.calculateYieldPercentage(order.yield.actualMl, theoreticalMl);

        setOrder(prev => ({
            ...prev,
            yield: {
                ...prev.yield,
                theoreticalMl,
                expectedMl,
                expectedUnits,
                yieldPercentage,
            }
        }));
    }, [order.unitsRequested, order.bottleSizeMl, order.processLoss, order.yield.actualMl]);

    const handleStatusChange = (newStatus: ManufacturingOrder['status']) => {
        const updatedOrder = { ...order, status: newStatus };
        if (newStatus === 'IN_PROGRESS' && !order.manufacturingDate) {
            updatedOrder.manufacturingDate = new Date().toISOString();
        }
        setOrder(updatedOrder);
        props.onSave(updatedOrder); // Also save on status change
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <SectionCard title="إدارة الحالة" icon={UsersIcon}>
                <OrderStatusManager order={order} onStatusChange={handleStatusChange} isValid={Object.keys(errors).length === 0} />
            </SectionCard>

            <BasicInfoSection order={order} setOrder={setOrder} employees={props.employees} errors={errors} />

            {order.manufacturingType === 'CONTRACT' && (
                <SectionCard title="التوزيع" icon={LocationMarkerIcon} error={errors.distribution}>
                    <DistributionBuilder order={order} setOrder={setOrder} />
                </SectionCard>
            )}

            <SectionCard title="الصيغة" icon={BeakerIcon} error={errors.formula}>
                <FormulaBuilder order={order} setOrder={setOrder} products={props.products} />
            </SectionCard>

            <SectionCard title="حجز الخامات" icon={CubeIcon}>
                <MaterialReservation order={order} inventory={props.inventory}/>
            </SectionCard>

            <SectionCard title="المعالجة" icon={CalendarIcon}>
                <ProcessSteps order={order} setOrder={setOrder}/>
            </SectionCard>
            
            <SectionCard title="الفحص والجودة" icon={CheckCircleIcon}>
                 <QCChecksSection qc={order.qc} setQc={(newQc) => setOrder({...order, qc: newQc})} />
            </SectionCard>

            <SectionCard title="التعبئة والتغليف" icon={CubeIcon}>
                <PackagingPlanner order={order} setOrder={setOrder} products={props.products} inventory={props.inventory} />
            </SectionCard>

            <SectionCard title="التكلفة والتسعير" icon={CurrencyDollarIcon}>
                 <CostingSection costs={order.costs} setCosts={(newCosts) => setOrder({...order, costs: newCosts})} />
            </SectionCard>
            
            <SectionCard title="الناتج والترحيل" icon={CheckCircleIcon}>
                <YieldAndSummary order={order} setOrder={setOrder} onSave={handleSave} />
            </SectionCard>
        </div>
    );
};

// --- COMPONENT IMPLEMENTATIONS ---
const BasicInfoSection: React.FC<{order: ManufacturingOrder; setOrder: (o: ManufacturingOrder) => void; employees: EmployeeData[]; errors: ValidationErrors}> = ({ order, setOrder, employees, errors }) => {
    
    const handleChange = (field: keyof ManufacturingOrder, value: any) => {
        setOrder({ ...order, [field]: value });
    };

    return (
        <SectionCard title="المعلومات الأساسية" icon={DocumentTextIcon}>
            <FormRow>
                <FormField label="المنتج النهائي" required error={errors.productName}>
                    <input type="text" value={order.productName} onChange={e => handleChange('productName', e.target.value)} className={`form-input ${errors.productName ? 'input-error' : ''}`}/>
                </FormField>
                 <FormField label="رقم الأمر">
                    <input type="text" value={order.id} className="form-input" disabled />
                </FormField>
                <FormField label="كود الدفعة (Batch)">
                    <input type="text" value={order.batchCode} className="form-input" disabled />
                </FormField>
                <FormField label="نوع التصنيع">
                    <select value={order.manufacturingType} onChange={e => handleChange('manufacturingType', e.target.value)} className="form-select">
                        <option value="INTERNAL">لتلبية احتياج الشركة</option>
                        <option value="CONTRACT">تصنيع للغير</option>
                    </select>
                </FormField>
            </FormRow>
             <FormRow>
                <FormField label="التركيز">
                    <select value={order.concentration} onChange={e => handleChange('concentration', e.target.value)} className="form-select">
                        <option value="EDT_15">EDT 15%</option>
                        <option value="EDP_20">EDP 20%</option>
                        <option value="EXTRAIT_30">Extrait 30%</option>
                        <option value="OIL_100">Oil 100%</option>
                    </select>
                </FormField>
                 <FormField label="حجم الزجاجة (مل)" required error={errors.bottleSizeMl}>
                    <input type="number" value={order.bottleSizeMl} onChange={e => handleChange('bottleSizeMl', Number(e.target.value))} className={`form-input ${errors.bottleSizeMl ? 'input-error' : ''}`}/>
                </FormField>
                <FormField label="الكمية المطلوبة (زجاجة)" required error={errors.unitsRequested}>
                    <input type="number" value={order.unitsRequested} onChange={e => handleChange('unitsRequested', Number(e.target.value))} className={`form-input ${errors.unitsRequested ? 'input-error' : ''}`}/>
                </FormField>
                 <FormField label="حجم الدفعة (مل)">
                    <input type="text" value={order.yield.theoreticalMl.toFixed(2)} className="form-input" disabled />
                </FormField>
            </FormRow>
            <FormRow>
                <FormField label="المسؤول عن التصنيع">
                    <select value={order.responsibleEmployeeId || ''} onChange={e => handleChange('responsibleEmployeeId', Number(e.target.value))} className="form-select">
                        <option value="">اختر مسؤول...</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </FormField>
                <FormField label="تاريخ التصنيع" required error={errors.manufacturingDate}>
                    <input type="date" value={order.manufacturingDate?.split('T')[0] || ''} onChange={e => handleChange('manufacturingDate', e.target.value)} className={`form-input ${errors.manufacturingDate ? 'input-error' : ''}`}/>
                </FormField>
                <FormField label="تاريخ الانتهاء">
                    <input type="date" value={order.expiryDate?.split('T')[0] || ''} onChange={e => handleChange('expiryDate', e.target.value)} className="form-input"/>
                </FormField>
                 <FormField label="تاريخ التسليم">
                    <input type="date" value={order.dueAt?.split('T')[0] || ''} onChange={e => handleChange('dueAt', e.target.value)} className="form-input"/>
                </FormField>
            </FormRow>
        </SectionCard>
    )
};


const DistributionBuilder = ({ order, setOrder }: { order: ManufacturingOrder, setOrder: (order: ManufacturingOrder) => void }) => {
    const handleLineChange = (index: number, field: 'locationName' | 'units', value: any) => {
        const newDistribution = [...(order.distribution || [])];
        (newDistribution[index] as any)[field] = field === 'units' ? Number(value) : value;
        setOrder({ ...order, distribution: newDistribution });
    };

    const addLine = () => {
        const newLine = { id: Date.now().toString(), locationName: '', units: 0 };
        setOrder({ ...order, distribution: [...(order.distribution || []), newLine] });
    };

    const removeLine = (index: number) => {
        const newDistribution = (order.distribution || []).filter((_: any, i: number) => i !== index);
        setOrder({ ...order, distribution: newDistribution });
    };
    
    const totalDistributed = useMemo(() => (order.distribution || []).reduce((sum, line) => sum + (line.units || 0), 0), [order.distribution]);

    return (
        <>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                حدد أماكن وكميات التوزيع للعميل. يجب أن يتطابق المجموع مع الكمية المطلوبة.
            </p>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>اسم المكان/المحل</th>
                            <th style={{width: '150px'}}>الكمية (وحدة)</th>
                            <th style={{width: '50px'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(order.distribution || []).map((line, index) => (
                            <tr key={line.id}>
                                <td style={{padding: '0.5rem'}}>
                                    <input type="text" value={line.locationName} onChange={e => handleLineChange(index, 'locationName', e.target.value)} className="form-input"/>
                                </td>
                                <td style={{padding: '0.5rem'}}>
                                    <input type="number" value={line.units || ''} onChange={e => handleLineChange(index, 'units', e.target.value)} className="form-input"/>
                                </td>
                                <td>
                                    <button type="button" onClick={() => removeLine(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width: '20px', height: '20px'}}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <button type="button" onClick={addLine} className="btn btn-ghost"><PlusIcon style={{width:'20px', height:'20px'}}/> إضافة مكان</button>
                <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: totalDistributed !== order.unitsRequested ? '#ef4444' : 'var(--secondary-color)'}}>
                    الإجمالي الموزع: {totalDistributed} / {order.unitsRequested}
                </div>
            </div>
        </>
    );
};

const FormulaBuilder = ({ order, setOrder, products }: { order: ManufacturingOrder, setOrder: (order: ManufacturingOrder) => void, products: Product[] }) => {
    const rawMaterials = useMemo(() => products.filter(p => p.category !== 'تغليف' && p.category !== 'عطور مخصصة' && p.category !== 'عطور جاهزة'), [products]);
    const totalPercentage = useMemo(() => order.formula.reduce((sum: number, line: FormulaLine) => sum + (line.percentage || 0), 0), [order.formula]);

    const handleLineChange = (index: number, field: keyof FormulaLine, value: any) => {
        const newFormula = [...order.formula];
        const line = { ...newFormula[index] };
        
        if (field === 'materialId') {
            const materialId = Number(value);
            const material = rawMaterials.find(m => m.id === materialId);
            if (material) {
                line.materialId = material.id;
                line.materialName = material.name;
                line.density = material.density;
                if (material.category === 'زيوت عطرية') line.kind = 'AROMA_OIL';
                else if (material.category === 'مثبتات') line.kind = 'FIXATIVE';
                else if (material.name.includes('Ethanol')) line.kind = 'ETHANOL';
                else if (material.name.includes('DI Water')) line.kind = 'DI_WATER';
                else line.kind = 'ADDITIVE';
            }
        } else if (field === 'percentage' || field === 'density') {
            (line as any)[field] = value === '' ? undefined : parseFloat(value);
        } else {
            (line as any)[field] = value;
        }

        newFormula[index] = line;
        setOrder({ ...order, formula: newFormula });
    };

    const addLine = () => {
        // FIX: Added missing materialSku property to conform to FormulaLine type.
        const newLine: FormulaLine = { id: Date.now().toString(), materialId: 0, materialName: '', materialSku: '', kind: 'AROMA_OIL', percentage: 0 };
        setOrder({ ...order, formula: [...order.formula, newLine] });
    };

    const removeLine = (index: number) => {
        const newFormula = order.formula.filter((_: any, i: number) => i !== index);
        setOrder({ ...order, formula: newFormula });
    };

    return (
        <>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>النوع</th>
                            <th style={{width: '120px'}}>النسبة %</th>
                            <th style={{width: '120px'}}>الكثافة</th>
                            <th style={{width: '50px'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.formula.map((line: FormulaLine, index: number) => (
                            <tr key={line.id}>
                                <td style={{padding: '0.5rem'}}>
                                     <select value={line.materialId} onChange={e => handleLineChange(index, 'materialId', e.target.value)} className="form-select">
                                        <option value={0}>اختر مادة</option>
                                        {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </td>
                                 <td style={{padding: '0.5rem'}}>
                                     <select value={line.kind} onChange={e => handleLineChange(index, 'kind', e.target.value)} className="form-select">
                                        <option value="AROMA_OIL">زيت عطري</option>
                                        <option value="ETHANOL">كحول</option>
                                        <option value="DI_WATER">ماء مقطر</option>
                                        <option value="FIXATIVE">مثبت</option>
                                        <option value="COLOR">لون</option>
                                        <option value="ADDITIVE">إضافات</option>
                                     </select>
                                 </td>
                                <td style={{padding: '0.5rem'}}><input type="number" step="0.01" value={line.percentage || ''} onChange={e => handleLineChange(index, 'percentage', e.target.value)} className="form-input"/></td>
                                <td style={{padding: '0.5rem'}}><input type="number" step="0.01" value={line.density || ''} onChange={e => handleLineChange(index, 'density', e.target.value)} className="form-input"/></td>
                                <td><button type="button" onClick={() => removeLine(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width: '20px', height: '20px'}}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <button type="button" onClick={addLine} className="btn btn-ghost"><PlusIcon style={{width:'20px', height:'20px'}}/> إضافة مكون</button>
                <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: Math.abs(totalPercentage - 100) > 0.01 ? '#ef4444' : 'var(--secondary-color)'}}>
                    الإجمالي: {totalPercentage.toFixed(2)}%
                </div>
            </div>
        </>
    );
};

const MaterialReservation = ({ order, inventory }: { order: ManufacturingOrder, inventory: InventoryItem[]}) => {
    
    const scaledFormula = useMemo(() => {
        return perfumeMath.calculateQuantitiesFromFormula(order.formula, order.yield.theoreticalMl, []);
    }, [order.formula, order.yield.theoreticalMl]);

    const materialsWithStock = useMemo(() => {
        return scaledFormula.map(line => {
            const invItem = inventory.find(i => i.productId === line.materialId && i.branchId === order.branchId);
            const availableQuantity = invItem?.quantity || 0;
            const requiredQuantity = line.requiredG; // Assuming all raw materials are measured in grams
            
            return {
                ...line,
                available: availableQuantity,
                required: requiredQuantity,
                unit: 'g',
                isSufficient: availableQuantity >= requiredQuantity,
            };
        });
    }, [scaledFormula, inventory, order.branchId]);

    return (
        <>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>الكمية المطلوبة</th>
                            <th>المخزون المتاح</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materialsWithStock.map(mat => (
                            <tr key={mat.id} style={{ backgroundColor: !mat.isSufficient ? 'var(--highlight-low-stock)' : 'transparent' }}>
                                <td>{mat.materialName}</td>
                                <td>{mat.required.toFixed(2)} {mat.unit}</td>
                                <td style={{fontWeight: 'bold'}}>{mat.available.toFixed(2)} {mat.unit}</td>
                                <td>
                                    {mat.isSufficient 
                                        ? <CheckCircleIcon style={{color: 'var(--secondary-color)', width: 24, height: 24}}/> 
                                        : <XCircleIcon style={{color: '#ef4444', width: 24, height: 24}} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!materialsWithStock.every(m => m.isSufficient) && 
                <p style={{marginTop: '1rem', color: '#f59e0b', fontWeight: 600}}>
                    تنبيه: يوجد نقص في بعض المواد الخام. لا يمكن بدء الإنتاج.
                </p>
            }
        </>
    );
};

const ProcessSteps = ({ order, setOrder }: { order: ManufacturingOrder, setOrder: (order: ManufacturingOrder) => void }) => {
    const handleLossChange = (field: keyof ProcessLoss, value: number) => setOrder({ ...order, processLoss: { ...order.processLoss, [field]: value } });
    const handleChillingChange = (field: 'hours' | 'temperatureC', value: number) => setOrder({ ...order, chilling: { ...(order.chilling as any), [field]: value } });
    const handleFiltrationChange = (field: 'stages' | 'micron', value: number) => setOrder({ ...order, filtration: { ...(order.filtration as any), [field]: value } });

    return (
        <FormRow>
            <FormField label="أيام المكسرة"><input type="number" value={order.macerationDays} onChange={e => setOrder({...order, macerationDays: Number(e.target.value)})} className="form-input" /></FormField>
            <FormField label="ساعات التبريد"><input type="number" value={order.chilling?.hours || ''} onChange={e => handleChillingChange('hours', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="حرارة التبريد (°C)"><input type="number" value={order.chilling?.temperatureC || ''} onChange={e => handleChillingChange('temperatureC', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="مراحل الفلترة"><input type="number" value={order.filtration?.stages || ''} onChange={e => handleFiltrationChange('stages', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="حجم الفلتر (Micron)"><input type="number" step="0.1" value={order.filtration?.micron || ''} onChange={e => handleFiltrationChange('micron', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="فاقد الخلط (%)"><input type="number" step="0.1" value={order.processLoss.mixingLossPct} onChange={e => handleLossChange('mixingLossPct', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="فاقد الفلترة (%)"><input type="number" step="0.1" value={order.processLoss.filtrationLossPct} onChange={e => handleLossChange('filtrationLossPct', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="فاقد التعبئة (%)"><input type="number" step="0.1" value={order.processLoss.fillingLossPct} onChange={e => handleLossChange('fillingLossPct', Number(e.target.value))} className="form-input" /></FormField>
        </FormRow>
    );
};

const QCChecksSection: React.FC<{ qc: QCCheck | undefined; setQc: (qc: QCCheck) => void }> = ({ qc, setQc }) => {
    const handleChange = (field: keyof QCCheck, value: any) => {
        setQc({ ...(qc as QCCheck), [field]: value });
    };

    return (
        <FormRow>
            <FormField label="المظهر"><input type="text" value={qc?.appearance || ''} onChange={e => handleChange('appearance', e.target.value)} className="form-input" /></FormField>
            <FormField label="الشفافية">
                <select value={qc?.clarity || 'Clear'} onChange={e => handleChange('clarity', e.target.value)} className="form-select">
                    <option value="Clear">Clear</option><option value="Slight Haze">Slight Haze</option><option value="Hazy">Hazy</option>
                </select>
            </FormField>
            <FormField label="مطابقة الرائحة">
                <select value={qc?.odorMatch || 'Pass'} onChange={e => handleChange('odorMatch', e.target.value)} className="form-select">
                    <option value="Pass">Pass</option><option value="Borderline">Borderline</option><option value="Fail">Fail</option>
                </select>
            </FormField>
            <FormField label="النتيجة النهائية">
                <select value={qc?.result || 'APPROVED'} onChange={e => handleChange('result', e.target.value)} className="form-select">
                    <option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option><option value="REWORK">REWORK</option>
                </select>
            </FormField>
        </FormRow>
    );
};

const PackagingPlanner = ({ order, setOrder, products, inventory }: { order: ManufacturingOrder, setOrder: (o: ManufacturingOrder) => void, products: Product[], inventory: InventoryItem[] }) => {
    const packagingProducts = useMemo(() => products.filter(p => p.category === 'تغليف'), [products]);
    const requiredPackaging = useMemo(() => {
        return order.packagingItems.map(item => ({
            ...item,
            required: item.qtyPerUnit * order.unitsRequested,
            available: inventory.find(inv => inv.productId === item.productId && inv.branchId === order.branchId)?.quantity || 0,
        }));
    }, [order.packagingItems, order.unitsRequested, order.branchId, inventory]);

    const handleLineChange = (index: number, field: keyof PackagingItem, value: any) => {
        const newItems = [...order.packagingItems];
        if (field === 'productId') {
            const material = packagingProducts.find(p => p.id === Number(value));
            newItems[index] = { ...newItems[index], productId: Number(value), name: material?.name || '' };
        } else if (field === 'qtyPerUnit') {
            newItems[index].qtyPerUnit = Number(value);
        }
        setOrder({ ...order, packagingItems: newItems });
    };

    const addLine = () => setOrder({ ...order, packagingItems: [...order.packagingItems, { productId: 0, name: '', qtyPerUnit: 1 }] });
    const removeLine = (index: number) => setOrder({ ...order, packagingItems: order.packagingItems.filter((_, i) => i !== index) });

    return (
        <div className="table-wrapper">
            <table>
                <thead><tr><th>مادة التغليف</th><th style={{width: '120px'}}>الكمية/وحدة</th><th style={{width: '120px'}}>المطلوب</th><th>المتاح</th><th></th></tr></thead>
                <tbody>
                    {requiredPackaging.map((item, index) => {
                        const hasEnough = item.available >= item.required;
                        return (
                            <tr key={index} style={{backgroundColor: !hasEnough ? 'var(--highlight-low-stock)' : 'transparent'}}>
                                <td style={{padding: '0.5rem'}}><select value={item.productId} onChange={e => handleLineChange(index, 'productId', e.target.value)} className="form-select"><option>اختر...</option>{packagingProducts.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></td>
                                <td style={{padding: '0.5rem'}}><input type="number" value={item.qtyPerUnit} onChange={e=>handleLineChange(index, 'qtyPerUnit', e.target.value)} className="form-input"/></td>
                                <td>{item.required}</td>
                                <td>{item.available}</td>
                                <td><button type="button" onClick={() => removeLine(index)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width: '20px', height: '20px'}}/></button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
             <div style={{marginTop: '1rem', textAlign: 'left'}}>
                <button type="button" onClick={addLine} className="btn btn-ghost"><PlusIcon style={{width:'20px', height:'20px'}}/> إضافة مادة تغليف</button>
            </div>
        </div>
    );
};

const CostingSection: React.FC<{ costs: ManufacturingOrder['costs']; setCosts: (costs: ManufacturingOrder['costs']) => void; }> = ({ costs, setCosts }) => {
    const handleChange = (field: keyof ManufacturingOrder['costs'], value: number) => {
        setCosts({ ...costs, [field]: value });
    };

    return (
        <FormRow>
            <FormField label="تكلفة العمالة"><input type="number" value={costs.labor || ''} onChange={e => handleChange('labor', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="تكاليف غير مباشرة"><input type="number" value={costs.overhead || ''} onChange={e => handleChange('overhead', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="تكاليف أخرى"><input type="number" value={costs.other || ''} onChange={e => handleChange('other', Number(e.target.value))} className="form-input" /></FormField>
            <FormField label="إجمالي التكلفة"><input type="text" value={costs.total.toFixed(3) + ' د.ك'} className="form-input" disabled /></FormField>
        </FormRow>
    );
};

const YieldAndSummary = ({ order, setOrder, onSave }: { order: ManufacturingOrder, setOrder: (order: ManufacturingOrder) => void, onSave: () => void }) => {
    const handleYieldChange = (field: 'actualMl' | 'actualUnits', value: number) => setOrder({ ...order, yield: { ...order.yield, [field]: value } });

    return (
        <div>
            <FormRow>
                <FormField label="الناتج النظري (مل)"><input type="text" value={order.yield.theoreticalMl.toFixed(2)} className="form-input" disabled /></FormField>
                <FormField label="الناتج المتوقع (مل)"><input type="text" value={order.yield.expectedMl.toFixed(2)} className="form-input" disabled /></FormField>
                <FormField label="الناتج الفعلي (مل)"><input type="number" value={order.yield.actualMl || ''} onChange={e => handleYieldChange('actualMl', Number(e.target.value))} className="form-input" /></FormField>
            </FormRow>
            <FormRow>
                 <FormField label="الوحدات المتوقعة (زجاجة)"><input type="text" value={order.yield.expectedUnits} className="form-input" disabled /></FormField>
                <FormField label="الوحدات الفعلية (زجاجة)"><input type="number" value={order.yield.actualUnits || ''} onChange={e => handleYieldChange('actualUnits', Number(e.target.value))} className="form-input" /></FormField>
                 <FormField label="نسبة الإنتاجية (%)"><input type="text" value={order.yield.yieldPercentage?.toFixed(2) + '%' || '0%'} className="form-input" disabled style={{fontWeight: 'bold', color: 'var(--primary-color)'}}/></FormField>
            </FormRow>
            <div style={{marginTop: '1.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', textAlign: 'right'}}>
                <button onClick={onSave} className="btn btn-secondary">
                    حفظ أمر التصنيع
                </button>
            </div>
        </div>
    );
};

export default ManufacturingOrderPage;
