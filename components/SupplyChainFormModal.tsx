import React, { useState } from 'react';
import { useToasts } from './Toast';
import { useAppDispatch, slices } from '../src/store';

interface SupplyChainFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface SupplyChainFormData {
  sku: string;
  gtin: string;
  batchNumber: string;
  serialNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  manufacturer: string;
  originCountry: string;
  manufactureDate: string;
  expiryDate: string;
  currentStatus: string;
  transportMode: string;
}

const initialFormData: SupplyChainFormData = {
  sku: '',
  gtin: '',
  batchNumber: '',
  serialNumber: '',
  productName: '',
  quantity: 0,
  unit: '',
  manufacturer: '',
  originCountry: '',
  manufactureDate: '',
  expiryDate: '',
  currentStatus: '',
  transportMode: ''
};

const SupplyChainFormModal: React.FC<SupplyChainFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<SupplyChainFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const dispatch = useAppDispatch();
  const statusOptions = ['مخزون', 'مباع', 'مفقود', 'تالف', 'منتهي الصلاحية', 'في النقل', 'مستلم'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create the item through Redux
      await dispatch(slices.supplychains.thunks.createOne(formData)).unwrap();
      
      addToast('تم إضافة العنصر بنجاح', 'success');
      setFormData(initialFormData);
      onSuccess();
      onClose();
    } catch (error) {
      addToast('حدث خطأ أثناء إضافة العنصر', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl bg-base-100 shadow-lg p-0">
        <div className="sticky top-0 z-10 bg-base-100 border-b px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-xl">إضافة عنصر جديد</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-4">معلومات المنتج الأساسية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">اسم المنتج*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  className="input input-bordered focus:input-primary"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  placeholder="ادخل اسم المنتج"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">رمز SKU</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  className="input input-bordered focus:input-primary"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="ABC-123"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">رمز GTIN</span>
                </label>
                <input
                  type="text"
                  name="gtin"
                  className="input input-bordered focus:input-primary"
                  value={formData.gtin}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1234567890123"
                />
              </div>
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-4">تفاصيل المخزون</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">الكمية*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  className="input input-bordered focus:input-primary"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  inputMode="numeric"
                  placeholder="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">الوحدة</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  className="input input-bordered focus:input-primary"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="قطعة، كجم، لتر..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">الحالة الحالية</span>
                </label>
                <select
                  name="currentStatus"
                  className="select select-bordered focus:select-primary"
                  value={formData.currentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value }))}
                >
                  <option value="">— اختر الحالة —</option>
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-4">معلومات التصنيع</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">رقم الدفعة</span>
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  className="input input-bordered focus:input-primary"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  placeholder="LOT123"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">الرقم التسلسلي</span>
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  className="input input-bordered focus:input-primary"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="SN123456"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">الشركة المصنعة</span>
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  className="input input-bordered focus:input-primary"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="اسم الشركة المصنعة"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">بلد المنشأ</span>
                </label>
                <input
                  type="text"
                  name="originCountry"
                  className="input input-bordered focus:input-primary"
                  value={formData.originCountry}
                  onChange={handleInputChange}
                  placeholder="مصر، السعودية..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">تاريخ التصنيع</span>
                </label>
                <input
                  type="date"
                  name="manufactureDate"
                  className="input input-bordered focus:input-primary"
                  value={formData.manufactureDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">تاريخ الانتهاء</span>
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  className="input input-bordered focus:input-primary"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-4">معلومات النقل</h4>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">وسيلة النقل</span>
              </label>
              <input
                type="text"
                name="transportMode"
                className="input input-bordered focus:input-primary"
                value={formData.transportMode}
                onChange={handleInputChange}
                placeholder="بري، بحري، جوي..."
              />
            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-base-100 border-t px-6 py-4 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.productName || formData.quantity < 0}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyChainFormModal;