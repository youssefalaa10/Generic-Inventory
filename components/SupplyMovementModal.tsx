import React, { useState } from 'react';
import { Branch, Supply, SupplyMovement } from '../types';

interface SupplyMovementModalProps {
  onClose: () => void;
  onSave: (movement: SupplyMovement) => void;
  supplies: Supply[];
  branches: Branch[];
}

const SupplyMovementModal: React.FC<SupplyMovementModalProps> = ({ onClose, onSave, supplies, branches }) => {
  const [formData, setFormData] = useState<Omit<SupplyMovement, 'id' | 'date'>>({
    supplyId: supplies[0]?.id || 0,
    branchId: Number(branches[0]?.id) || 0,
    type: 'IN',
    quantity: 0,
    notes: '',
    createdBy: 1 // Assuming current user ID
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.supplyId) {
      newErrors.supplyId = 'المادة مطلوبة';
    }
    
    if (!formData.branchId) {
      newErrors.branchId = 'الفرع مطلوب';
    }
    
    if (!formData.type) {
      newErrors.type = 'نوع الحركة مطلوب';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'الكمية يجب أن تكون أكبر من صفر';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData as SupplyMovement);
    }
  };
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ width: '700px', maxWidth: '95%', maxHeight: '95vh', overflow: 'auto', borderRadius: '1rem' }}>
        <div className="modal-header" style={{ 
          borderBottom: '1px solid var(--surface-border)', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          background: 'linear-gradient(to right, var(--primary-glow-1) 0%, var(--primary-glow-2) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          <h2 style={{fontSize: '1.75rem', fontWeight: 700, margin: 0}}>📊 إضافة حركة مخزون</h2>
          <button onClick={onClose} style={{
            background: 'var(--surface-bg)', 
            border: '1px solid var(--surface-border)', 
            color: 'var(--text-secondary)', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{padding: '2rem'}}>
            <div className="form-row" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label htmlFor="supplyId" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>المادة *</label>
                <select
                  id="supplyId"
                  name="supplyId"
                  value={formData.supplyId}
                  onChange={handleChange}
                  className="form-select-enhanced"
                >
                  {supplies.map(supply => (
                    <option key={supply.id} value={supply.id}>{supply.name} ({supply.sku})</option>
                  ))}
                </select>
                {errors.supplyId && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.supplyId}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="branchId" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>الفرع *</label>
                <select
                  id="branchId"
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className="form-select-enhanced"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                {errors.branchId && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.branchId}</div>}
              </div>
            </div>
            
            <div className="form-row" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label htmlFor="type" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>نوع الحركة *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select-enhanced"
                >
                  <option value="IN">وارد</option>
                  <option value="OUT">صادر</option>
                  <option value="TRANSFER">تحويل</option>
                  <option value="ADJUSTMENT">تعديل</option>
                </select>
                {errors.type && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.type}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>الكمية *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="form-input-enhanced"
                />
                {errors.quantity && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.quantity}</div>}
              </div>
            </div>
            
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.25rem', 
              background: 'var(--surface-bg)',
              borderRadius: '0.75rem', 
              border: '1px solid var(--surface-border)',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px var(--surface-shadow)'
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>🔗 معلومات المرجع (اختياري)</h4>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="referenceType" style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>نوع المرجع</label>
                <select
                  id="referenceType"
                  name="referenceType"
                  value={formData.referenceType || ''}
                  onChange={handleChange}
                  className="form-select-enhanced"
                >
                  <option value="">بدون مرجع</option>
                  <option value="PURCHASE">مشتريات</option>
                  <option value="PRODUCTION">إنتاج</option>
                  <option value="INVENTORY_ADJUSTMENT">تعديل مخزون</option>
                  <option value="TRANSFER">تحويل</option>
                </select>
              </div>
              
              {formData.referenceType && (
                <div className="form-group">
                  <label htmlFor="referenceId" style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>رقم المرجع</label>
                  <input
                    type="number"
                    id="referenceId"
                    name="referenceId"
                    value={formData.referenceId || ''}
                    onChange={handleChange}
                    min="1"
                    className="form-input-enhanced"
                  />
                </div>
              )}
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="notes" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>ملاحظات</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                placeholder="ملاحظات إضافية (اختياري)"
                className="form-textarea-enhanced"
              />
            </div>
          </div>
          
          <div className="modal-footer" style={{
            justifyContent: 'flex-end', 
            gap: '1rem',
            padding: '1.5rem 2rem',
            background: 'var(--surface-bg)',
            borderTop: '1px solid var(--surface-border)',
            marginTop: '2rem'
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-ghost"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem'
              }}
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem'
              }}
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyMovementModal;