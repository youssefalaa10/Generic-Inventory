import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { FilterIcon, PlusIcon, RefreshIcon } from '../components/Icon';
import SupplyInventoryItemModal from '../components/SupplyInventoryItemModal';
import { useToasts } from '../components/Toast';
import { BRANCHES, SUPPLIES } from '../services/mockData';
import { setSupplies } from '../src/store/slices/suppliesSlice';
import {
  fetchSupplyInventory,
  createSupplyInventoryItem,
  updateSupplyInventoryItem,
  deleteSupplyInventoryItem,
} from '../src/store/slices/supplyInventorySlice';
import { fetchSupplyChainItems } from '../src/store/slices/supplyChainItemsSlice';
import { Supply, SupplyInventory, SupplyChainItem } from '../types';

interface SupplyInventoryPageProps {
  activeView?: string;
  setActiveView?: (view: string) => void;
}

type SupplyDisplay = {
  id: number;
  name: string;
  sku: string;
  baseUnit: string;
};

const SupplyInventoryPage: React.FC<SupplyInventoryPageProps> = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();
  const dispatch = useDispatch();

  const supplies = useSelector((state: any) => state.supplies.items) as Supply[];
  const supplyInventoryState = useSelector(
    (state: any) => state.supplyInventory
  ) as { items: SupplyInventory[]; loading: boolean; error: string | null };
  const inventory = supplyInventoryState.items;
  const loading = supplyInventoryState.loading;
  const error = supplyInventoryState.error;
  const scItems = useSelector((state: any) => state.supplyChainItems.items) as SupplyChainItem[];

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<SupplyInventory> & { supplyId?: number } | null>(null);

  useEffect(() => {
    dispatch(fetchSupplyInventory() as any);
    dispatch(fetchSupplyChainItems(undefined) as any);
  }, [dispatch]);

  useEffect(() => {
    if (!supplies?.length) {
      dispatch(setSupplies(SUPPLIES));
    }
  }, [dispatch, supplies?.length]);

  const dropdownSupplies = useMemo(() => {
    if (supplies.length) return supplies;
    const derived: Supply[] = [];
    const seen = new Set<string>();
    scItems.forEach((item, index) => {
      const id = Number(item.id ?? index + 1);
      const key = `${id}|${item.productName}`;
      if (seen.has(key)) return;
      seen.add(key);
      derived.push({
        id,
        name: item.productName || `المادة ${id}`,
        sku: item.sku || '',
        category: '',
        unitPrice: 0,
        baseUnit: (item.unit as any) || 'pcs',
        supplierId: 0,
        description: undefined,
        density: undefined,
        minStock: undefined,
        reorderPoint: undefined,
        leadTime: undefined,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      });
    });
    return derived;
  }, [supplies, scItems]);

  const supplyLookup = useMemo(() => {
    const map = new Map<number, SupplyDisplay>();
    dropdownSupplies.forEach((s) => {
      map.set(Number(s.id), {
        id: Number(s.id),
        name: s.name,
        sku: s.sku || '',
        baseUnit: s.baseUnit,
      });
    });
    inventory.forEach((item) => {
      const embedded = (item as any).supply || (item as any).material;
      if (embedded) {
        const id = Number(embedded.id ?? embedded._id ?? item.supplyId);
        map.set(id, {
          id,
          name: embedded.name ?? embedded.productName ?? `المادة ${id}`,
          sku: embedded.sku ?? embedded.code ?? '',
          baseUnit: embedded.baseUnit ?? embedded.unit ?? 'pcs',
        });
      }
      const nameFromItem = (item as any).supplyName;
      if (nameFromItem) {
        const id = Number(item.supplyId);
        if (!map.has(id)) {
          map.set(id, {
            id,
            name: nameFromItem,
            sku: (item as any).supplySku || '',
            baseUnit: (item as any).supplyUnit || 'pcs',
          });
        }
      }
    });
    return map;
  }, [dropdownSupplies, inventory]);

  const filteredInventory = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    return inventory.filter((item) => {
      const supplyInfo = supplyLookup.get(Number(item.supplyId));
      if (!supplyInfo) return false;
      const branchMatch = selectedBranchId ? Number(item.branchId) === Number(selectedBranchId) : true;
      if (!branchMatch) return false;
      if (!term) return true;
      return (
        supplyInfo.name.toLowerCase().includes(term) ||
        supplyInfo.sku.toLowerCase().includes(term)
      );
    });
  }, [inventory, supplyLookup, selectedBranchId, filterText]);

  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    return user.permissions.includes(`supplies:${permission}`);
  };

  const normalizeBaseItem = (item: SupplyInventory) => ({
    supplyId: Number(item.supplyId),
    branchId: Number(item.branchId),
    quantity: Number(item.quantity) || 0,
    minStock: item.minStock != null ? Number(item.minStock) : undefined,
    reorderPoint: item.reorderPoint != null ? Number(item.reorderPoint) : undefined,
    lastMovementDate: item.lastMovementDate,
  });

  const handleSaveItem = (item: SupplyInventory) => {
    const payload = normalizeBaseItem(item) as SupplyInventory;
    dispatch(createSupplyInventoryItem(payload) as any)
      .unwrap?.()
      .then(() => {
        addToast('تمت إضافة المادة للمخزون', 'success');
        setIsItemModalOpen(false);
        setEditInitial(null);
        dispatch(fetchSupplyInventory() as any);
      })
      .catch(() => addToast('فشل إضافة المادة', 'error'));
  };

  const handleUpdateItem = (item: SupplyInventory) => {
    const id = (item as any).id ?? (item as any)._id ?? (editInitial as any)?.id ?? (editInitial as any)?._id;
    if (!id) return;
    const payload = { ...normalizeBaseItem(item), id: Number(id) } as SupplyInventory;
    dispatch(updateSupplyInventoryItem({ id, data: payload }) as any)
      .unwrap?.()
      .then(() => {
        addToast('تم تحديث المادة', 'success');
        setIsItemModalOpen(false);
        setEditInitial(null);
        dispatch(fetchSupplyInventory() as any);
      })
      .catch(() => addToast('فشل تحديث المادة', 'error'));
  };

  const handleDeleteItem = (id: string | number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل من المخزون؟')) return;
    dispatch(deleteSupplyInventoryItem(id) as any)
      .unwrap?.()
      .then(() => {
        addToast('تم الحذف بنجاح', 'success');
        dispatch(fetchSupplyInventory() as any);
      })
      .catch(() => addToast('فشل الحذف', 'error'));
  };

  const getBranchName = (id: number | string) => {
    const branch = BRANCHES.find((b) => String(b.id) === String(id));
    return branch ? branch.name : 'غير معروف';
  };

  const isClient = typeof window !== 'undefined';
  const isMobile = isClient ? window.innerWidth < 768 : false;

  return (
    <div className="glass-pane" style={{ padding: '1rem 1.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontWeight: 600,
          }}
        >
          مخزون سلسلة التوريد
        </h3>
        {hasPermission('create') && (
          <button
            onClick={() => {
              setEditInitial(null);
              setIsItemModalOpen(true);
            }}
            className="btn btn-primary"
            style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              padding: isMobile ? '0.5rem 0.75rem' : undefined,
            }}
          >
            <PlusIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
            اضافة مادة للمخزون
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
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
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          />
        </div>
        <select
          value={selectedBranchId ?? ''}
          onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #e5e7eb',
            minWidth: isMobile ? '100%' : '200px',
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          <option value="">جميع الفروع</option>
          {BRANCHES.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setFilterText('');
            setSelectedBranchId(null);
          }}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '0.875rem' : '1rem',
            padding: isMobile ? '0.5rem' : undefined,
          }}
        >
          <RefreshIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
          {isMobile ? 'إعادة' : 'إعادة تعيين'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', color: '#ef4444', fontWeight: 500 }}>{error}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', fontWeight: 600 }}>جاري التحميل...</div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: isMobile ? '700px' : '100%' }}>
            <thead>
              <tr>
                <th>المادة</th>
                {!isMobile && <th>الرمز التعريفي</th>}
                <th>الفرع</th>
                <th>الكمية</th>
                {!isMobile && <th>الحد الأدنى</th>}
                {!isMobile && <th>نقطة إعادة الطلب</th>}
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length ? (
                filteredInventory.map((item) => {
                  const supplyInfo = supplyLookup.get(Number(item.supplyId));
                  if (!supplyInfo) return null;
                  let statusText = 'طبيعي';
                  let statusColor = '#10b981';
                  if (item.minStock != null && item.quantity <= item.minStock) {
                    statusText = 'منخفض';
                    statusColor = '#ef4444';
                  } else if (item.reorderPoint && item.quantity <= item.reorderPoint) {
                    statusText = 'إعادة طلب';
                    statusColor = '#f59e0b';
                  }
                  const key = String((item as any).id ?? `${item.supplyId}-${item.branchId}`);
                  return (
                    <tr key={key}>
                      <td>{supplyInfo.name}</td>
                      {!isMobile && <td>{supplyInfo.sku || '-'}</td>}
                      <td>{getBranchName(item.branchId)}</td>
                      <td>
                        {item.quantity} {supplyInfo.baseUnit}
                      </td>
                      {!isMobile && <td>{item.minStock != null ? item.minStock : '-'}</td>}
                      {!isMobile && <td>{item.reorderPoint != null ? item.reorderPoint : '-'}</td>}
                      <td>
                        <div
                          style={{
                            color: statusColor,
                            backgroundColor: `${statusColor}20`,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            display: 'inline-block',
                            fontWeight: 500,
                          }}
                        >
                          {statusText}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {hasPermission('update') && (
                            <button
                              onClick={() => {
                                setEditInitial({ ...item });
                                setIsItemModalOpen(true);
                              }}
                              className="btn btn-ghost"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              تعديل
                            </button>
                          )}
                          {hasPermission('delete') && (
                            <button
                              onClick={() =>
                                handleDeleteItem(
                                  String((item as any).id ?? `${item.supplyId}-${item.branchId}`)
                                )
                              }
                              className="btn btn-ghost"
                              style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isMobile ? 5 : 8} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    لا توجد بيانات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isItemModalOpen && (
        <SupplyInventoryItemModal
          supplies={dropdownSupplies}
          initial={editInitial || undefined}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditInitial(null);
          }}
          onSave={(data) => {
            const payload = { ...(data as any) } as SupplyInventory;
            if (editInitial) {
              handleUpdateItem({
                ...payload,
                id: (editInitial as any)?.id ?? (editInitial as any)?._id,
              });
            } else {
              handleSaveItem(payload);
            }
          }}
        />
      )}
    </div>
  );
};

export default SupplyInventoryPage;
