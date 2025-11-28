import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './slices/accountsSlice';
import allocationsReducer from './slices/allocationsSlice';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';
import transactionsReducer from './slices/transactionsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    categories: categoriesReducer,
    allocations: allocationsReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
