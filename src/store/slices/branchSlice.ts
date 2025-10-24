import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Branch } from '../../types';
import { API_BASE_URL } from '../../config/api';

// Async thunks for API calls
export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (params: { page?: number; limit?: number; search?: string; project?: string; status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.project) queryParams.append('project', params.project);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/branches?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }
    return response.json();
  }
);

export const fetchBranchById = createAsyncThunk(
  'branches/fetchBranchById',
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/branches/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch branch');
    }
    return response.json();
  }
);

export const createBranch = createAsyncThunk(
  'branches/createBranch',
  async (branchData: Partial<Branch>) => {
    const response = await fetch(`${API_BASE_URL}/branches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    });
    if (!response.ok) {
      throw new Error('Failed to create branch');
    }
    return response.json();
  }
);

export const updateBranch = createAsyncThunk(
  'branches/updateBranch',
  async ({ id, branchData }: { id: string; branchData: Partial<Branch> }) => {
    const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    });
    if (!response.ok) {
      throw new Error('Failed to update branch');
    }
    return response.json();
  }
);

export const deleteBranch = createAsyncThunk(
  'branches/deleteBranch',
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete branch');
    }
    return { id };
  }
);

export const updateBranchStatus = createAsyncThunk(
  'branches/updateBranchStatus',
  async ({ id, status }: { id: string; status: 'active' | 'inactive' | 'suspended' }) => {
    const response = await fetch(`${API_BASE_URL}/branches/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update branch status');
    }
    return response.json();
  }
);

export const fetchBranchesByProject = createAsyncThunk(
  'branches/fetchBranchesByProject',
  async (project: string) => {
    const response = await fetch(`${API_BASE_URL}/branches/project/${project}`);
    if (!response.ok) {
      throw new Error('Failed to fetch branches by project');
    }
    return response.json();
  }
);

export const fetchActiveBranches = createAsyncThunk(
  'branches/fetchActiveBranches',
  async () => {
    const response = await fetch(`${API_BASE_URL}/branches/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch active branches');
    }
    return response.json();
  }
);

export const searchBranches = createAsyncThunk(
  'branches/searchBranches',
  async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/branches/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search branches');
    }
    return response.json();
  }
);

export const fetchBranchStats = createAsyncThunk(
  'branches/fetchBranchStats',
  async () => {
    const response = await fetch(`${API_BASE_URL}/branches/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch branch statistics');
    }
    return response.json();
  }
);

interface BranchState {
  branches: Branch[];
  currentBranch: Branch | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  stats: {
    totalBranches: number;
    activeBranches: number;
    inactiveBranches: number;
    suspendedBranches: number;
    projectStats: any[];
    businessTypeStats: any[];
  } | null;
}

const initialState: BranchState = {
  branches: [],
  currentBranch: null,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBranch: (state) => {
      state.currentBranch = null;
    },
    setCurrentBranch: (state, action: PayloadAction<Branch>) => {
      state.currentBranch = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch branches
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branches';
      });

    // Fetch branch by ID
    builder
      .addCase(fetchBranchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBranch = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branch';
      });

    // Create branch
    builder
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create branch';
      });

    // Update branch
    builder
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(branch => branch.id === action.payload.data.id);
        if (index !== -1) {
          state.branches[index] = action.payload.data;
        }
        if (state.currentBranch?.id === action.payload.data.id) {
          state.currentBranch = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update branch';
      });

    // Delete branch
    builder
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(branch => branch.id !== action.payload.id);
        if (state.currentBranch?.id === action.payload.id) {
          state.currentBranch = null;
        }
        state.error = null;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete branch';
      });

    // Update branch status
    builder
      .addCase(updateBranchStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranchStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(branch => branch.id === action.payload.data.id);
        if (index !== -1) {
          state.branches[index] = action.payload.data;
        }
        if (state.currentBranch?.id === action.payload.data.id) {
          state.currentBranch = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateBranchStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update branch status';
      });

    // Fetch branches by project
    builder
      .addCase(fetchBranchesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchesByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBranchesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branches by project';
      });

    // Fetch active branches
    builder
      .addCase(fetchActiveBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data;
        state.error = null;
      })
      .addCase(fetchActiveBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch active branches';
      });

    // Search branches
    builder
      .addCase(searchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data;
        state.error = null;
      })
      .addCase(searchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search branches';
      });

    // Fetch branch stats
    builder
      .addCase(fetchBranchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBranchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branch statistics';
      });
  },
});

export const { clearError, clearCurrentBranch, setCurrentBranch } = branchSlice.actions;
export default branchSlice.reducer;
