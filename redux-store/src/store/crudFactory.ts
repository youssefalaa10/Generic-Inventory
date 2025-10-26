import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from './api';

export type CrudOp = 'list' | 'get' | 'create' | 'update' | 'remove';

export interface CrudState<T = any> {
  byId: Record<string, T>;
  allIds: string[];
  loading: Partial<Record<CrudOp, boolean>>;
  error: Partial<Record<CrudOp, string | null>>;
  lastFetchedAt?: string;
}

export function createCrudSlice<T extends { _id?: string; id?: string | number }>(entity: string) {
  const initialState: CrudState<T> = {
    byId: {},
    allIds: [],
    loading: {},
    error: {},
  };

  const list = createAsyncThunk<T[], { params?: Record<string, any> } | undefined>(
    `${entity}/list`,
    async (arg) => api.list<T[]>(entity, arg?.params)
  );

  const get = createAsyncThunk<T, string>(
    `${entity}/get`,
    async (id) => api.get<T>(entity, id)
  );

  const createOne = createAsyncThunk<T, any>(
    `${entity}/create`,
    async (body) => api.create<T>(entity, body)
  );

  const updateOne = createAsyncThunk<T, { id: string; body: any }>(
    `${entity}/update`,
    async ({ id, body }) => api.update<T>(entity, id, body)
  );

  const removeOne = createAsyncThunk<{ id: string }, string>(
    `${entity}/remove`,
    async (id) => {
      await api.remove(entity, id);
      return { id };
    }
  );

  const slice = createSlice({
    name: entity,
    initialState,
    reducers: {
      reset(state) {
        state.byId = {} as any;
        state.allIds = [] as any;
        state.loading = {};
        state.error = {};
        state.lastFetchedAt = undefined;
      },
    },
    extraReducers: (b) => {
      // list
      b.addCase(list.pending, (s) => { s.loading.list = true; s.error.list = null; });
      b.addCase(list.fulfilled, (s, a: PayloadAction<T[]>) => {
        s.loading.list = false;
        s.error.list = null;
        s.byId = {} as any;
        s.allIds = [] as any;
        a.payload.forEach((doc: any) => {
          const id = String(doc._id || doc.id);
          s.byId[id] = doc;
          s.allIds.push(id);
        });
        s.lastFetchedAt = new Date().toISOString();
      });
      b.addCase(list.rejected, (s, a) => { s.loading.list = false; s.error.list = a.error.message || 'Error'; });

      // get
      b.addCase(get.pending, (s) => { s.loading.get = true; s.error.get = null; });
      b.addCase(get.fulfilled, (s, a: PayloadAction<T>) => {
        s.loading.get = false;
        const doc: any = a.payload;
        const id = String(doc._id || doc.id);
        s.byId[id] = doc;
        if (!s.allIds.includes(id)) s.allIds.push(id);
      });
      b.addCase(get.rejected, (s, a) => { s.loading.get = false; s.error.get = a.error.message || 'Error'; });

      // create
      b.addCase(createOne.pending, (s) => { s.loading.create = true; s.error.create = null; });
      b.addCase(createOne.fulfilled, (s, a: PayloadAction<T>) => {
        s.loading.create = false;
        const doc: any = a.payload;
        const id = String(doc._id || doc.id);
        s.byId[id] = doc;
        if (!s.allIds.includes(id)) s.allIds.push(id);
      });
      b.addCase(createOne.rejected, (s, a) => { s.loading.create = false; s.error.create = a.error.message || 'Error'; });

      // update
      b.addCase(updateOne.pending, (s) => { s.loading.update = true; s.error.update = null; });
      b.addCase(updateOne.fulfilled, (s, a: PayloadAction<T>) => {
        s.loading.update = false;
        const doc: any = a.payload;
        const id = String(doc._id || doc.id);
        s.byId[id] = doc;
        if (!s.allIds.includes(id)) s.allIds.push(id);
      });
      b.addCase(updateOne.rejected, (s, a) => { s.loading.update = false; s.error.update = a.error.message || 'Error'; });

      // remove
      b.addCase(removeOne.pending, (s) => { s.loading.remove = true; s.error.remove = null; });
      b.addCase(removeOne.fulfilled, (s, a) => {
        s.loading.remove = false;
        const id = a.payload.id;
        delete (s.byId as any)[id];
        s.allIds = s.allIds.filter((x) => x !== id);
      });
      b.addCase(removeOne.rejected, (s, a) => { s.loading.remove = false; s.error.remove = a.error.message || 'Error'; });
    },
  });

  const thunks = { list, get, createOne, updateOne, removeOne };
  return { slice, thunks };
}
