import React from 'react';
import { User } from '../types';
import { PERMISSION_GROUPS } from '../constants';
import { CheckCircleIcon } from './Icon';

interface PermissionsViewModalProps {
    user: User;
    onClose: () => void;
}

const PermissionsViewModal: React.FC<PermissionsViewModalProps> = ({ user, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '48rem' }}>
                <div className="modal-header">
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                            صلاحيات المستخدم: {user.name}
                        </h2>
                        <span style={{
                            background: 'var(--surface-bg)',
                            color: 'var(--text-secondary)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            border: '1px solid var(--surface-border)',
                            fontSize: '0.9rem',
                        }}>
                            {user.role}
                        </span>
                    </div>
                     <button type="button" onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
                            const grantedPermissions = permissions.filter(p => user.permissions.includes(p.key));
                            if (grantedPermissions.length === 0) return null;

                            return (
                                <div key={groupName}>
                                    <h4 style={{
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        borderBottom: '1px solid var(--surface-border)',
                                        paddingBottom: '0.5rem',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {groupName}
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {grantedPermissions.map(p => (
                                            <li key={p.key} style={{
                                                color: 'var(--text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <CheckCircleIcon style={{ width: 18, height: 18, color: 'var(--secondary-color)' }} />
                                                <span>{p.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn btn-primary">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsViewModal;
