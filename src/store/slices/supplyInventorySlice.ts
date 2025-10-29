import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { SupplyInventory, SupplyMovement } from '../../../types';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface SupplyInventoryState {
  items: SupplyInventory[];
  movements: SupplyMovement[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplyInventoryState = {
  items: [],
  movements: [],
  loading: false,
  error: null,
};

// Helpers to map API <-> app shape
const toApiFormat = (item: SupplyInventory) => ({
  id: (item as any).id,
  supplyId: item.supplyId,
  branchId: item.branchId,
  quantity: item.quantity,
  minStock: item.minStock,
  reorderPoint: item.reorderPoint,
  lastMovementDate: item.lastMovementDate,
});

const fromApiFormat = (item: any): SupplyInventory => ({
  id: item.id ?? item._id,
  supplyId: Number(item.supplyId),
  branchId: Number(item.branchId),
  quantity: Number(item.quantity) || 0,
  minStock: item.minStock != null ? Number(item.minStock) : undefined,
  reorderPoint: item.reorderPoint != null ? Number(item.reorderPoint) : undefined,
  lastMovementDate: item.lastMovementDate,
});

// Thunks
export const fetchSupplyInventory = createAsyncThunk(
  'supplyInventory/fetchAll',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_INVENTORY}`);
      const text = await res.text();
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${text}`);
      const data = text ? JSON.parse(text) : [];
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : data;
      if (!Array.isArray(items)) throw new Error('Invalid payload');
      return (items as any[]).map(fromApiFormat);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  }
);

export const createSupplyInventoryItem = createAsyncThunk(
  'supplyInventory/create',
  async (item: SupplyInventory, { rejectWithValue }) => {
    try {
      const payload = toApiFormat(item);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_INVENTORY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Failed to create: ${res.status} ${text}`);
      const data = text ? JSON.parse(text) : {};
      const created = (data?.data ?? data) as any;
      return fromApiFormat(created);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  }
);

export const updateSupplyInventoryItem = createAsyncThunk(
  'supplyInventory/update',
  async ({ id, data }: { id: string | number; data: SupplyInventory }, { rejectWithValue }) => {
    try {
      const payload = toApiFormat(data);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_INVENTORY}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Failed to update: ${res.status} ${text}`);
      const resp = text ? JSON.parse(text) : {};
      const updated = (resp?.data ?? resp) as any;
      return fromApiFormat(updated);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  }
);

export const deleteSupplyInventoryItem = createAsyncThunk(
  'supplyInventory/delete',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_INVENTORY}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  }
);

export const supplyInventorySlice = createSlice({
  name: 'supplyInventory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInventoryItems: (state, action: PayloadAction<SupplyInventory[]>) => {
      state.items = action.payload;
    },
    setMovements: (state, action: PayloadAction<SupplyMovement[]>) => {
      state.movements = action.payload;
    },
    addMovement: (state, action: PayloadAction<SupplyMovement>) => {
      state.movements.push(action.payload);
      
      // Update inventory based on movement type
      const { supplyId, branchId, type, quantity } = action.payload;
      const inventoryIndex = state.items.findIndex(
        item => item.supplyId === supplyId && item.branchId === branchId
      );
      
      if (inventoryIndex === -1) {
        // Create new inventory item if it doesn't exist
        state.items.push({
          supplyId,
          branchId,
          quantity: type === 'IN' ? quantity : -quantity,
          lastMovementDate: action.payload.date
        });
      } else {
        // Update existing inventory
        const currentQuantity = state.items[inventoryIndex].quantity || 0;
        if (type === 'IN') {
          state.items[inventoryIndex].quantity = currentQuantity + quantity;
        } else if (type === 'OUT') {
          state.items[inventoryIndex].quantity = Math.max(0, currentQuantity - quantity);
        }
        state.items[inventoryIndex].lastMovementDate = action.payload.date;
      }
    },
    updateInventoryItem: (state, action: PayloadAction<SupplyInventory>) => {
      const index = state.items.findIndex(
        item => item.supplyId === action.payload.supplyId && item.branchId === action.payload.branchId
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteMovement: (state, action: PayloadAction<number>) => {
      state.movements = state.movements.filter(movement => movement.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplyInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyInventory.fulfilled, (state, action: PayloadAction<SupplyInventory[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSupplyInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch';
      })
      .addCase(createSupplyInventoryItem.fulfilled, (state, action: PayloadAction<SupplyInventory>) => {
        state.items.push(action.payload);
      })
      .addCase(updateSupplyInventoryItem.fulfilled, (state, action: PayloadAction<SupplyInventory>) => {
        const idx = state.items.findIndex(i => String((i as any).id) === String((action.payload as any).id));
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteSupplyInventoryItem.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.items = state.items.filter(i => String((i as any).id) !== String(action.payload));
      });
  }
});

export const { 
  setLoading, 
  setError, 
  setInventoryItems, 
  setMovements,
  addMovement,
  updateInventoryItem,
  deleteMovement
} = supplyInventorySlice.actions;

export default supplyInventorySlice.reducer;

