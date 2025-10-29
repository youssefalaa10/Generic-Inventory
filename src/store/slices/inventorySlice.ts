import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

// Local type aligned with backend InventoryItem model
export interface InvItem {
  id: string;
  name?: string;
  productName?: string;
  sku?: string;
  gtin?: string;
  batchNumber?: string;
  serialNumber?: string;
  quantity?: number;
  unit?: string;
  manufacturer?: string;
  originCountry?: string;
  manufactureDate?: string;
  expiryDate?: string;
  currentStatus?: string;
  transportMode?: string;
  type?: 'packaging' | 'supplies' | 'fixtures' | 'maintenance' | 'security' | 'marketing';
  currentStock?: number;
  minimumStock?: number;
  costPerUnit?: number;
  location?: string;
  barcode?: string;
  locked?: boolean;
  category?: string;
  supplier?: string;
  description?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  __v?: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface InventoryState {
  items: InvItem[];
  currentItem: InvItem | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: InventoryState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params: { page?: number; limit?: number; search?: string; type?: string; lowStock?: boolean; locked?: boolean } = {}) => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));
    if (params.search) qp.append('search', params.search);
    if (params.type) qp.append('type', params.type);
    if (typeof params.lowStock === 'boolean') qp.append('lowStock', String(params.lowStock));
    if (typeof params.locked === 'boolean') qp.append('locked', String(params.locked));

    const res = await fetch(`${API_BASE_URL}/inventory?${qp.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    const json = await res.json();
    const rawData = Array.isArray(json.data) ? json.data : [];
    const mapped = rawData.map((d: any) => {
      const { _id, id: altId, ...rest } = d;
      const resolvedId = _id ?? altId;
      return { ...rest, id: resolvedId ? String(resolvedId) : '' } as InvItem;
    });
    const data = mapped.filter((item) => item.id);
    const pagination = json.pagination ?? null;
    return { data, pagination };
  }
);

export const fetchInventoryById = createAsyncThunk('inventory/fetchById', async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/inventory/${id}`);
  if (!res.ok) throw new Error('Failed to fetch item');
  const json = await res.json();
  const source = json.data ?? {};
  const { _id, id: altId, ...rest } = source;
  const resolvedId = _id ?? altId ?? id;
  const item: InvItem = { ...rest, id: resolvedId ? String(resolvedId) : '' };
  return item;
});

export const createInventoryItem = createAsyncThunk('inventory/create', async (payload: Partial<InvItem>) => {
  const { id, ...body } = payload as any;
  const res = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create item');
  const json = await res.json();
  const source = json.data ?? {};
  const { _id, id: altId, ...rest } = source;
  const resolvedId = _id ?? altId;
  const item: InvItem = { ...rest, id: resolvedId ? String(resolvedId) : '' };
  return item;
});

export const updateInventoryItem = createAsyncThunk(
  'inventory/update',
  async ({ id, data }: { id: string; data: Partial<InvItem> }) => {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update item');
    const json = await res.json();
    const source = json.data ?? {};
    const { _id, id: altId, ...rest } = source;
    const resolvedId = _id ?? altId ?? id;
    const item: InvItem = { ...rest, id: resolvedId ? String(resolvedId) : '' };
    return item;
  }
);

export const deleteInventoryItem = createAsyncThunk('inventory/delete', async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/inventory/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete item');
  return { id };
});

const slice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action: PayloadAction<{ data: InvItem[]; pagination: Pagination | null }>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(fetchInventoryById.fulfilled, (state, action: PayloadAction<InvItem>) => {
        state.currentItem = action.payload;
      })
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action: PayloadAction<InvItem>) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create item';
      })
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action: PayloadAction<InvItem>) => {
        state.loading = false;
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update item';
      })
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
        state.loading = false;
        state.items = state.items.filter((i) => i.id !== action.payload.id);
        if (state.currentItem?.id === action.payload.id) state.currentItem = null;
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete item';
      });
  },
});

export const { clearInventoryError } = slice.actions;
export default slice.reducer;
