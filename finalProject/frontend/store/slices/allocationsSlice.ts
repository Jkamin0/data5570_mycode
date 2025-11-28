import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { allocationsAPI } from '../../services/api';
import type {
  Allocation,
  ApiError,
  CreateAllocationPayload,
  MoveMoneyPayload,
  MoveMoneyResponse,
} from '../../types/models';
import { extractError } from '../../utils/error';

interface AllocationsState {
  items: Allocation[];
  loading: boolean;
  error: ApiError;
}

const initialState: AllocationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAllocations = createAsyncThunk<
  Allocation[],
  void,
  { rejectValue: ApiError }
>('allocations/fetchAllocations', async (_, { rejectWithValue }) => {
  try {
    const response = await allocationsAPI.getAll();
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const createAllocation = createAsyncThunk<
  Allocation,
  CreateAllocationPayload,
  { rejectValue: ApiError }
>('allocations/createAllocation', async (allocationData, { rejectWithValue }) => {
  try {
    const response = await allocationsAPI.create(allocationData);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const moveMoney = createAsyncThunk<
  MoveMoneyResponse,
  MoveMoneyPayload,
  { rejectValue: ApiError }
>('allocations/moveMoney', async (moveData, { rejectWithValue }) => {
  try {
    const response = await allocationsAPI.move(moveData);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const allocationsSlice = createSlice({
  name: 'allocations',
  initialState,
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
      .addCase(fetchAllocations.fulfilled, (state, action: PayloadAction<Allocation[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(createAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAllocation.fulfilled, (state, action: PayloadAction<Allocation>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(moveMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveMoney.fulfilled, (state, action: PayloadAction<MoveMoneyResponse>) => {
        state.loading = false;
        state.items.push(action.payload.allocation);
      })
      .addCase(moveMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { clearError } = allocationsSlice.actions;
export default allocationsSlice.reducer;
