import React, { useEffect, useState } from 'react';
import { Supplier, Supply } from '../types';

interface SupplyModalProps {
  supply: Supply | null;
  onClose: () => void;
  onSave: (supply: Supply) => void;
  suppliers: Supplier[];
}

const SupplyModal: React.FC<SupplyModalProps> = ({ supply, onClose, onSave, suppliers }) => {
  const [formData, setFormData] = useState<Supply>({
    id: -1,
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    baseUnit: 'pcs',
    supplierId: suppliers[0]?.id || 1,
    description: '',
    density: undefined,
    minStock: undefined,
    reorderPoint: undefined,
    leadTime: undefined,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (supply) {
      setFormData({
        ...supply,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    }
  }, [supply]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value)
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المادة مطلوب';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'الرمز التعريفي مطلوب';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'الفئة مطلوبة';
    }
    
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = 'سعر الوحدة يجب أن يكون أكبر من صفر';
    }
    
    if (!formData.baseUnit) {
      newErrors.baseUnit = 'وحدة القياس مطلوبة';
    }
    
    if (!formData.supplierId) {
      newErrors.supplierId = 'المورد مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ width: '700px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>{supply ? 'تعديل مادة' : 'إضافة مادة جديدة'}</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer'}}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{padding: '1.5rem'}}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">اسم المادة *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="أدخل اسم المادة"
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="sku">الرمز التعريفي (SKU) *</label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={errors.sku ? 'error' : ''}
                  placeholder="مثال: SUP-001"
                />
                {errors.sku && <div className="error-message">{errors.sku}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">الفئة *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                  placeholder="مثال: Raw Material, Chemical"
                />
                {errors.category && <div className="error-message">{errors.category}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="supplierId">المورد *</label>
                <select
                  id="supplierId"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className={errors.supplierId ? 'error' : ''}
                >
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
                {errors.supplierId && <div className="error-message">{errors.supplierId}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unitPrice">سعر الوحدة *</label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.unitPrice ? 'error' : ''}
                />
                {errors.unitPrice && <div className="error-message">{errors.unitPrice}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="baseUnit">وحدة القياس *</label>
                <select
                  id="baseUnit"
                  name="baseUnit"
                  value={formData.baseUnit}
                  onChange={handleChange}
                  className={errors.baseUnit ? 'error' : ''}
                >
                  <option value="pcs">قطعة</option>
                  <option value="g">جرام</option>
                  <option value="ml">مليلتر</option>
                  <option value="kg">كيلوجرام</option>
                  <option value="l">لتر</option>
                </select>
                {errors.baseUnit && <div className="error-message">{errors.baseUnit}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">الوصف</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                placeholder="وصف إضافي للمادة (اختياري)"
              />
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>إعدادات المخزون</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="minStock">الحد الأدنى للمخزون</label>
                  <input
                    type="number"
                    id="minStock"
                    name="minStock"
                    value={formData.minStock || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="مثال: 100"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reorderPoint">نقطة إعادة الطلب</label>
                  <input
                    type="number"
                    id="reorderPoint"
                    name="reorderPoint"
                    value={formData.reorderPoint || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="مثال: 150"
                  />
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#0369a1' }}>تفاصيل تقنية (اختياري)</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="density">الكثافة (g/ml)</label>
                  <input
                    type="number"
                    id="density"
                    name="density"
                    value={formData.density || ''}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="مثال: 1.0"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="leadTime">وقت التوريد (أيام)</label>
                  <input
                    type="number"
                    id="leadTime"
                    name="leadTime"
                    value={formData.leadTime || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="مثال: 7"
                  />
                </div>
              </div>
            </div>
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

export default SupplyModal;