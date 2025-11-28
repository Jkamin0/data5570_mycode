import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountsAPI } from '../../services/api';

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await accountsAPI.create(accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await accountsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id, { rejectWithValue }) => {
    try {
      await accountsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
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
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = accountsSlice.actions;
export default accountsSlice.reducer;
