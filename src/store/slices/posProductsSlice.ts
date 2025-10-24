import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface POSProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  baseUnit: 'pcs' | 'g' | 'ml';
  hasExpiryDate?: boolean;
  trackInventory?: boolean;
  alertQuantity?: number;
  status?: 'Active' | 'Inactive';
  image?: string;
  brand?: string;
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface State {
  items: POSProduct[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  lookupResult: POSProduct | null;
}

const initialState: State = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
  lookupResult: null,
};

export const posSearchProducts = createAsyncThunk(
  'pos/search',
  async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const qp = new URLSearchParams();
    if (params.q) qp.append('q', params.q);
    if (params.status) qp.append('status', params.status);
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE_URL}/products/pos/search?${qp.toString()}`);
    if (!res.ok) throw new Error('Failed to search products');
    const json = await res.json();
    return { data: json.data as POSProduct[], pagination: json.pagination as Pagination };
  }
);

export const posLookupProduct = createAsyncThunk(
  'pos/lookup',
  async (params: { sku?: string; barcode?: string }) => {
    const qp = new URLSearchParams();
    if (params.sku) qp.append('sku', params.sku);
    if (params.barcode) qp.append('barcode', params.barcode);
    const res = await fetch(`${API_BASE_URL}/products/pos/lookup?${qp.toString()}`);
    if (res.status === 404) return { data: null as POSProduct | null };
    if (!res.ok) throw new Error('Failed to lookup product');
    const json = await res.json();
    return { data: json.data as POSProduct };
  }
);

const slice = createSlice({
  name: 'posProducts',
  initialState,
  reducers: {
    clearPosLookup(state) { state.lookupResult = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(posSearchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(posSearchProducts.fulfilled, (s, a: PayloadAction<{ data: POSProduct[]; pagination: Pagination }>) => {
        s.loading = false;
        s.items = a.payload.data;
        s.pagination = a.payload.pagination;
      })
      .addCase(posSearchProducts.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Search failed'; })
      .addCase(posLookupProduct.fulfilled, (s, a: PayloadAction<{ data: POSProduct | null }>) => {
        s.lookupResult = a.payload.data;
      });
  }
});

export const { clearPosLookup } = slice.actions;
export default slice.reducer;
