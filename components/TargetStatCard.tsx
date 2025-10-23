import React from 'react';
import { Icon } from './Icon';

interface TargetStatCardProps {
    title: string;
    currentValue: number;
    targetValue: number;
    icon: Icon;
    iconBg: string;
}

const TargetStatCard: React.FC<TargetStatCardProps> = ({ title, currentValue, targetValue, icon: Icon, iconBg }) => {
    const progress = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
    const formatCurrency = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div style={{
                    minWidth: '64px', height: '64px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: iconBg
                }}>
                    <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <div style={{ marginRight: '1rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</h3>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(currentValue)} د.ك / <span style={{fontSize: '1.25rem', color: 'var(--text-secondary)'}}>{formatCurrency(targetValue)} د.ك</span>
                    </p>
                </div>
            </div>
            <div>
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                    <span>التقدم</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--secondary-color)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
            </div>
        </div>
    );
};

export default TargetStatCard;