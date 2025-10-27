import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../App';
import { FilterIcon, PencilIcon, PlusIcon, RefreshIcon, TrashIcon } from '../components/Icon';
import SupplyModal from '../components/SupplyModal';
import { useToasts } from '../components/Toast';
import { MOCK_SUPPLIERS, SUPPLIES } from '../services/mockData';
import { addSupply, deleteSupply, setSupplies, updateSupply } from '../src/store/slices/suppliesSlice';
import { Supply } from '../types';

interface SupplyChainPageProps {
  activeView?: string;
  setActiveView?: (view: string) => void;
}

const SupplyChainPage: React.FC<SupplyChainPageProps> = ({ activeView, setActiveView }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const supplies = useSelector((state: any) => state.supplies.items);
  
  // Local state
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [filterText, setFilterText] = useState('');
  
  // Initialize data from mock data
  useEffect(() => {
    dispatch(setSupplies(SUPPLIES));
  }, [dispatch]);
  
  // Check permissions
  const hasPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    return user.permissions.includes(`supplies:${permission}`);
  };
  
  // Filter supplies based on search text
  const filteredSupplies = supplies.filter((supply: Supply) => 
    supply.name.toLowerCase().includes(filterText.toLowerCase()) || 
    supply.sku.toLowerCase().includes(filterText.toLowerCase()) ||
    supply.category.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Handle adding a new supply
  const handleAddSupply = () => {
    setSelectedSupply(null);
    setIsSupplyModalOpen(true);
  };
  
  // Handle editing a supply
  const handleEditSupply = (supply: Supply) => {
    setSelectedSupply(supply);
    setIsSupplyModalOpen(true);
  };
  
  // Handle deleting a supply
  const handleDeleteSupply = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      dispatch(deleteSupply(id));
      addToast('تم حذف المادة بنجاح', 'success');
    }
  };
  
  // Handle saving a supply
  const handleSaveSupply = (supply: Supply) => {
    if (supply.id < 0) {
      // New supply
      const newSupply = {
        ...supply,
        id: Math.max(0, ...supplies.map((s: Supply) => s.id)) + 1
      };
      dispatch(addSupply(newSupply));
      addToast('تمت إضافة المادة بنجاح', 'success');
    } else {
      // Update existing supply
      dispatch(updateSupply(supply));
      addToast('تم تحديث المادة بنجاح', 'success');
    }
    setIsSupplyModalOpen(false);
  };
  
  // Get supplier name by ID
  const getSupplierName = (id: number) => {
    const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
    return supplier ? supplier.name : 'غير معروف';
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
        <h3 style={{ fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem', fontWeight: 600 }}>المواد</h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: window.innerWidth < 768 ? 'flex-start' : 'flex-end'
        }}>
          {hasPermission('create') && (
            <button onClick={handleAddSupply} className="btn btn-primary" style={{ fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem', padding: window.innerWidth < 768 ? '0.5rem 0.75rem' : undefined }}>
              <PlusIcon style={{ width: '16px', height: '16px', marginLeft: '0.25rem' }} />
              {window.innerWidth < 768 ? 'إضافة' : 'إضافة مادة جديدة'}
            </button>
          )}
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
      
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: window.innerWidth < 768 ? '800px' : '100%' }}>
          <thead>
            <tr>
              {window.innerWidth >= 768 && <th>المعرف</th>}
              <th>الاسم</th>
              <th>الرمز التعريفي</th>
              <th>الفئة</th>
              <th>سعر الوحدة</th>
              <th>وحدة القياس</th>
              {window.innerWidth >= 768 && <th>المورد</th>}
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupplies.map((supply: Supply) => (
              <tr key={supply.id}>
                {window.innerWidth >= 768 && <td>{supply.id}</td>}
                <td>{supply.name}</td>
                <td>{supply.sku}</td>
                <td>{supply.category}</td>
                <td>{supply.unitPrice.toFixed(2)}</td>
                <td>{supply.baseUnit}</td>
                {window.innerWidth >= 768 && <td>{getSupplierName(supply.supplierId)}</td>}
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {hasPermission('update') && (
                      <button
                        onClick={() => handleEditSupply(supply)}
                        style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <PencilIcon style={{ width: window.innerWidth < 768 ? '18px' : '20px', height: window.innerWidth < 768 ? '18px' : '20px' }} />
                      </button>
                    )}
                    {hasPermission('delete') && (
                      <button
                        onClick={() => handleDeleteSupply(supply.id)}
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
      
      {isSupplyModalOpen && (
        <SupplyModal
          supply={selectedSupply}
          onClose={() => setIsSupplyModalOpen(false)}
          onSave={handleSaveSupply}
          suppliers={MOCK_SUPPLIERS}
        />
      )}
    </div>
  );
};

export default SupplyChainPage;
