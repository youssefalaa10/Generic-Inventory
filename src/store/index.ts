import { configureStore } from '@reduxjs/toolkit';
import branchInventoryReducer from './slices/branchInventorySlice';
import branchReducer from './slices/branchSlice';
import customersReducer from './slices/customersSlice';
import inventoryReducer from './slices/inventorySlice';
import movementsReducer from './slices/movementsSlice';
import posProductsReducer from './slices/posProductsSlice';
import productsReducer from './slices/productsSlice';
import requisitionsReducer from './slices/requisitionsSlice';
import suppliesReducer from './slices/suppliesSlice';
import supplyInventoryReducer from './slices/supplyInventorySlice';
import vouchersReducer from './slices/vouchersSlice';

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
    customers: customersReducer,
    supplies: suppliesReducer,
    supplyInventory: supplyInventoryReducer,
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
