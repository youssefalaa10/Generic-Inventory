import React, { useState } from 'react';
import { PurchaseSettings, PurchaseApprovalTier, Role } from '../types';
import { useToasts } from '../components/Toast';
import { PlusIcon, TrashIcon } from '../components/Icon';

interface SettingsPurchasesProps {
    settings: PurchaseSettings;
    onSave: (settings: PurchaseSettings) => void;
}

const approverRoles = [
    Role.BranchManager,
    Role.Accountant,
    Role.SuperAdmin
];

const SettingsPurchases: React.FC<SettingsPurchasesProps> = ({ settings, onSave }) => {
    const { addToast } = useToasts();
    const [localSettings, setLocalSettings] = useState<PurchaseSettings>(JSON.parse(JSON.stringify(settings)));

    const handleChange = (field: keyof PurchaseSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleTierChange = (id: number, field: keyof PurchaseApprovalTier, value: any) => {
        const newTiers = localSettings.approvalTiers.map(tier => 
            tier.id === id ? { ...tier, [field]: value } : tier
        );
        setLocalSettings(prev => ({ ...prev, approvalTiers: newTiers }));
    };

    const addTier = () => {
        const newTier: PurchaseApprovalTier = {
            id: Date.now(),
            minAmount: 0,
            approverRole: Role.BranchManager
        };
        const newTiers = [...localSettings.approvalTiers, newTier].sort((a,b) => a.minAmount - b.minAmount);
        setLocalSettings(prev => ({...prev, approvalTiers: newTiers}));
    };
    
    const removeTier = (id: number) => {
        const newTiers = localSettings.approvalTiers.filter(tier => tier.id !== id);
        setLocalSettings(prev => ({...prev, approvalTiers: newTiers}));
    };

    const handleSave = () => {
        onSave(localSettings);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إعدادات المشتريات</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>تكوين الإعدادات الافتراضية وسير عمل الموافقات لوحدة المشتريات.</p>
                </div>
                <button className="btn btn-secondary" onClick={handleSave}>
                    حفظ الإعدادات
                </button>
            </div>

            <div className="form-section">
                <div className="form-section-header">الشروط الافتراضية</div>
                <div className="form-section-body" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                    <div>
                        <label className="form-label">شروط الدفع الافتراضية (بالأيام)</label>
                        <input 
                            type="number"
                            className="form-input"
                            value={localSettings.defaultPaymentTermsDays}
                            onChange={(e) => handleChange('defaultPaymentTermsDays', Number(e.target.value))}
                        />
                        <p className="error-text" style={{color: 'var(--text-secondary)'}}>سيتم تطبيق هذا على أوامر الشراء الجديدة.</p>
                    </div>
                     <div>
                        <label className="form-label">تفضيل الشحن الافتراضي</label>
                        <select
                            className="form-select"
                            value={localSettings.defaultShippingPreference}
                            onChange={(e) => handleChange('defaultShippingPreference', e.target.value)}
                        >
                            <option value="Delivery">توصيل من المورد</option>
                            <option value="Collect">استلام من المورد</option>
                        </select>
                    </div>
                </div>
            </div>

             <div className="form-section">
                <div className="form-section-header">سير عمل الموافقات على طلبات الشراء</div>
                <div className="form-section-body">
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '40px', height: '22px' }}>
                            <input type="checkbox" checked={localSettings.isApprovalWorkflowEnabled} onChange={e => handleChange('isApprovalWorkflowEnabled', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{ position: 'absolute', inset: 0, background: localSettings.isApprovalWorkflowEnabled ? 'var(--secondary-color)' : 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '11px', transition: 'background 0.2s' }}></span>
                            <span style={{ position: 'absolute', top: '2px', right: localSettings.isApprovalWorkflowEnabled ? '2px' : '20px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'right 0.2s' }}></span>
                        </div>
                        <span style={{fontWeight: 600, fontSize: '1.1rem'}}>تفعيل سير عمل الموافقات</span>
                    </label>

                    {localSettings.isApprovalWorkflowEnabled && (
                        <div>
                            <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                                قم بتحديد مستويات الموافقات بناءً على قيمة طلب الشراء. سيتم توجيه الطلب إلى الدور الوظيفي المطلوب للموافقة.
                            </p>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {localSettings.approvalTiers.map(tier => (
                                    <div key={tier.id} style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <span>إذا كان المبلغ أكبر من أو يساوي</span>
                                        <input 
                                            type="number" 
                                            className="form-input" 
                                            value={tier.minAmount}
                                            onChange={(e) => handleTierChange(tier.id, 'minAmount', Number(e.target.value))}
                                            style={{width: '150px'}}
                                        />
                                        <span>د.ك، يتطلب موافقة من</span>
                                         <select
                                            className="form-select"
                                            value={tier.approverRole}
                                            onChange={(e) => handleTierChange(tier.id, 'approverRole', e.target.value)}
                                            style={{width: '200px'}}
                                        >
                                            {approverRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                        <button onClick={() => removeTier(tier.id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}}><TrashIcon style={{width:'20px', height:'20px'}}/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addTier} className="btn btn-ghost" style={{marginTop: '1.5rem'}}>
                                <PlusIcon style={{width: '20px', height: '20px'}}/>
                                إضافة مستوى موافقة
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPurchases;