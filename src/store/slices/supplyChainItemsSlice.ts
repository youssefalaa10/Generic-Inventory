import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { SupplyChainItem } from '../../../types';

type Pagination = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} | null;

interface SupplyChainItemsState {
  items: SupplyChainItem[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

const initialState: SupplyChainItemsState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
};

// Helper function to convert SupplyChainItem to API format (productName -> name)
const toApiFormat = (item: any) => {
  const { productName, id, ...rest } = item;
  const numericId = typeof id === 'number' && Number.isFinite(id) && id > 0 ? id : Date.now();
  return {
    ...rest,
    id: numericId,
    productName,
    name: productName,
  };
};

// Helper function to convert API response to SupplyChainItem format (name -> productName)
const fromApiFormat = (item: any): SupplyChainItem => {
  const { name, productName, ...rest } = item;
  return {
    ...rest,
    productName: productName ?? name ?? '',
  };
};

// Thunks
export const fetchSupplyChainItems = createAsyncThunk(
  'supplyChainItems/fetchAll',
  async (params: { page?: number; limit?: number; q?: string } | undefined, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.q) searchParams.set('q', params.q);
      const url = `${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAIN}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      console.log('Fetching supply chain items from:', url);
      const res = await fetch(url);
      const responseText = await res.text();
      console.log('Supply chain fetch response:', res.status, responseText);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      let data: any;
      try {
        data = responseText ? JSON.parse(responseText) : [];
      } catch (parseErr) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      if (Array.isArray(data)) {
        return { items: data.map(fromApiFormat) as SupplyChainItem[], pagination: null };
      }
      const rawItems = (Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : data) as any;
      if (!Array.isArray(rawItems)) {
        throw new Error('Invalid items payload');
      }
      return { items: rawItems.map(fromApiFormat) as SupplyChainItem[], pagination: data.pagination || null };
    } catch (err: any) {
      console.error('Error fetching supply chain items:', err);
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const createSupplyChainItem = createAsyncThunk(
  'supplyChainItems/create',
  async (item: Omit<SupplyChainItem, 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const payload = toApiFormat(item);
      console.log('Creating supply chain item with payload:', payload);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const responseText = await res.text();
      console.log('API Response:', responseText);
      
      if (!res.ok) throw new Error(`Failed to create: ${res.status} - ${responseText}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      // Handle different response formats
      const created = data?.data || data;
      if (!created) throw new Error('No data returned from API');
      
      // Convert API response back to frontend format
      return fromApiFormat(created);
    } catch (err: any) {
      console.error('Error creating supply chain item:', err);
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const updateSupplyChainItem = createAsyncThunk(
  'supplyChainItems/update',
  async (item: SupplyChainItem, { rejectWithValue }) => {
    try {
      const payload = toApiFormat(item);
      const identifier = (item as any)._id ? (item as any)._id : item.id;
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAIN}/${identifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
      const data = await res.json();
      const updated = (data?.data ?? data) as any;
      return fromApiFormat(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const deleteSupplyChainItem = createAsyncThunk(
  'supplyChainItems/delete',
  async (id: number | { id?: number; _id?: string }, { rejectWithValue }) => {
    try {
      const identifier = typeof id === 'object' && id !== null && (id as any)._id
        ? (id as any)._id
        : (typeof id === 'number' || typeof id === 'string' ? id : (id as any)?.id);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUPPLY_CHAIN}/${identifier}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      return typeof id === 'object' && id !== null ? (id as any)?.id : id as any;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const supplyChainItemsSlice = createSlice({
  name: 'supplyChainItems',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<SupplyChainItem[]>) {
      state.items = action.payload;
    },
    importItems(state, action: PayloadAction<SupplyChainItem[]>) {
      // Merge by SKU + batchNumber + serialNumber to avoid duplicates
      const key = (i: SupplyChainItem) => `${i.sku || ''}|${i.batchNumber || ''}|${i.serialNumber || ''}`;
      const existingKeys = new Set(state.items.map(key));
      const newItems = action.payload.filter((i) => !existingKeys.has(key(i)));
      state.items = [...state.items, ...newItems];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplyChainItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyChainItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSupplyChainItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplyChainItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSupplyChainItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteSupplyChainItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { setItems, importItems } = supplyChainItemsSlice.actions;
export default supplyChainItemsSlice.reducer;
