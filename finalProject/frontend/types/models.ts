export type ApiFieldError = string | string[];

export interface ApiErrorDetail {
  detail?: ApiFieldError;
  non_field_errors?: ApiFieldError;
  error?: ApiFieldError;
  [key: string]: ApiFieldError | undefined;
}

export type ApiError = ApiErrorDetail | string | null;

export interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

export interface Account {
  id: number;
  user: string;
  name: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user: string;
  name: string;
  created_at: string;
}

export interface CategoryBalance {
  category_id: number;
  category_name: string;
  allocated: string;
  spent: string;
  available: string;
}

export interface Allocation {
  id: number;
  category: number;
  category_name: string;
  account: number;
  account_name: string;
  amount: string;
  allocated_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  user: string;
  category: number | null;
  category_name: string | null;
  account: number;
  account_name: string;
  transaction_type: TransactionType;
  amount: string;
  description: string;
  date: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens?: Tokens;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface CreateAccountPayload {
  name: string;
  balance: number | string;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

export interface CreateCategoryPayload {
  name: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface CreateAllocationPayload {
  category: number;
  account: number;
  amount: number | string;
}

export interface MoveMoneyPayload {
  source_category: number;
  target_category: number;
  amount: number | string;
  account: number;
}

export interface MoveMoneyResponse {
  message: string;
  allocation: Allocation;
}

export interface CreateTransactionPayload {
  category: number | null;
  account: number;
  transaction_type: TransactionType;
  amount: number | string;
  description?: string;
}
