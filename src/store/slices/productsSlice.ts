import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';
import { Product } from '../../../types';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = { items: [], loading: false, error: null };

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
});

export const createProduct = createAsyncThunk('products/create', async (data: Partial<Product>) => {
  const res = await fetch(`${API_BASE_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }: { id: string | number; data: Partial<Product> }) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
});

export const deleteProduct = createAsyncThunk('products/delete', async (id: string | number) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
  return { id };
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a: PayloadAction<any>) => { s.loading = false; s.items = a.payload.data || a.payload || []; })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to fetch products'; })
      .addCase(createProduct.fulfilled, (s, a: PayloadAction<any>) => { const created = a.payload?.data; if (created) s.items.unshift(created); })
      .addCase(updateProduct.fulfilled, (s, a: PayloadAction<any>) => { const updated = a.payload?.data; if (!updated) return; const id = (updated as any).id ?? (updated as any)._id; const idx = s.items.findIndex(p => (p as any).id === id || (p as any)._id === id); if (idx !== -1) s.items[idx] = updated; })
      .addCase(deleteProduct.fulfilled, (s, a: PayloadAction<{ id: string | number }>) => { s.items = s.items.filter(p => String((p as any).id ?? (p as any)._id) !== String(a.payload.id)); });
  }
});

export default productsSlice.reducer;
