import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { categoriesAPI } from '../../services/api';
import type {
  ApiError,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../types/models';
import { extractError } from '../../utils/error';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: ApiError;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: ApiError }>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryPayload,
  { rejectValue: ApiError }
>('categories/createCategory', async (categoryData, { rejectWithValue }) => {
  try {
    const response = await categoriesAPI.create(categoryData);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: number; data: UpdateCategoryPayload },
  { rejectValue: ApiError }
>('categories/updateCategory', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await categoriesAPI.update(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const deleteCategory = createAsyncThunk<number, number, { rejectValue: ApiError }>(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoriesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload ?? null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload ?? null;
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
