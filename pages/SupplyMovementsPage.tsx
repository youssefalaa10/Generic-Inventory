import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { FilterIcon, PlusIcon, RefreshIcon } from '../components/Icon';
import SupplyMovementModal from '../components/SupplyMovementModal';
import { useToasts } from '../components/Toast';
import { BRANCHES, SUPPLIES, SUPPLY_MOVEMENTS } from '../services/mockData';
import { setSupplies } from '../src/store/slices/suppliesSlice';
import { addMovement, setMovements } from '../src/store/slices/supplyInventorySlice';
import { Supply, SupplyMovement } from '../types';

interface SupplyMovementsPageProps {
  activeView?: string;
  setActiveView?: (view: string) => void;
}

const SupplyMovementsPage: React.FC<SupplyMovementsPageProps> = ({ activeView, setActiveView }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  
  const supplies = useSelector((state: any) => state.supplies.items);
  const movements = useSelector((state: any) => state.supplyInventory.movements);
  
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  
  useEffect(() => {
    dispatch(setSupplies(SUPPLIES));
    dispatch(setMovements(SUPPLY_MOVEMENTS));
  }, [dispatch]);
  
  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    return user.permissions.includes(`supplies:${permission}`);
  };
  
  const filteredMovements = movements.filter((movement: SupplyMovement) => {
    const supply = supplies.find((s: Supply) => s.id === movement.supplyId);
    if (!supply) return false;
    
    const branchMatch = selectedBranchId ? movement.branchId === selectedBranchId : true;
    const textMatch = supply.name.toLowerCase().includes(filterText.toLowerCase()) || 
                     supply.sku.toLowerCase().includes(filterText.toLowerCase());
    
    return branchMatch && textMatch;
  });
  
  const handleSaveMovement = (movement: SupplyMovement) => {
    const newMovement = {
      ...movement,
      id: Math.max(0, ...movements.map((m: SupplyMovement) => m.id)) + 1,
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
        <h3 style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem', fontWeight: 600 }}>حركات مخزون سلسلة التوريد</h3>
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
              {window.innerWidth >= 768 && <th>المعرف</th>}
              <th>التاريخ</th>
              <th>المادة</th>
              {window.innerWidth >= 768 && <th>الفرع</th>}
              <th>النوع</th>
              <th>الكمية</th>
              {window.innerWidth >= 768 && <th>المرجع</th>}
              {window.innerWidth >= 768 && <th>ملاحظات</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((movement: SupplyMovement) => {
              const supply = supplies.find((s: Supply) => s.id === movement.supplyId);
              if (!supply) return null;
              
              let typeText = '';
              let typeColor = '';
              
              switch (movement.type) {
                case 'IN':
                  typeText = 'وارد';
                  typeColor = '#10b981';
                  break;
                case 'OUT':
                  typeText = 'صادر';
                  typeColor = '#ef4444';
                  break;
                case 'TRANSFER':
                  typeText = 'تحويل';
                  typeColor = '#3b82f6';
                  break;
                case 'ADJUSTMENT':
                  typeText = 'تعديل';
                  typeColor = '#f59e0b';
                  break;
              }
              
              let referenceText = '-';
              if (movement.referenceType && movement.referenceId) {
                switch (movement.referenceType) {
                  case 'PURCHASE':
                    referenceText = `مشتريات #${movement.referenceId}`;
                    break;
                  case 'PRODUCTION':
                    referenceText = `إنتاج #${movement.referenceId}`;
                    break;
                  case 'INVENTORY_ADJUSTMENT':
                    referenceText = `تعديل مخزون #${movement.referenceId}`;
                    break;
                  case 'TRANSFER':
                    referenceText = `تحويل #${movement.referenceId}`;
                    break;
                }
              }
              
              return (
                <tr key={movement.id}>
                  {window.innerWidth >= 768 && <td>{movement.id}</td>}
                  <td>{movement.date}</td>
                  <td>{getSupplyName(movement.supplyId)}</td>
                  {window.innerWidth >= 768 && <td>{getBranchName(movement.branchId)}</td>}
                  <td>
                    <span style={{ 
                      color: typeColor, 
                      backgroundColor: `${typeColor}20`, 
                      padding: window.innerWidth < 768 ? '0.25rem' : '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontWeight: 500,
                      fontSize: window.innerWidth < 768 ? '0.75rem' : '1rem'
                    }}>
                      {typeText}
                    </span>
                  </td>
                  <td>{movement.quantity} {supply.baseUnit}</td>
                  {window.innerWidth >= 768 && <td>{referenceText}</td>}
                  {window.innerWidth >= 768 && <td>{movement.notes || '-'}</td>}
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

export default SupplyMovementsPage;

