import React from 'react';

const SettingsSuppliers: React.FC = () => {
    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إعدادات الموردين</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                هذه الصفحة مخصصة لتكوين فئات الموردين، شروط الدفع الافتراضية، وغيرها من الإعدادات المتعلقة بالموردين. (سيتم تنفيذها لاحقاً)
            </p>
        </div>
    );
};

export default SettingsSuppliers;