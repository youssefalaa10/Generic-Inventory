import React from 'react';

const SettingsSales: React.FC = () => {
    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إعدادات المبيعات</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                هذه الصفحة مخصصة لتكوين الإعدادات الافتراضية لفواتير المبيعات، عروض الأسعار، ونماذج الطباعة. (سيتم تنفيذها لاحقاً)
            </p>
        </div>
    );
};

export default SettingsSales;
