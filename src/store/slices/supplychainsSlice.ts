import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface SupplyChainRecord {
  id: string;
  المعرف: number;
  الوقت: string;
  رمز_SKU?: string;
  رمز_GTin?: string;
  رقم_الدفعة?: string;
  الرقم_التسلسلي?: string;
  اسم_المنتج: string;
  الكمية: number;
  الوحدة?: string;
  الشركة_المصنعة?: string;
  بلد_المنشأ?: string;
  تاريخ_التصنيع?: string;
  تاريخ_الانتهاء?: string;
  الحالة_الحالية: 'مخزون' | 'مباع' | 'مفقود' | 'تالف' | 'منتهي الصلاحية' | 'في النقل' | 'مستلم';
  وسيلة_النقل?: string;
}

interface SupplyChainsState {
  items: SupplyChainRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplyChainsState = {
  items: [],
  loading: false,
  error: null
};

export const fetchSupplyChains = createAsyncThunk(
  'supplychains/fetchAll',
  async () => {
    const res = await fetch(`${API_BASE_URL}/supply-chain`);
    if (!res.ok) throw new Error('Failed to fetch supply chain records');
    return res.json();
  }
);

export const createSupplyChain = createAsyncThunk(
  'supplychains/create',
  async (data: Partial<SupplyChainRecord>) => {
    const res = await fetch(`${API_BASE_URL}/supply-chain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create supply chain record');
    return res.json();
  }
);

export const updateSupplyChain = createAsyncThunk(
  'supplychains/update',
  async ({ id, data }: { id: string; data: Partial<SupplyChainRecord> }) => {
    const res = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update supply chain record');
    return res.json();
  }
);

export const deleteSupplyChain = createAsyncThunk(
  'supplychains/delete',
  async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/supply-chain/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete supply chain record');
    return { id };
  }
);

const supplychainsSlice = createSlice({
  name: 'supplychains',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchSupplyChains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyChains.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.items = action.payload.data || action.payload || [];
      })
      .addCase(fetchSupplyChains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch supply chain records';
      })
      // Create
      .addCase(createSupplyChain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplyChain.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload?.data) {
          state.items.unshift(action.payload.data);
        }
      })
      .addCase(createSupplyChain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create supply chain record';
      })
      // Update
      .addCase(updateSupplyChain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplyChain.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const updated = action.payload?.data;
        if (!updated) return;
        const id = (updated as any).id ?? (updated as any)._id;
        const idx = state.items.findIndex(item => 
          String(item.id) === String(id) || String((item as any)._id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(updateSupplyChain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update supply chain record';
      })
      // Delete
      .addCase(deleteSupplyChain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplyChain.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
        state.loading = false;
        state.items = state.items.filter(item => 
          String(item.id) !== String(action.payload.id) && 
          String((item as any)._id) !== String(action.payload.id)
        );
      })
      .addCase(deleteSupplyChain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete supply chain record';
      });
  },
});

export default supplychainsSlice.reducer;