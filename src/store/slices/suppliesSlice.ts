import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Supply } from '../../../types';

interface SuppliesState {
  items: Supply[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliesState = {
  items: [],
  loading: false,
  error: null,
};

export const suppliesSlice = createSlice({
  name: 'supplies',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSupplies: (state, action: PayloadAction<Supply[]>) => {
      state.items = action.payload;
    },
    addSupply: (state, action: PayloadAction<Supply>) => {
      state.items.push(action.payload);
    },
    updateSupply: (state, action: PayloadAction<Supply>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteSupply: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    importSupplies: (state, action: PayloadAction<Supply[]>) => {
      // Merge imported supplies with existing ones, avoiding duplicates by SKU
      const existingSkus = new Set(state.items.map(item => item.sku));
      const newSupplies = action.payload.filter(item => !existingSkus.has(item.sku));
      state.items = [...state.items, ...newSupplies];
    }
  },
});

export const { 
  setLoading, 
  setError, 
  setSupplies, 
  addSupply, 
  updateSupply, 
  deleteSupply,
  importSupplies
} = suppliesSlice.actions;

export default suppliesSlice.reducer;