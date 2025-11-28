import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionsAPI } from '../../services/api';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionsAPI.create(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await transactionsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
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
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
