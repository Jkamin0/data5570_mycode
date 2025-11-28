import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';
import type { ApiError, LoginPayload, RegisterPayload, User } from '../../types/models';
import { extractError } from '../../utils/error';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialCheckDone: boolean;
  error: ApiError;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialCheckDone: false,
  error: null,
};

export const registerUser = createAsyncThunk<User, RegisterPayload, { rejectValue: ApiError }>(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: ApiError }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

export const logoutUser = createAsyncThunk<null, void, { rejectValue: ApiError }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return null;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

export const checkAuthStatus = createAsyncThunk<User | null>(
  'auth/checkAuthStatus',
  async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        return null;
      }
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      await authAPI.logout();
      return null;
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.initialCheckDone = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.initialCheckDone = true;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
