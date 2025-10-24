import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../../types';
import { API_BASE_URL } from '../../config/api';

type Pagination = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} | null;

type FetchParams = { q?: string; projectId?: number; page?: number; limit?: number };

interface CustomersState {
  items: Customer[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  params: { q?: string; projectId?: number; page: number; limit: number };
}

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
  params: { page: 1, limit: 20 },
};

export const fetchCustomers = createAsyncThunk('customers/fetchAll', async (params: FetchParams = {}) => {
  const url = new URL(`${API_BASE_URL}/customers`);
  if (params.q) url.searchParams.set('q', params.q);
  if (params.projectId) url.searchParams.set('projectId', String(params.projectId));
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
});

export const createCustomer = createAsyncThunk('customers/create', async (data: Partial<Customer>) => {
  const res = await fetch(`${API_BASE_URL}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
});

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }: { id: string | number; data: Partial<Customer> }) => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json();
});

export const deleteCustomer = createAsyncThunk('customers/delete', async (id: string | number) => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete customer');
  return { id };
});

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<CustomersState['params']>>) {
      state.params = { ...state.params, ...action.payload };
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCustomers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCustomers.fulfilled, (s, a: PayloadAction<any>) => {
        s.loading = false;
        s.items = a.payload.data || a.payload || [];
        s.pagination = a.payload.pagination || null;
      })
      .addCase(fetchCustomers.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to fetch customers'; })
      .addCase(createCustomer.fulfilled, (s, a: PayloadAction<any>) => { const created = a.payload?.data; if (created) s.items.unshift(created); })
      .addCase(updateCustomer.fulfilled, (s, a: PayloadAction<any>) => {
        const updated = a.payload?.data; if (!updated) return;
        const id = (updated as any).id ?? (updated as any)._id;
        const idx = s.items.findIndex(p => String((p as any).id ?? (p as any)._id) === String(id));
        if (idx !== -1) s.items[idx] = updated;
      })
      .addCase(deleteCustomer.fulfilled, (s, a: PayloadAction<{ id: string | number }>) => {
        s.items = s.items.filter(p => String((p as any).id ?? (p as any)._id) !== String(a.payload.id));
      });
  }
});

export const { setParams } = customersSlice.actions;
export default customersSlice.reducer;


