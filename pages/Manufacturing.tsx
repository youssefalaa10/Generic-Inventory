import React from 'react';

// This is a placeholder file. The new Manufacturing Order page is in ManufacturingOrderPage.tsx
// The routing in App.tsx has been updated to point to the new page.

const Manufacturing: React.FC = () => {
    return (
        <div className="glass-pane" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>أوامر التصنيع</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
                Please navigate to the new Manufacturing Order page.
            </p>
        </div>
    );
};

export default Manufacturing;
