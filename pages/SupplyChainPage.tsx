import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../App';
import { FilterIcon, PencilIcon, PlusIcon, RefreshIcon, TrashIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import SupplyChainItemModal, { supplyChainStatusOptions, supplyChainTransportModeOptions } from '../components/SupplyChainItemModal';
import { SupplyChainItem, SupplyChainStatus, SupplyChainTransportMode } from '../types';
import {
  fetchSupplyChainItems,
  createSupplyChainItem,
  updateSupplyChainItem,
  deleteSupplyChainItem,
  importItems,
} from '../src/store/slices/supplyChainItemsSlice';
import * as XLSX from 'xlsx';

interface SupplyChainPageProps {
  activeView?: string;
  setActiveView?: (view: string) => void;
}

const SupplyChainPage: React.FC<SupplyChainPageProps> = ({ activeView, setActiveView }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.supplyChainItems.items) || [];
  const loading = useAppSelector((state) => state.supplyChainItems.loading);
  const error = useAppSelector((state) => state.supplyChainItems.error);
  
  // Local state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SupplyChainItem | null>(null);
  const [filterText, setFilterText] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  
  const expectedColumns = useMemo(() => [
    'المعرف', 'رمز_SKU', 'رمز_GTin', 'رقم_الدفعة', 'الرقم_التسلسلي',
    'اسم_المنتج', 'الكمية', 'الوحدة', 'الشركة_المصنعة', 'بلد_المنشأ',
    'تاريخ_التصنيع', 'تاريخ_الانتهاء', 'الحالة_الحالية', 'وسيلة_النقل',
  ], []);
  
  // Load from API
  useEffect(() => {
    dispatch(fetchSupplyChainItems(undefined));
  }, [dispatch]);
  
  // Check permissions
  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    return user.permissions.includes(`supplies:${permission}`);
  };
  
  // Filter items based on search text - with array safety check
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn('Items is not an array:', items);
      return [];
    }
    return items.filter((item: SupplyChainItem) =>
      (item.productName || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (item.batchNumber || '').toLowerCase().includes(filterText.toLowerCase())
    );
  }, [items, filterText]);
  
  const getStatusLabel = (value?: SupplyChainStatus) =>
    supplyChainStatusOptions.find((option) => option.value === value)?.label || value || '-';

  const getTransportModeLabel = (value?: SupplyChainTransportMode) =>
    supplyChainTransportModeOptions.find((option) => option.value === value)?.label || value || '-';
  
  const formatDate = (v?: string) => {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) {
      const parts = v.split('-');
      if (parts.length === 3) {
        const [y, m, day] = parts;
        return `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
      }
      return v;
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  
  // Handle adding a new item
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsItemModalOpen(true);
  };
  
  // Handle editing an item
  const handleEditItem = (item: SupplyChainItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };
  
  // Handle deleting an item
  const handleDeleteItem = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التوريد؟')) {
      dispatch(deleteSupplyChainItem(id) as any)
        .unwrap()
        .then(() => addToast('تم حذف التوريد بنجاح', 'success'))
        .catch(() => addToast('فشل حذف التوريد', 'error'));
    }
  };
  
  // Handle saving an item
  const handleSaveItem = (item: SupplyChainItem) => {
    if (item.id < 0) {
      const { created_at, updated_at, ...payload } = item;
      const id = typeof payload.id === 'number' && payload.id > 0 ? payload.id : Date.now();
      const payloadWithId = { ...payload, id };
      dispatch(createSupplyChainItem(payloadWithId as any) as any)
        .unwrap()
        .then(() => {
          addToast('تمت إضافة التوريد بنجاح', 'success');
          setIsItemModalOpen(false);
        })
        .catch(() => addToast('فشل إضافة التوريد', 'error'));
    } else {
      dispatch(updateSupplyChainItem(item) as any)
        .unwrap()
        .then(() => {
          addToast('تم تحديث التوريد بنجاح', 'success');
          setIsItemModalOpen(false);
        })
        .catch(() => addToast('فشل تحديث التوريد', 'error'));
    }
  };

  // Excel template download
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([expectedColumns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'توريد_المواد_قالب.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Excel upload
  const handleExcelUpload = async (file: File) => {
    try {
      setFileUploading(true);
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const header = rows[0] as string[];
      const body = rows.slice(1);
      // Validate columns
      const normalized = (s: string) => s?.trim();
      const ok = expectedColumns.every((col) => header.some((h) => normalized(h) === col));
      if (!ok) {
        addToast('صيغة الأعمدة غير صحيحة. الرجاء استخدام القالب.', 'error');
        return;
      }
      const colIndex = (name: string) => header.findIndex((h) => normalized(h) === name);
      const imported: SupplyChainItem[] = body
        .filter((r) => r && r.length > 0)
        .map((r) => {
          const get = (n: string) => r[colIndex(n)] ?? '';
          return {
            id: Number(get('المعرف')) || Math.floor(Math.random() * 1e9),
            sku: String(get('رمز_SKU')) || undefined,
            gtin: String(get('رمز_GTin')) || undefined,
            batchNumber: String(get('رقم_الدفعة')) || undefined,
            serialNumber: String(get('الرقم_التسلسلي')) || undefined,
            productName: String(get('اسم_المنتج')) || '',
            quantity: Number(get('الكمية')) || 0,
            unit: String(get('الوحدة')) || undefined,
            manufacturer: String(get('الشركة_المصنعة')) || undefined,
            originCountry: String(get('بلد_المنشأ')) || undefined,
            manufactureDate: String(get('تاريخ_التصنيع')) || undefined,
            expiryDate: String(get('تاريخ_الانتهاء')) || undefined,
            currentStatus: String(get('الحالة_الحالية')) || undefined,
            transportMode: String(get('وسيلة_النقل')) || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as SupplyChainItem;
        });
      dispatch(importItems(imported));
      addToast('تم استيراد الملف بنجاح', 'success');
    } catch (e) {
      console.error(e);
      addToast('فشل في استيراد الملف', 'error');
    } finally {
      setFileUploading(false);
    }
  };
  
  // Removed supplier name lookup; supply chain items table doesn't show supplier.
  
  return (
    <div className="glass-pane" style={{ padding: '1rem 1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
        gap: '1rem',
        marginBottom: '1rem' 
      }}>
        <h3 style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem', fontWeight: 600 }}>سلسلة التوريد - المواد</h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: window.innerWidth < 768 ? 'flex-start' : 'flex-end'
        }}>
          {hasPermission('create') && (
            <button onClick={handleAddItem} className="btn btn-primary" style={{ fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem', padding: window.innerWidth < 768 ? '0.5rem 0.75rem' : undefined }}>
              <PlusIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
              {window.innerWidth < 768 ? 'إضافة' : 'إضافة توريد'}
            </button>
          )}
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            {fileUploading ? 'جارٍ الاستيراد...' : 'استيراد من إكسل'}
            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleExcelUpload(f);
              e.currentTarget.value = '';
            }} />
          </label>
          <button className="btn btn-secondary" onClick={handleDownloadTemplate}>تنزيل القالب</button>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        gap: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <FilterIcon style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} />
          <input
            type="text"
            placeholder="بحث..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.25rem', 
              border: '1px solid #e5e7eb', 
              flex: 1,
              fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
            }}
          />
        </div>
        
        <button
          onClick={() => setFilterText('')}
          className="btn btn-secondary"
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem' : undefined
          }}
        >
          <RefreshIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
          {window.innerWidth < 768 ? 'إعادة' : 'إعادة تعيين'}
        </button>
      </div>
      
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', color: '#6b7280' }}>
          <RefreshIcon style={{ width: '16px', height: '16px' }} />
          <span>جارٍ التحميل...</span>
        </div>
      )}
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: window.innerWidth < 768 ? '1000px' : '100%' }}>
          <thead>
            <tr>
              {window.innerWidth >= 768 && <th>المعرف</th>}
              <th>اسم_المنتج</th>
              <th>رمز_SKU</th>
              <th>رمز_GTin</th>
              <th>رقم_الدفعة</th>
              <th>الرقم_التسلسلي</th>
              <th>الكمية</th>
              <th>الوحدة</th>
              {window.innerWidth >= 768 && <th>الشركة_المصنعة</th>}
              {window.innerWidth >= 768 && <th>بلد_المنشأ</th>}
              {window.innerWidth >= 768 && <th>تاريخ_التصنيع</th>}
              {window.innerWidth >= 768 && <th>تاريخ_الانتهاء</th>}
              <th>الحالة_الحالية</th>
              <th>وسيلة_النقل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item: SupplyChainItem) => (
              <tr key={item.id}>
                {window.innerWidth >= 768 && <td>{item.id}</td>}
                <td>{item.productName}</td>
                <td>{item.sku || '-'}</td>
                <td>{item.gtin || '-'}</td>
                <td>{item.batchNumber || '-'}</td>
                <td>{item.serialNumber || '-'}</td>
                <td>{item.quantity}</td>
                <td>{item.unit || '-'}</td>
                {window.innerWidth >= 768 && <td>{item.manufacturer || '-'}</td>}
                {window.innerWidth >= 768 && <td>{item.originCountry || '-'}</td>}
                {window.innerWidth >= 768 && <td>{formatDate(item.manufactureDate)}</td>}
                {window.innerWidth >= 768 && <td>{formatDate(item.expiryDate)}</td>}
                <td>{getStatusLabel(item.currentStatus as SupplyChainStatus)}</td>
                <td>{getTransportModeLabel(item.transportMode as SupplyChainTransportMode)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {hasPermission('update') && (
                      <button
                        onClick={() => handleEditItem(item)}
                        style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <PencilIcon style={{ width: window.innerWidth < 768 ? '18px' : '20px', height: window.innerWidth < 768 ? '18px' : '20px' }} />
                      </button>
                    )}
                    {hasPermission('delete') && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <TrashIcon style={{ width: window.innerWidth < 768 ? '18px' : '20px', height: window.innerWidth < 768 ? '18px' : '20px' }} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isItemModalOpen && (
        <SupplyChainItemModal
          item={selectedItem}
          onClose={() => setIsItemModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};

export default SupplyChainPage;
