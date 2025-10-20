
import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { Role } from '../types';

const rolesToSelect = [
  Role.SuperAdmin,
  Role.Perfumer,
  Role.Accountant,
  Role.BranchManager,
  Role.ShopAssistant,
  Role.EcommerceManager,
  Role.Employee,
];

const LoginScreen: React.FC = () => {
  const { login } = useContext(AuthContext);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-pane" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, var(--primary-glow-1), var(--primary-glow-2))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '2rem',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--primary-color) 40%, transparent)'
          }}>
            F
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            نظام الإدارة المالية المتكامل
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            يرجى تحديد دورك لتسجيل الدخول
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rolesToSelect.map((role) => (
            <button
              key={role}
              onClick={() => login(role)}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem', justifyContent: 'center' }}
            >
              دخول كـ {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
