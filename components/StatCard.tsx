import React from 'react';
import { Icon } from './Icon';

interface StatCardProps {
    title: string;
    value: string;
    icon: Icon;
    iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconBg }) => {
    return (
        <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: iconBg
            }}>
                <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div style={{ marginRight: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</h3>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
            </div>
        </div>
    );
};

export default StatCard;