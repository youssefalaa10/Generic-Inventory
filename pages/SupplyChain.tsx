import React, { useEffect, useMemo, useState } from 'react';
import { useToasts } from '../components/Toast';
import { useAppDispatch, useAppSelector, slices, selectAll } from '../src/store';
import * as XLSX from 'xlsx';
import SupplyChainFormModal from '../components/SupplyChainFormModal';

interface ImportedRow {
  [key: string]: any;
}

interface SupplyChainItem {
  id: number;
  sku?: string;
  gtin?: string;
  batchNumber?: string;
  serialNumber?: string;
  productName: string;
  quantity: number;
  unit?: string;
  manufacturer?: string;
  originCountry?: string;
  manufactureDate?: string;
  expiryDate?: string;
  currentStatus?: string;
  transportMode?: string;
}

const expectedColumns = [
  'المعرف',
  'رمز SKU',
  'رمز GTIN',
  'رقم الدفعة',
  'الرقم التسلسلي',
  'اسم المنتج',
  'الكمية',
  'الوحدة',
  'الشركة المصنعة',
  'بلد المنشأ',
  'تاريخ التصنيع',
  'تاريخ الانتهاء',
  'الحالة الحالية',
  'وسيلة النقل'
];

// Utility functions for data cleaning
const cleanValue = (value: any): string => {
  if (!value) return '';
  const str = String(value).trim();
  return str
    .replace(/[\x00-\x1F\x7F-\xFF]/g, '') // Remove non-printable chars
    .replace(/[^\u0600-\u06FF\u0750-\u077F\w\s-.]/g, ''); // Keep Arabic, English, numbers, and basic punctuation
};

const safeNumber = (value: any): number => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};

// Transform imported data to valid supply chain items
const transformImportedData = (rows: ImportedRow[]): SupplyChainItem[] => {
  return rows
    .filter(row => {
      // Skip completely empty or corrupted rows
      const values = Object.values(row).map(v => cleanValue(v));
      return values.some(v => v.length > 0);
    })
    .map((row, index) => ({
      id: safeNumber(row[expectedColumns[0]]) || index + 1,
      sku: cleanValue(row[expectedColumns[1]]),
      gtin: cleanValue(row[expectedColumns[2]]),
      batchNumber: cleanValue(row[expectedColumns[3]]),
      serialNumber: cleanValue(row[expectedColumns[4]]),
      productName: cleanValue(row[expectedColumns[5]]) || `منتج ${index + 1}`,
      quantity: safeNumber(row[expectedColumns[6]]),
      unit: cleanValue(row[expectedColumns[7]]),
      manufacturer: cleanValue(row[expectedColumns[8]]),
      originCountry: cleanValue(row[expectedColumns[9]]),
      manufactureDate: cleanValue(row[expectedColumns[10]]),
      expiryDate: cleanValue(row[expectedColumns[11]]),
      currentStatus: cleanValue(row[expectedColumns[12]]),
      transportMode: cleanValue(row[expectedColumns[13]])
    }));
};

const SupplyChain: React.FC = () => {
  const { addToast } = useToasts();
  const dispatch = useAppDispatch();
  const supplyChainState = useAppSelector(s => (s as any).supplychains || {});
  const data = useAppSelector(s => selectAll(s as any, 'supplychains')) as SupplyChainItem[];
  const loading = supplyChainState.loading?.list;
  const error = supplyChainState.error?.list;
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Initial data fetch
  useEffect(() => {
    dispatch(slices.supplychains.thunks.list({ params: { page: 1, limit: 1000 } }));
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return data.filter((item) => (
      (item.sku || '').toLowerCase().includes(q) ||
      (item.gtin || '').toLowerCase().includes(q) ||
      (item.productName || '').toLowerCase().includes(q)
    ));
  }, [data, searchTerm]);

  const handleDownloadTemplate = () => {
    try {
      // Create an empty row for the template
      const template = expectedColumns.reduce((obj, col) => {
        obj[col] = '';
        return obj;
      }, {} as Record<string, string>);

      // Create the worksheet
      const ws = XLSX.utils.json_to_sheet([template], {
        header: expectedColumns
      });

      // Set column widths
      const colWidths = expectedColumns.map(() => ({ wch: 25 }));
      ws['!cols'] = colWidths;

      // Create workbook and set RTL
      const wb = XLSX.utils.book_new();
      wb.Workbook = {
        Views: [{ RTL: true }]
      };
      
      // Add sheet and save
      XLSX.utils.book_append_sheet(wb, ws, 'سلسلة التوريد');
      
      // Apply custom style to support RTL
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (!cell) continue;
          cell.s = { alignment: { horizontal: 'right' } };
        }
      }

      XLSX.writeFile(wb, 'قالب سلسلة التوريد.xlsx');
      
      addToast('تم تحميل القالب', 'success');
    } catch (error) {
      addToast('تعذر تحميل القالب', 'error');
    }
  };

  const handleExport = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      wb.Workbook = { Views: [{ RTL: true }] };

      // Map data to rows with Arabic headers
      const rows = filteredData.map((r) => ({
        [expectedColumns[0]]: r.id,
        [expectedColumns[1]]: r.sku || '',
        [expectedColumns[2]]: r.gtin || '',
        [expectedColumns[3]]: r.batchNumber || '',
        [expectedColumns[4]]: r.serialNumber || '',
        [expectedColumns[5]]: r.productName,
        [expectedColumns[6]]: r.quantity,
        [expectedColumns[7]]: r.unit || '',
        [expectedColumns[8]]: r.manufacturer || '',
        [expectedColumns[9]]: r.originCountry || '',
        [expectedColumns[10]]: r.manufactureDate || '',
        [expectedColumns[11]]: r.expiryDate || '',
        [expectedColumns[12]]: r.currentStatus || '',
        [expectedColumns[13]]: r.transportMode || ''
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(rows, { header: expectedColumns });
      ws['!cols'] = expectedColumns.map(() => ({ wch: 20 }));

      // Add to workbook and save
      XLSX.utils.book_append_sheet(wb, ws, 'سلسلة التوريد');
      XLSX.writeFile(wb, 'بيانات سلسلة التوريد.xlsx');

      addToast('تم تصدير البيانات', 'success');
    } catch (error) {
      addToast('تعذر تصدير البيانات', 'error');
    }
  };

  const handleExportSelected = () => {
    try {
      const wb = XLSX.utils.book_new();
      wb.Workbook = { Views: [{ RTL: true }] };

      const selectedItems = filteredData.filter((r) => selectedRows.includes(r.id));
      const rows = selectedItems.map((r) => ({
        [expectedColumns[0]]: r.id,
        [expectedColumns[1]]: r.sku || '',
        [expectedColumns[2]]: r.gtin || '',
        [expectedColumns[3]]: r.batchNumber || '',
        [expectedColumns[4]]: r.serialNumber || '',
        [expectedColumns[5]]: r.productName,
        [expectedColumns[6]]: r.quantity,
        [expectedColumns[7]]: r.unit || '',
        [expectedColumns[8]]: r.manufacturer || '',
        [expectedColumns[9]]: r.originCountry || '',
        [expectedColumns[10]]: r.manufactureDate || '',
        [expectedColumns[11]]: r.expiryDate || '',
        [expectedColumns[12]]: r.currentStatus || '',
        [expectedColumns[13]]: r.transportMode || ''
      }));

      const ws = XLSX.utils.json_to_sheet(rows, { header: expectedColumns });
      ws['!cols'] = expectedColumns.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws, 'سلسلة التوريد');
      XLSX.writeFile(wb, 'بيانات سلسلة التوريد - المحدد فقط.xlsx');
      addToast('تم تصدير المحدد', 'success');
    } catch (error) {
      addToast('تعذر تصدير المحدد', 'error');
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    const s = (status || '').trim();
    switch (s) {
      case 'مخزون': return 'badge badge-neutral';
      case 'مباع': return 'badge badge-success';
      case 'مفقود': return 'badge badge-warning';
      case 'تالف': return 'badge badge-error';
      case 'منتهي الصلاحية': return 'badge badge-error';
      case 'في النقل': return 'badge badge-info';
      case 'مستلم': return 'badge badge-primary';
      default: return 'badge';
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);

    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse workbook
      const wb = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      if (!wb.SheetNames.length) {
        addToast('ملف غير صالح', 'error');
        return;
      }

      // Get first sheet
      const ws = wb.Sheets[wb.SheetNames[0]];
      
      // Parse to JSON with options to help clean data
      const rows = XLSX.utils.sheet_to_json(ws, {
        defval: '',
        raw: false,
        rawNumbers: false
      }) as ImportedRow[];

      if (!rows?.length) {
        addToast('الملف فارغ', 'error');
        return;
      }

      // Transform and clean the data
      const items = transformImportedData(rows);
      
      if (!items.length) {
        addToast('لم يتم العثور على بيانات صالحة في الملف', 'error');
        return;
      }

      // Upload the cleaned data
      await Promise.all(
        items.map(item =>
          dispatch(slices.supplychains.thunks.createOne(item)).unwrap()
        )
      );

      addToast(`تم استيراد ${items.length} عنصر بنجاح`, 'success');
      
      // Refresh the list
      dispatch(slices.supplychains.thunks.list({ 
        params: { page: 1, limit: 1000 } 
      }));
    } catch (error) {
      console.error('Import error:', error);
      addToast('حدث خطأ أثناء استيراد الملف', 'error');
    }
  };

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Array<string | number>>([]);

  const handleRefreshData = () => {
    dispatch(slices.supplychains.thunks.list({ params: { page: 1, limit: 1000 } }));
  };

  const handleDeleteAll = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      // Delete items in batches to prevent overwhelming the server
      const batchSize = 5;
      const itemsToDelete = selectedRows.length > 0 
        ? data.filter(item => selectedRows.includes(item.id))
        : [...data];
      const batches = [];
      
      while (itemsToDelete.length) {
        batches.push(itemsToDelete.splice(0, batchSize));
      }

      let deletedCount = 0;
      for (const batch of batches) {
        try {
          await Promise.all(
            batch.map(item =>
              dispatch(slices.supplychains.thunks.removeOne(item.id)).unwrap()
            )
          );
          deletedCount += batch.length;
          
          // Show progress
          const totalCount = itemsToDelete.length;
          addToast(`تم حذف ${deletedCount} من ${totalCount} عنصر`, 'info');
        } catch (err) {
          console.error('Error deleting batch:', err);
          // Continue with next batch even if one fails
        }
      }

      const totalCount = selectedRows.length > 0 ? selectedRows.length : data.length;
      if (deletedCount === totalCount) {
        addToast(`تم حذف ${totalCount} عنصر بنجاح`, 'success');
      } else if (deletedCount > 0) {
        addToast(`تم حذف ${deletedCount} عنصر من أصل ${totalCount}`, 'error');
      } else {
        throw new Error('فشل في حذف العناصر');
      }

      handleRefreshData();
      setIsDeleteModalOpen(false);
      setSelectedRows([]);
    } catch (error) {
      console.error('Delete error:', error);
      addToast('حدث خطأ أثناء حذف العناصر', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-pane" style={{ padding: '1rem' }}>
      <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-2xl font-bold">إدارة سلسلة التوريد</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="join hidden md:inline-flex">
              <button className={`btn btn-sm join-item ${density === 'comfortable' ? 'btn-active' : ''}`} onClick={() => setDensity('comfortable')}>مريحة</button>
              <button className={`btn btn-sm join-item ${density === 'compact' ? 'btn-active' : ''}`} onClick={() => setDensity('compact')}>مضغوطة</button>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setIsFormModalOpen(true)}
            >
              <i className="fas fa-plus"></i>
              إضافة عنصر جديد
            </button>
            
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost">
                <i className="fas fa-ellipsis-v"></i>
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <button onClick={handleDownloadTemplate}>
                    <i className="fas fa-download"></i>
                    تحميل القالب
                  </button>
                </li>
                <li>
                  <label style={{ cursor: 'pointer' }}>
                    <i className="fas fa-file-import"></i>
                    استيراد ملف
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleImport} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </li>
                <li>
                  <button 
                    onClick={handleExport}
                    disabled={loading || !filteredData.length}
                  >
                    <i className="fas fa-file-export"></i>
                    تصدير البيانات
                  </button>
                </li>
                <li>
                  <button 
                    className="text-error" 
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={!data.length}
                  >
                    <i className="fas fa-trash"></i>
                    حذف جميع العناصر
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="divider my-4"></div>

        <div className="form-control w-full md:w-96">
          <div className="relative">
            <input 
              type="text"
              className="input input-bordered w-full pr-10"
              placeholder="بحث بـ SKU أو GTIN أو اسم المنتج"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"></i>
          </div>
          {selectedFileName && (
            <div className="mt-2 text-xs text-base-content/60 flex items-center gap-2">
              <i className="fas fa-paperclip"></i>
              <span>ملف محدد: {selectedFileName}</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          {selectedRows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b bg-base-200/50">
              <div className="text-sm">
                تم تحديد {selectedRows.length} عنصر
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={handleExportSelected}>
                  <i className="fas fa-file-export"></i>
                  تصدير المحدد
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <i className="fas fa-trash"></i>
                  حذف المحدد
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            {filteredData.length > 0 ? (
              <table className={`table table-zebra w-full ${density === 'compact' ? 'text-sm' : ''}`}>
                <thead>
                  <tr className="bg-base-200">
                    <th className="bg-base-200 w-10 sticky top-0 z-10">
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(filteredData.map(item => item.id));
                            } else {
                              setSelectedRows([]);
                            }
                          }}
                        />
                      </label>
                    </th>
                    {expectedColumns.map(col => (
                      <th key={col} className="text-right bg-base-200 font-bold sticky top-0 z-10">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.id} className="hover">
                      <th>
                        <label>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedRows.includes(row.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([...selectedRows, row.id]);
                              } else {
                                setSelectedRows(selectedRows.filter(id => id !== row.id));
                              }
                            }}
                          />
                        </label>
                      </th>
                      <td>{row.id}</td>
                      <td>
                        <span className="font-mono">{row.sku || '—'}</span>
                      </td>
                      <td>
                        <span className="font-mono">{row.gtin || '—'}</span>
                      </td>
                      <td>
                        <span className="font-mono">{row.batchNumber || '—'}</span>
                      </td>
                      <td>
                        <span className="font-mono">{row.serialNumber || '—'}</span>
                      </td>
                      <td className="font-medium">{row.productName}</td>
                      <td className="text-center">
                        <span className="badge badge-neutral">{row.quantity}</span>
                      </td>
                      <td>{row.unit || '—'}</td>
                      <td>{row.manufacturer || '—'}</td>
                      <td>{row.originCountry || '—'}</td>
                      <td>{row.manufactureDate || '—'}</td>
                      <td>{row.expiryDate || '—'}</td>
                      <td>
                        <span className={getStatusBadgeClass(row.currentStatus)}>{row.currentStatus || '—'}</span>
                      </td>
                      <td>{row.transportMode || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-base-content/60">
                <i className="fas fa-box-open text-4xl mb-4"></i>
                <p className="text-lg font-medium">
                  {searchTerm ? 
                    'لا توجد نتائج تطابق البحث' : 
                    'لا توجد بيانات'
                  }
                </p>
                <p className="mt-2">
                  {!searchTerm && 'قم بإضافة عنصر جديد أو استيراد ملف للبدء'}
                </p>
                {!searchTerm && (
                  <div className="mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsFormModalOpen(true)}
                    >
                      <i className="fas fa-plus"></i>
                      إضافة عنصر جديد
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {filteredData.length > 0 && (
            <div className="p-4 border-t text-base-content/60 text-sm">
              {filteredData.length} عنصر
            </div>
          )}
        </div>
      )}

      <SupplyChainFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefreshData}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">تأكيد الحذف</h3>
            <p className="mb-2">
              هل أنت متأكد من حذف {selectedRows.length > 0 
                ? `${selectedRows.length} عنصر محدد` 
                : `جميع العناصر (${data.length} عنصر)`}؟
            </p>
            <p className="text-error text-sm">
              تحذير: لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleDeleteAll}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    حذف الكل
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChain;
