import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { habitsAPI, logsAPI } from '../services/api';

export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await habitsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch habits' });
    }
  }
);

export const fetchHabit = createAsyncThunk(
  'habits/fetchHabit',
  async (id, { rejectWithValue }) => {
    try {
      const response = await habitsAPI.getOne(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch habit' });
    }
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const response = await habitsAPI.create(habitData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to create habit' });
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await habitsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to update habit' });
    }
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (id, { rejectWithValue }) => {
    try {
      await habitsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete habit' });
    }
  }
);

export const toggleHabitToday = createAsyncThunk(
  'habits/toggleHabitToday',
  async (id, { rejectWithValue }) => {
    try {
      const response = await habitsAPI.toggleToday(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to toggle habit' });
    }
  }
);

export const fetchHabitLogs = createAsyncThunk(
  'habits/fetchHabitLogs',
  async ({ id, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await habitsAPI.getLogs(id, params);
      return { habitId: id, logs: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch logs' });
    }
  }
);

const habitsSlice = createSlice({
  name: 'habits',
  initialState: {
    habits: [],
    selectedHabit: null,
    logs: {},
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedHabit: (state, action) => {
      state.selectedHabit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch habits';
      })
      .addCase(fetchHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        } else {
          state.habits.push(action.payload);
        }
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.push(action.payload);
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter((h) => h.id !== action.payload);
      })
      .addCase(toggleHabitToday.fulfilled, (state, action) => {
        const index = state.habits.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(fetchHabitLogs.fulfilled, (state, action) => {
        state.logs[action.payload.habitId] = action.payload.logs;
      });
  },
});

export const { setSelectedHabit, clearError } = habitsSlice.actions;
export default habitsSlice.reducer;
