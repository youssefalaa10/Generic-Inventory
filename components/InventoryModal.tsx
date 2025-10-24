import React, { useEffect, useState } from 'react';
import { InvItem } from '../src/store/slices/inventorySlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InvItem>) => void;
  item?: InvItem | null;
  loading?: boolean;
}

const InventoryModal: React.FC<Props> = ({ isOpen, onClose, onSave, item, loading = false }) => {
  const [form, setForm] = useState<Partial<InvItem>>({
    name: '',
    unit: 'قطعة',
    type: 'supplies',
    currentStock: 0,
    minimumStock: 0,
    costPerUnit: 0,
    location: '',
    barcode: '',
    sku: '',
    category: '',
    supplier: '',
    description: '',
  });

  useEffect(() => {
    if (item) {
      setForm({
        ...item,
      });
    } else {
      setForm({
        name: '',
        unit: 'قطعة',
        type: 'supplies',
        currentStock: 0,
        minimumStock: 0,
        costPerUnit: 0,
        location: '',
        barcode: '',
        sku: '',
        category: '',
        supplier: '',
        description: '',
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (key: keyof InvItem, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{item ? 'تعديل عنصر' : 'إضافة عنصر جديد'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
              <input className="w-full px-3 py-2 border rounded-md" required value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوحدة *</label>
              <input className="w-full px-3 py-2 border rounded-md" required value={form.unit || ''} onChange={e => set('unit', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
              <select className="w-full px-3 py-2 border rounded-md" value={form.type || 'supplies'} onChange={e => set('type', e.target.value)}>
                <option value="supplies">مستلزمات</option>
                <option value="packaging">تعبئة</option>
                <option value="fixtures">تجهيزات</option>
                <option value="maintenance">صيانة</option>
                <option value="security">أمن</option>
                <option value="marketing">تسويق</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.location || ''} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المخزون الحالي</label>
              <input type="number" className="w-full px-3 py-2 border rounded-md" value={form.currentStock ?? 0} onChange={e => set('currentStock', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى</label>
              <input type="number" className="w-full px-3 py-2 border rounded-md" value={form.minimumStock ?? 0} onChange={e => set('minimumStock', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التكلفة لكل وحدة</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" value={form.costPerUnit ?? 0} onChange={e => set('costPerUnit', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الباركود</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.barcode || ''} onChange={e => set('barcode', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.sku || ''} onChange={e => set('sku', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.category || ''} onChange={e => set('category', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المورد</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.supplier || ''} onChange={e => set('supplier', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
            <textarea className="w-full px-3 py-2 border rounded-md" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'جاري الحفظ...' : (item ? 'تحديث' : 'إضافة')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
