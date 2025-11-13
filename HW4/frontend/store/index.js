import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import habitsReducer from './habitsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
  },
});
