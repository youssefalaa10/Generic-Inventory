import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface InventoryVoucherLine { productId: number; quantity: number; }
export interface InventoryVoucher {
  _id?: string;
  id?: string;
  code?: string;
  date: string;
  branchId?: string;
  branchName?: string;
  type: 'up' | 'down';
  description?: string;
  details?: string;
  createdBy?: string;
  status?: 'Draft' | 'Approved' | 'Cancelled';
  lines?: InventoryVoucherLine[];
}

interface VoucherState {
  items: InventoryVoucher[];
  loading: boolean;
  error: string | null;
}

const initialState: VoucherState = { items: [], loading: false, error: null };

export const fetchVouchers = createAsyncThunk('vouchers/fetchAll', async () => {
  const res = await fetch(`${API_BASE_URL}/vouchers`);
  if (!res.ok) throw new Error('Failed to fetch vouchers');
  return res.json();
});

export const createVoucher = createAsyncThunk('vouchers/create', async (data: Partial<InventoryVoucher>) => {
  const res = await fetch(`${API_BASE_URL}/vouchers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create voucher');
  return res.json();
});

export const updateVoucher = createAsyncThunk('vouchers/update', async ({ id, data }: { id: string; data: Partial<InventoryVoucher> }) => {
  const res = await fetch(`${API_BASE_URL}/vouchers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update voucher');
  return res.json();
});

export const deleteVoucher = createAsyncThunk('vouchers/delete', async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/vouchers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete voucher');
  return { id };
});

const vouchersSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVouchers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchVouchers.fulfilled, (s, a: PayloadAction<any>) => { s.loading = false; s.items = a.payload.data || a.payload || []; })
      .addCase(fetchVouchers.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to fetch vouchers'; })
      .addCase(createVoucher.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createVoucher.fulfilled, (s, a: PayloadAction<any>) => { s.loading = false; if (a.payload?.data) s.items.unshift(a.payload.data); })
      .addCase(createVoucher.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to create voucher'; })
      .addCase(updateVoucher.fulfilled, (s, a: PayloadAction<any>) => {
        const updated = a.payload?.data; if (!updated) return; const id = updated.id || updated._id; const idx = s.items.findIndex(v => (v.id || v._id) === id); if (idx !== -1) s.items[idx] = updated;
      })
      .addCase(deleteVoucher.fulfilled, (s, a: PayloadAction<{ id: string }>) => {
        s.items = s.items.filter(v => (v.id || v._id) !== a.payload.id);
      });
  }
});

export default vouchersSlice.reducer;
