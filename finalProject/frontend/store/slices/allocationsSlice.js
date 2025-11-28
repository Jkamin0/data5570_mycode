import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { allocationsAPI } from '../../services/api';

export const fetchAllocations = createAsyncThunk(
  'allocations/fetchAllocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await allocationsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAllocation = createAsyncThunk(
  'allocations/createAllocation',
  async (allocationData, { rejectWithValue }) => {
    try {
      const response = await allocationsAPI.create(allocationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const moveMoney = createAsyncThunk(
  'allocations/moveMoney',
  async (moveData, { rejectWithValue }) => {
    try {
      const response = await allocationsAPI.move(moveData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const allocationsSlice = createSlice({
  name: 'allocations',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAllocation.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(moveMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveMoney.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.allocations) {
          state.items = action.payload.allocations;
        }
      })
      .addCase(moveMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = allocationsSlice.actions;
export default allocationsSlice.reducer;
