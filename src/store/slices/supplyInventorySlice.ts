import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupplyInventory, SupplyMovement } from '../../../types';

interface SupplyInventoryState {
  items: SupplyInventory[];
  movements: SupplyMovement[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplyInventoryState = {
  items: [],
  movements: [],
  loading: false,
  error: null,
};

export const supplyInventorySlice = createSlice({
  name: 'supplyInventory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInventoryItems: (state, action: PayloadAction<SupplyInventory[]>) => {
      state.items = action.payload;
    },
    setMovements: (state, action: PayloadAction<SupplyMovement[]>) => {
      state.movements = action.payload;
    },
    addMovement: (state, action: PayloadAction<SupplyMovement>) => {
      state.movements.push(action.payload);
      
      // Update inventory based on movement type
      const { supplyId, branchId, type, quantity } = action.payload;
      const inventoryIndex = state.items.findIndex(
        item => item.supplyId === supplyId && item.branchId === branchId
      );
      
      if (inventoryIndex === -1) {
        // Create new inventory item if it doesn't exist
        state.items.push({
          supplyId,
          branchId,
          quantity: type === 'IN' ? quantity : -quantity,
          lastMovementDate: action.payload.date
        });
      } else {
        // Update existing inventory
        const currentQuantity = state.items[inventoryIndex].quantity || 0;
        if (type === 'IN') {
          state.items[inventoryIndex].quantity = currentQuantity + quantity;
        } else if (type === 'OUT') {
          state.items[inventoryIndex].quantity = Math.max(0, currentQuantity - quantity);
        }
        state.items[inventoryIndex].lastMovementDate = action.payload.date;
      }
    },
    updateInventoryItem: (state, action: PayloadAction<SupplyInventory>) => {
      const index = state.items.findIndex(
        item => item.supplyId === action.payload.supplyId && item.branchId === action.payload.branchId
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteMovement: (state, action: PayloadAction<number>) => {
      state.movements = state.movements.filter(movement => movement.id !== action.payload);
    }
  },
});

export const { 
  setLoading, 
  setError, 
  setInventoryItems, 
  setMovements,
  addMovement,
  updateInventoryItem,
  deleteMovement
} = supplyInventorySlice.actions;

export default supplyInventorySlice.reducer;

