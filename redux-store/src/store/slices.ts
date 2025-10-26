import { createCrudSlice } from './crudFactory';

const entities = [
  'branchinventories',
  'customers',
  'employees',
  'inventory_items',
  'inventoryitems',
  'inventoryrequisitions',
  'inventoryvouchers',
  'manufacturing_orders',
  'productcomponents',
  'products',
  'productvariants',
  'projects',
  'sales',
  'scans',
  'stockmovements',
  'suppliers',
  'supplychains',
  'supplyorders',
  'users',
  'branches',
  'purchaseorders',
  'purchaseinvoices',
  'salesquotations',
  'expenses',
  'financialaccounts',
] as const;

export const slices = Object.fromEntries(
  entities.map((e) => {
    const { slice, thunks } = createCrudSlice<any>(e);
    return [e, { reducer: slice.reducer, actions: slice.actions, thunks }];
  })
) as Record<(typeof entities)[number], { reducer: any; actions: any; thunks: any }>;

export type EntityKey = keyof typeof slices;
