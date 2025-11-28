import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import categoriesReducer from './slices/categoriesSlice';
import allocationsReducer from './slices/allocationsSlice';
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

export default store;
