import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { transactionsAPI } from '../../services/api';
import type { ApiError, CreateTransactionPayload, Transaction } from '../../types/models';
import { extractError } from '../../utils/error';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: ApiError;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk<
  Transaction[],
  void,
  { rejectValue: ApiError }
>('transactions/fetchTransactions', async (_, { rejectWithValue }) => {
  try {
    const response = await transactionsAPI.getAll();
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const createTransaction = createAsyncThunk<
  Transaction,
  CreateTransactionPayload,
  { rejectValue: ApiError }
>('transactions/createTransaction', async (transactionData, { rejectWithValue }) => {
  try {
    const response = await transactionsAPI.create(transactionData);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const deleteTransaction = createAsyncThunk<number, number, { rejectValue: ApiError }>(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await transactionsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
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
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload ?? null;
      });
  },
});

export const { clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
