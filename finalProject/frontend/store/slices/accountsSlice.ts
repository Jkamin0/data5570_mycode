import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { accountsAPI } from '../../services/api';
import type {
  Account,
  ApiError,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../../types/models';
import { extractError } from '../../utils/error';

interface AccountsState {
  items: Account[];
  loading: boolean;
  error: ApiError;
}

const initialState: AccountsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk<Account[], void, { rejectValue: ApiError }>(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

export const createAccount = createAsyncThunk<
  Account,
  CreateAccountPayload,
  { rejectValue: ApiError }
>('accounts/createAccount', async (accountData, { rejectWithValue }) => {
  try {
    const response = await accountsAPI.create(accountData);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateAccount = createAsyncThunk<
  Account,
  { id: number; data: UpdateAccountPayload },
  { rejectValue: ApiError }
>('accounts/updateAccount', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await accountsAPI.update(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const deleteAccount = createAsyncThunk<number, number, { rejectValue: ApiError }>(
  'accounts/deleteAccount',
  async (id, { rejectWithValue }) => {
    try {
      await accountsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(updateAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload ?? null;
      })
      .addCase(deleteAccount.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload ?? null;
      });
  },
});

export const { clearError } = accountsSlice.actions;
export default accountsSlice.reducer;
