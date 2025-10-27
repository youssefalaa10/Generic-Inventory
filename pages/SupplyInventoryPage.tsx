import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { FilterIcon, PlusIcon, RefreshIcon } from '../components/Icon';
import SupplyMovementModal from '../components/SupplyMovementModal';
import { useToasts } from '../components/Toast';
import { BRANCHES, SUPPLIES, SUPPLY_INVENTORY } from '../services/mockData';
import { setSupplies } from '../src/store/slices/suppliesSlice';
import { addMovement, setInventoryItems } from '../src/store/slices/supplyInventorySlice';
import { Supply, SupplyInventory, SupplyMovement } from '../types';

interface SupplyInventoryPageProps {
  activeView?: string;
  setActiveView?: (view: string) => void;
}

const SupplyInventoryPage: React.FC<SupplyInventoryPageProps> = ({ activeView, setActiveView }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  
  const supplies = useSelector((state: any) => state.supplies.items);
  const inventory = useSelector((state: any) => state.supplyInventory.items);
  
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  
  useEffect(() => {
    dispatch(setSupplies(SUPPLIES));
    dispatch(setInventoryItems(SUPPLY_INVENTORY));
  }, [dispatch]);
  
  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    return user.permissions.includes(`supplies:${permission}`);
  };
  
  const filteredInventory = inventory.filter((item: SupplyInventory) => {
    const supply = supplies.find((s: Supply) => s.id === item.supplyId);
    if (!supply) return false;
    
    const branchMatch = selectedBranchId ? item.branchId === selectedBranchId : true;
    const textMatch = supply.name.toLowerCase().includes(filterText.toLowerCase()) || 
                     supply.sku.toLowerCase().includes(filterText.toLowerCase());
    
    return branchMatch && textMatch;
  });
  
  const handleSaveMovement = (movement: SupplyMovement) => {
    const newMovement = {
      ...movement,
      id: Math.max(0, ...(supplies.length ? supplies : [0].map((_: any) => _.id))) + 1,
      date: new Date().toISOString().split('T')[0]
    };
    dispatch(addMovement(newMovement));
    addToast('تمت إضافة الحركة بنجاح', 'success');
    setIsMovementModalOpen(false);
  };
  
  const getBranchName = (id: number | string) => {
    const branch = BRANCHES.find(b => String(b.id) === String(id));
    return branch ? branch.name : 'غير معروف';
  };
  
  const getSupplyName = (id: number) => {
    const supply = supplies.find((s: Supply) => s.id === id);
    return supply ? supply.name : 'غير معروف';
  };
  
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
        <h3 style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem', fontWeight: 600 }}>مخزون سلسلة التوريد</h3>
        {hasPermission('create') && (
          <button onClick={() => setIsMovementModalOpen(true)} className="btn btn-primary" style={{ fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem', padding: window.innerWidth < 768 ? '0.5rem 0.75rem' : undefined }}>
            <PlusIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
            إضافة حركة
          </button>
        )}
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
        
        <select
          value={selectedBranchId || ''}
          onChange={(e) => setSelectedBranchId(e.target.value ? parseInt(e.target.value) : null)}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '0.25rem', 
            border: '1px solid #e5e7eb', 
            minWidth: window.innerWidth < 768 ? '100%' : '200px',
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
          }}
        >
          <option value="">جميع الفروع</option>
          {BRANCHES.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
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
            fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem',
            padding: window.innerWidth < 768 ? '0.5rem' : undefined
          }}
        >
          <RefreshIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
          {window.innerWidth < 768 ? 'إعادة' : 'إعادة تعيين'}
        </button>
      </div>
      
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: window.innerWidth < 768 ? '700px' : '100%' }}>
          <thead>
            <tr>
              <th>المادة</th>
              {window.innerWidth >= 768 && <th>الرمز التعريفي</th>}
              <th>الفرع</th>
              <th>الكمية</th>
              {window.innerWidth >= 768 && <th>الحد الأدنى</th>}
              {window.innerWidth >= 768 && <th>نقطة إعادة الطلب</th>}
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item: SupplyInventory) => {
              const supply = supplies.find((s: Supply) => s.id === item.supplyId);
              if (!supply) return null;
              
              let status = 'normal';
              let statusText = 'طبيعي';
              let statusColor = '#10b981';
              
              if (item.quantity <= item.minStock!) {
                status = 'low';
                statusText = 'منخفض';
                statusColor = '#ef4444';
              } else if (item.reorderPoint && item.quantity <= item.reorderPoint) {
                status = 'reorder';
                statusText = 'إعادة طلب';
                statusColor = '#f59e0b';
              }
              
              return (
                <tr key={`${item.supplyId}-${item.branchId}`}>
                  <td>{supply.name}</td>
                  {window.innerWidth >= 768 && <td>{supply.sku}</td>}
                  <td>{getBranchName(item.branchId)}</td>
                  <td>{item.quantity} {supply.baseUnit}</td>
                  {window.innerWidth >= 768 && <td>{item.minStock} {supply.baseUnit}</td>}
                  {window.innerWidth >= 768 && <td>{item.reorderPoint || '-'} {item.reorderPoint ? supply.baseUnit : ''}</td>}
                  <td>
                    <span style={{ 
                      color: statusColor, 
                      backgroundColor: `${statusColor}20`, 
                      padding: window.innerWidth < 768 ? '0.25rem' : '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontWeight: 500,
                      fontSize: window.innerWidth < 768 ? '0.75rem' : '1rem'
                    }}>
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {isMovementModalOpen && (
        <SupplyMovementModal
          onClose={() => setIsMovementModalOpen(false)}
          onSave={handleSaveMovement}
          supplies={supplies}
          branches={BRANCHES}
        />
      )}
    </div>
  );
};

export default SupplyInventoryPage;

