import { configureStore } from '@reduxjs/toolkit';
import { slices } from './slices';

const reducer = Object.fromEntries(
  Object.entries(slices).map(([k, v]) => [k, (v as any).reducer])
);

export const store = configureStore({
  reducer: reducer as any,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
