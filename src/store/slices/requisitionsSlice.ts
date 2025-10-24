import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface InventoryRequisitionItem { productId: number; quantity: number; }
export interface InventoryRequisition {
  _id?: string;
  id?: string;
  code?: string;
  date: string;
  branchId?: string;
  branchName?: string;
  type: 'Purchase' | 'Transfer';
  items: InventoryRequisitionItem[];
  notes?: string;
  attachments?: any[];
  status?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
}

interface RequisitionState {
  items: InventoryRequisition[];
  loading: boolean;
  error: string | null;
}

const initialState: RequisitionState = { items: [], loading: false, error: null };

export const fetchRequisitions = createAsyncThunk('requisitions/fetchAll', async () => {
  const res = await fetch(`${API_BASE_URL}/requisitions`);
  if (!res.ok) throw new Error('Failed to fetch requisitions');
  return res.json();
});

export const createRequisition = createAsyncThunk('requisitions/create', async (data: Partial<InventoryRequisition>) => {
  const res = await fetch(`${API_BASE_URL}/requisitions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create requisition');
  return res.json();
});

export const updateRequisition = createAsyncThunk('requisitions/update', async ({ id, data }: { id: string; data: Partial<InventoryRequisition> }) => {
  const res = await fetch(`${API_BASE_URL}/requisitions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update requisition');
  return res.json();
});

export const deleteRequisition = createAsyncThunk('requisitions/delete', async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/requisitions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete requisition');
  return { id };
});

const requisitionsSlice = createSlice({
  name: 'requisitions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequisitions.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchRequisitions.fulfilled, (s, a: PayloadAction<any>) => { s.loading = false; s.items = a.payload.data || a.payload || []; })
      .addCase(fetchRequisitions.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to fetch requisitions'; })
      .addCase(createRequisition.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createRequisition.fulfilled, (s, a: PayloadAction<any>) => { s.loading = false; if (a.payload?.data) s.items.unshift(a.payload.data); })
      .addCase(createRequisition.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to create requisition'; })
      .addCase(updateRequisition.fulfilled, (s, a: PayloadAction<any>) => {
        const updated = a.payload?.data; if (!updated) return; const id = updated.id || updated._id; const idx = s.items.findIndex(r => (r.id || r._id) === id); if (idx !== -1) s.items[idx] = updated;
      })
      .addCase(deleteRequisition.fulfilled, (s, a: PayloadAction<{ id: string }>) => {
        s.items = s.items.filter(r => (r.id || r._id) !== a.payload.id);
      });
  }
});

export default requisitionsSlice.reducer;
