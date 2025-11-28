import { isAxiosError } from 'axios';
import type { ApiError, ApiErrorDetail, ApiFieldError } from '../types/models';

const isApiErrorDetail = (value: unknown): value is ApiErrorDetail =>
  typeof value === 'object' && value !== null;

const normalizeFieldError = (value: ApiFieldError | undefined): string | null => {
  if (!value) return null;
  return Array.isArray(value) ? value.join(', ') : value;
};

export const extractError = (error: unknown): ApiError => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string') {
      return data;
    }
    if (isApiErrorDetail(data)) {
      return data as ApiErrorDetail;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

export const errorToMessage = (error: ApiError): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;

  const prioritizedKeys = ['detail', 'non_field_errors', 'error'];
  for (const key of prioritizedKeys) {
    const message = normalizeFieldError(error[key]);
    if (message) return message;
  }

  const fallback = Object.values(error).find((value) => normalizeFieldError(value as ApiFieldError));
  return normalizeFieldError(fallback as ApiFieldError);
};
