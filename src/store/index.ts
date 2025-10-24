import { configureStore } from '@reduxjs/toolkit';
import branchReducer from './slices/branchSlice';
import inventoryReducer from './slices/inventorySlice';
import movementsReducer from './slices/movementsSlice';
import requisitionsReducer from './slices/requisitionsSlice';
import vouchersReducer from './slices/vouchersSlice';
import productsReducer from './slices/productsSlice';
import branchInventoryReducer from './slices/branchInventorySlice';
import posProductsReducer from './slices/posProductsSlice';

export const store = configureStore({
  reducer: {
    branches: branchReducer,
    inventory: inventoryReducer,
    branchInventory: branchInventoryReducer,
    movements: movementsReducer,
    requisitions: requisitionsReducer,
    vouchers: vouchersReducer,
    products: productsReducer,
    posProducts: posProductsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
