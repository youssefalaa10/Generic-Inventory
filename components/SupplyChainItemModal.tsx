import React, { useEffect, useState } from 'react';
import { Product, SupplyChainItem, SupplyChainStatus, SupplyChainTransportMode } from '../types';

interface Props {
  item: SupplyChainItem | null;
  onClose: () => void;
  onSave: (item: SupplyChainItem) => void;
  products?: Product[];
}

export const supplyChainStatusOptions: { value: SupplyChainStatus; label: string }[] = [
  { value: 'In Transit', label: 'قيد الشحن' },
  { value: 'Stored', label: 'مخزن' },
  { value: 'Delivered', label: 'تم التسليم' },
  { value: 'Returned', label: 'تم الإرجاع' },
  { value: 'Expired', label: 'منتهي الصلاحية' },
  { value: 'Damaged', label: 'تالف' },
];

export const supplyChainTransportModeOptions: { value: SupplyChainTransportMode; label: string }[] = [
  { value: 'Air', label: 'جوي' },
  { value: 'Sea', label: 'بحري' },
  { value: 'Road', label: 'بري' },
  { value: 'Rail', label: 'سكك حديدية' },
  { value: 'None', label: 'بدون' },
];

const SupplyChainItemModal: React.FC<Props> = ({ item, onClose, onSave, products = [] }) => {
  const [formData, setFormData] = useState<SupplyChainItem>({
    id: -1,
    sku: '',
    gtin: '',
    batchNumber: '',
    serialNumber: '',
    productName: '',
    quantity: 0,
    unit: 'pcs',
    manufacturer: '',
    originCountry: '',
    manufactureDate: '',
    expiryDate: '',
    currentStatus: 'Stored',
    transportMode: 'None',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      const currentStatusValue = (item.currentStatus as SupplyChainStatus) || 'Stored';
      const transportModeValue = (item.transportMode as SupplyChainTransportMode) || 'None';
      const currentStatus = supplyChainStatusOptions.some((option) => option.value === currentStatusValue) ? currentStatusValue : 'Stored';
      const transportMode = supplyChainTransportModeOptions.some((option) => option.value === transportModeValue) ? transportModeValue : 'None';
      const normalizeDate = (d?: string) => (d ? d.slice(0, 10) : '');
      setFormData({
        ...item,
        currentStatus,
        transportMode,
        manufactureDate: normalizeDate(item.manufactureDate),
        expiryDate: normalizeDate(item.expiryDate),
        updated_at: new Date().toISOString(),
      });
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'manufactureDate' || name === 'expiryDate') {
      setErrors((prev) => {
        const md = name === 'manufactureDate' ? value : formData.manufactureDate || '';
        const ed = name === 'expiryDate' ? value : formData.expiryDate || '';
        const next = { ...prev } as Record<string, string>;
        if (md && ed && new Date(md) >= new Date(ed)) {
          next.expiryDate = 'تاريخ التصنيع يجب أن يكون قبل تاريخ الانتهاء';
        } else {
          if (next.expiryDate) delete next.expiryDate;
        }
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName?.trim()) newErrors.productName = 'اسم المنتج مطلوب';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'الكمية مطلوبة وبقيمة صحيحة';
    if (formData.manufactureDate && formData.expiryDate) {
      if (new Date(formData.manufactureDate) >= new Date(formData.expiryDate)) {
        newErrors.expiryDate = 'تاريخ التصنيع يجب أن يكون قبل تاريخ الانتهاء';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-pane" onClick={(e) => e.stopPropagation()} style={{ width: '900px', maxWidth: '95%', maxHeight: '95vh', overflow: 'auto', borderRadius: '1rem' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--surface-border)', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{item ? '✏️ تعديل توريد' : '✨ إضافة توريد'}</h2>
          <button onClick={onClose} style={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1rem 2rem' }}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="productName">المادة *</label>
                <select id="productName" name="productName" value={formData.productName} onChange={handleChange} className="form-select-enhanced">
                  <option value="">اختر...</option>
                  {(products || []).map((p) => (
                    <option key={(p as any)._id || p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                {errors.productName && <div className="error-message" style={{ color: '#ef4444' }}>{errors.productName}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="quantity">الكمية *</label>
                <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="form-input-enhanced" />
                {errors.quantity && <div className="error-message" style={{ color: '#ef4444' }}>{errors.quantity}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="unit">الوحدة</label>
                <select id="unit" name="unit" value={formData.unit || ''} onChange={handleChange} className="form-select-enhanced">
                  <option value="pcs">قطعة</option>
                  <option value="g">جرام</option>
                  <option value="ml">مليلتر</option>
                  <option value="kg">كيلوجرام</option>
                  <option value="l">لتر</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sku">رمز SKU</label>
                <input id="sku" name="sku" value={formData.sku || ''} onChange={handleChange} className="form-input-enhanced" />
              </div>
              <div className="form-group">
                <label htmlFor="gtin">رمز GTIN</label>
                <input id="gtin" name="gtin" value={formData.gtin || ''} onChange={handleChange} className="form-input-enhanced" />
              </div>
              <div className="form-group">
                <label htmlFor="batchNumber">رقم الدفعة</label>
                <input id="batchNumber" name="batchNumber" value={formData.batchNumber || ''} onChange={handleChange} className="form-input-enhanced" />
              </div>
              <div className="form-group">
                <label htmlFor="serialNumber">الرقم التسلسلي</label>
                <input id="serialNumber" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} className="form-input-enhanced" />
              </div>
              <div className="form-group">
                <label htmlFor="manufacturer">الشركة المصنعة</label>
                <input id="manufacturer" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} className="form-input-enhanced" />
              </div>
              <div className="form-group">
                <label htmlFor="originCountry">بلد المنشأ</label>
                <input id="originCountry" name="originCountry" value={formData.originCountry || ''} onChange={handleChange} className="form-input-enhanced" />
              </div>
              <div className="form-group">
                <label htmlFor="manufactureDate">تاريخ التصنيع</label>
                <input id="manufactureDate" name="manufactureDate" type="date" value={formData.manufactureDate || ''} onChange={handleChange} className="form-input-enhanced" />
                {errors.manufactureDate && <div className="error-message" style={{ color: '#ef4444' }}>{errors.manufactureDate}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="expiryDate">تاريخ الانتهاء</label>
                <input id="expiryDate" name="expiryDate" type="date" value={formData.expiryDate || ''} onChange={handleChange} className="form-input-enhanced" />
                {errors.expiryDate && <div className="error-message" style={{ color: '#ef4444' }}>{errors.expiryDate}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="currentStatus">الحالة الحالية</label>
                <select id="currentStatus" name="currentStatus" value={formData.currentStatus || 'Stored'} onChange={handleChange} className="form-select-enhanced">
                  {supplyChainStatusOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="transportMode">وسيلة النقل</label>
                <select id="transportMode" name="transportMode" value={formData.transportMode || 'None'} onChange={handleChange} className="form-select-enhanced">
                  {supplyChainTransportModeOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 2rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyChainItemModal;