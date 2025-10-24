import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface BranchInvItem {
  id: string;
  branchId: number;
  productId: number;
  quantity: number;
  minStock: number;
  lotNumber?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface BranchInventoryState {
  items: BranchInvItem[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: BranchInventoryState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchBranchInventory = createAsyncThunk(
  'branchInventory/fetch',
  async (params: { branchId?: number; productId?: number; page?: number; limit?: number } = {}) => {
    const qp = new URLSearchParams();
    if (params.branchId) qp.append('branchId', String(params.branchId));
    if (params.productId) qp.append('productId', String(params.productId));
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE_URL}/branch-inventory?${qp.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch branch inventory');
    const json = await res.json();
    const data: BranchInvItem[] = json.data.map((d: any) => ({ id: d._id, ...d }));
    return { data, pagination: json.pagination as Pagination };
  }
);

export const createBranchInvItem = createAsyncThunk(
  'branchInventory/create',
  async (payload: Omit<BranchInvItem, 'id'>) => {
    const { id, ...body } = payload as any;
    const res = await fetch(`${API_BASE_URL}/branch-inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || 'Failed to create branch inventory record');
    }
    const json = await res.json();
    const item: BranchInvItem = { id: json.data._id, ...json.data };
    return item;
  }
);

export const updateBranchInvItem = createAsyncThunk(
  'branchInventory/update',
  async (payload: { branchId: number; productId: number; lotNumber?: string; data: Partial<BranchInvItem> }) => {
    const body: any = { branchId: payload.branchId, productId: payload.productId, lotNumber: payload.lotNumber, ...payload.data };
    const res = await fetch(`${API_BASE_URL}/branch-inventory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update branch inventory record');
    const json = await res.json();
    const item: BranchInvItem = { id: json.data._id, ...json.data };
    return item;
  }
);

export const deleteBranchInvItem = createAsyncThunk(
  'branchInventory/delete',
  async (payload: { branchId: number; productId: number; lotNumber?: string }) => {
    const res = await fetch(`${API_BASE_URL}/branch-inventory`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to delete branch inventory record');
    return payload;
  }
);

const slice = createSlice({
  name: 'branchInventory',
  initialState,
  reducers: {
    clearBranchInventoryError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBranchInventory.fulfilled, (state, action: PayloadAction<{ data: BranchInvItem[]; pagination: Pagination }>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBranchInventory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch branch inventory'; })

      .addCase(createBranchInvItem.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBranchInvItem.fulfilled, (state, action: PayloadAction<BranchInvItem>) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createBranchInvItem.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to create branch inventory record'; })

      .addCase(updateBranchInvItem.fulfilled, (state, action: PayloadAction<BranchInvItem>) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

      .addCase(deleteBranchInvItem.fulfilled, (state, action: PayloadAction<{ branchId: number; productId: number; lotNumber?: string }>) => {
        // We don't have id; refetching list is safer but we'll filter by keys if needed
        // For now, trigger a reload in the component after dispatch
      });
  }
});

export const { clearBranchInventoryError } = slice.actions;
export default slice.reducer;
