import React, { useState } from 'react';
import { IntegrationSettings, EcommerceIntegrationSettings, PaymentGatewaySettings, WhatsAppSettings, N8nSettings, Webhook } from '../types';
import { useToasts } from '../components/Toast';

// Main Integration Page Component
interface IntegrationsPageProps {
    settings: IntegrationSettings;
    onSave: (settings: IntegrationSettings) => void;
}

const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<IntegrationSettings>(JSON.parse(JSON.stringify(settings)));

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleEcommerceChange = (platform: 'openCart' | 'wooCommerce', newSettings: EcommerceIntegrationSettings) => {
        setLocalSettings(prev => ({ ...prev, [platform]: newSettings }));
    };
    
    const handlePaymentChange = (newSettings: PaymentGatewaySettings) => {
        setLocalSettings(prev => ({ ...prev, myFatoorah: newSettings }));
    };

    const handleWhatsAppChange = (newSettings: WhatsAppSettings) => {
        setLocalSettings(prev => ({ ...prev, whatsapp: newSettings }));
    };

    const handleN8nChange = (newSettings: N8nSettings) => {
        setLocalSettings(prev => ({ ...prev, n8n: newSettings }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة التكاملات</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>ربط النظام بالخدمات الخارجية لأتمتة العمليات.</p>
                </div>
                <button className="btn btn-secondary" onClick={handleSave}>
                    حفظ كل الإعدادات
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <EcommerceCard title="OpenCart (GenericPerfumes.com)" settings={localSettings.openCart} onChange={(s) => handleEcommerceChange('openCart', s)} />
                <EcommerceCard title="WooCommerce (Arabiva)" settings={localSettings.wooCommerce} onChange={(s) => handleEcommerceChange('wooCommerce', s)} />
                <PaymentGatewayCard title="MyFatoorah" settings={localSettings.myFatoorah} onChange={handlePaymentChange} />
                <WhatsAppCard title="WhatsApp Business API" settings={localSettings.whatsapp} onChange={handleWhatsAppChange} />
            </div>

            <N8nCard title="الأتمتة (n8n Webhooks)" settings={localSettings.n8n} onChange={handleN8nChange} />
        </div>
    );
};


// --- Sub-components for each integration card ---

const IntegrationCard: React.FC<{ title: string; children: React.ReactNode; isEnabled: boolean; onToggle: (enabled: boolean) => void; }> = ({ title, children, isEnabled, onToggle }) => {
    return (
        <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h4>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <span style={{color: 'var(--text-secondary)'}}>{isEnabled ? 'مفعل' : 'معطل'}</span>
                    <div style={{ position: 'relative', width: '40px', height: '22px' }}>
                        <input type="checkbox" checked={isEnabled} onChange={e => onToggle(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', inset: 0, background: isEnabled ? 'var(--secondary-color)' : 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '11px', transition: 'background 0.2s' }}></span>
                        <span style={{ position: 'absolute', top: '2px', right: isEnabled ? '2px' : '20px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'right 0.2s' }}></span>
                    </div>
                </label>
            </div>
            {isEnabled && children}
        </div>
    );
};

const EcommerceCard: React.FC<{ title: string; settings: EcommerceIntegrationSettings; onChange: (s: EcommerceIntegrationSettings) => void; }> = ({ title, settings, onChange }) => {
    const { addToast } = useToasts();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleChange = (field: keyof EcommerceIntegrationSettings, value: any) => {
        onChange({ ...settings, [field]: value });
    };
    
    const handleSyncNow = () => {
        if (!settings.apiUrl || !settings.apiKey || !settings.apiSecret) {
            addToast('يرجى إدخال جميع معلومات API للمزامنة.', 'error');
            return;
        }

        setIsSyncing(true);
        addToast(`بدء المزامنة مع ${title}...`, 'info');

        console.log(`Starting sync with ${title}`, {
            apiUrl: settings.apiUrl,
            syncCustomers: settings.autoSyncCustomers,
            syncSales: settings.autoSyncSales,
        });

        // Simulate API call
        setTimeout(() => {
            setIsSyncing(false);
            addToast(`اكتملت المزامنة مع ${title} بنجاح!`, 'success');
            console.log(`Sync with ${title} complete.`);
        }, 2500);
    };


    return (
        <IntegrationCard title={title} isEnabled={settings.isEnabled} onToggle={(val) => handleChange('isEnabled', val)}>
            <FormField label="API URL"><input type="text" className="form-input" value={settings.apiUrl} onChange={e => handleChange('apiUrl', e.target.value)} /></FormField>
            <FormField label="API Key"><input type="password" placeholder="**************" className="form-input" value={settings.apiKey} onChange={e => handleChange('apiKey', e.target.value)} /></FormField>
            <FormField label="API Secret"><input type="password" placeholder="**************" className="form-input" value={settings.apiSecret} onChange={e => handleChange('apiSecret', e.target.value)} /></FormField>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '1rem' }}>
                <ToggleSwitch label="مزامنة العملاء تلقائياً" checked={settings.autoSyncCustomers} onChange={(val) => handleChange('autoSyncCustomers', val)} />
                <ToggleSwitch label="مزامنة المبيعات تلقائياً" checked={settings.autoSyncSales} onChange={(val) => handleChange('autoSyncSales', val)} />
            </div>

            {(settings.autoSyncCustomers || settings.autoSyncSales) &&
                <FormField label="فترة المزامنة التلقائية (بالدقائق)">
                    <input type="number" className="form-input" value={settings.syncInterval} onChange={e => handleChange('syncInterval', parseInt(e.target.value, 10) || 60)} />
                </FormField>
            }

            <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={handleSyncNow} disabled={isSyncing}>
                 {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
            </button>
        </IntegrationCard>
    );
};

const PaymentGatewayCard: React.FC<{ title: string; settings: PaymentGatewaySettings; onChange: (s: PaymentGatewaySettings) => void; }> = ({ title, settings, onChange }) => {
    return (
        <IntegrationCard title={title} isEnabled={settings.isEnabled} onToggle={(val) => onChange({ ...settings, isEnabled: val })}>
            <FormField label="API Token (v2)"><input type="password" placeholder="**************" className="form-input" value={settings.apiKey} onChange={e => onChange({ ...settings, apiKey: e.target.value })} /></FormField>
        </IntegrationCard>
    );
};

const WhatsAppCard: React.FC<{ title: string; settings: WhatsAppSettings; onChange: (s: WhatsAppSettings) => void; }> = ({ title, settings, onChange }) => {
    return (
        <IntegrationCard title={title} isEnabled={settings.isEnabled} onToggle={(val) => onChange({ ...settings, isEnabled: val })}>
            <FormField label="Permanent Access Token"><input type="password" placeholder="**************" className="form-input" value={settings.apiKey} onChange={e => onChange({ ...settings, apiKey: e.target.value })} /></FormField>
            <FormField label="Phone Number ID"><input type="text" className="form-input" value={settings.phoneNumberId} onChange={e => onChange({ ...settings, phoneNumberId: e.target.value })} /></FormField>
        </IntegrationCard>
    );
};

const N8nCard: React.FC<{ title: string; settings: N8nSettings; onChange: (s: N8nSettings) => void; }> = ({ title, settings, onChange }) => {
    const { addToast } = useToasts();
    
    const handleWebhookToggle = (index: number, isEnabled: boolean) => {
        const newWebhooks = [...settings.webhooks];
        newWebhooks[index].isEnabled = isEnabled;
        onChange({ ...settings, webhooks: newWebhooks });
    };
    
    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            addToast('تم نسخ رابط Webhook!', 'success');
        }, () => {
            addToast('فشل نسخ الرابط.', 'error');
        });
    };

    return (
        <div className="glass-pane" style={{ gridColumn: '1 / -1' }}>
             <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h4>
                <p style={{color: 'var(--text-secondary)'}}>استخدم هذه الروابط لتشغيل الأتمتة عند وقوع أحداث معينة.</p>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>الحدث (Event)</th>
                            <th>Webhook URL</th>
                            <th style={{textAlign: 'center'}}>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settings.webhooks.map((webhook, index) => (
                            <tr key={webhook.event}>
                                <td style={{fontWeight: 500}}>{webhook.event}</td>
                                <td>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <input type="text" readOnly value={webhook.url} className="form-input" style={{fontFamily: 'monospace', direction: 'ltr', textAlign: 'left'}} />
                                        <button onClick={() => copyToClipboard(webhook.url)} className="btn btn-ghost" style={{padding: '0.5rem'}}>نسخ</button>
                                    </div>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <div style={{ position: 'relative', width: '40px', height: '22px' }}>
                                            <input type="checkbox" checked={webhook.isEnabled} onChange={e => handleWebhookToggle(index, e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span style={{ position: 'absolute', inset: 0, background: webhook.isEnabled ? 'var(--secondary-color)' : 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '11px', transition: 'background 0.2s' }}></span>
                                            <span style={{ position: 'absolute', top: '2px', right: webhook.isEnabled ? '2px' : '20px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'right 0.2s' }}></span>
                                        </div>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const FormField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div style={{ marginBottom: '0.5rem' }}>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const ToggleSwitch: React.FC<{label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({label, checked, onChange}) => (
    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span>{label}</span>
    </label>
)

export default IntegrationsPage;