import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export interface MovementItem {
  _id: string;
  inventory_item_id?: { _id: string; name?: string; sku?: string; barcode?: string } | string;
  item_name?: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface MovementsState {
  items: MovementItem[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: MovementsState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchMovements = createAsyncThunk(
  'movements/fetchMovements',
  async (params: { page?: number; limit?: number; itemId?: string } = {}) => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));
    if (params.itemId) qp.append('itemId', params.itemId);

    const res = await fetch(`${API_BASE_URL}/movements?${qp.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch movements');
    const json = await res.json();
    return { data: json.data as MovementItem[], pagination: json.pagination as Pagination };
  }
);

export const createMovement = createAsyncThunk(
  'movements/createMovement',
  async (payload: { inventory_item_id: string; movement_type: 'in' | 'out' | 'adjustment'; quantity: number; reference_type: string; notes?: string }) => {
    const res = await fetch(`${API_BASE_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create movement');
    const json = await res.json();
    return json.data as MovementItem;
  }
);

const movementsSlice = createSlice({
  name: 'movements',
  initialState,
  reducers: {
    clearMovementsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMovements.fulfilled,
        (state, action: PayloadAction<{ data: MovementItem[]; pagination: Pagination }>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch movements';
      })
      .addCase(createMovement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMovement.fulfilled, (state, action: PayloadAction<MovementItem>) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create movement';
      });
  },
});

export const { clearMovementsError } = movementsSlice.actions;
export default movementsSlice.reducer;
