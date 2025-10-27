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
      <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90%' }}>
        <div className="modal-header">
          <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>إضافة حركة مخزون</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{padding: '1.5rem'}}>
            <div className="form-group">
              <label htmlFor="supplyId">المادة *</label>
              <select
                id="supplyId"
                name="supplyId"
                value={formData.supplyId}
                onChange={handleChange}
                className={errors.supplyId ? 'error' : ''}
              >
                {supplies.map(supply => (
                  <option key={supply.id} value={supply.id}>{supply.name} ({supply.sku})</option>
                ))}
              </select>
              {errors.supplyId && <div className="error-message">{errors.supplyId}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="branchId">الفرع *</label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                className={errors.branchId ? 'error' : ''}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              {errors.branchId && <div className="error-message">{errors.branchId}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="type">نوع الحركة *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
              >
                <option value="IN">وارد</option>
                <option value="OUT">صادر</option>
                <option value="TRANSFER">تحويل</option>
                <option value="ADJUSTMENT">تعديل</option>
              </select>
              {errors.type && <div className="error-message">{errors.type}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">الكمية *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className={errors.quantity ? 'error' : ''}
              />
              {errors.quantity && <div className="error-message">{errors.quantity}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="referenceType">نوع المرجع</label>
              <select
                id="referenceType"
                name="referenceType"
                value={formData.referenceType || ''}
                onChange={handleChange}
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
                <label htmlFor="referenceId">رقم المرجع</label>
                <input
                  type="number"
                  id="referenceId"
                  name="referenceId"
                  value={formData.referenceId || ''}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="notes">ملاحظات</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          
          <div className="modal-footer" style={{justifyContent: 'flex-end', gap: '1rem'}}>
            <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
            <button type="submit" className="btn btn-secondary">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyMovementModal;