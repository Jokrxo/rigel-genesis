/**
 * Error handling utilities
 */

import { PostgrestError } from "@supabase/supabase-js";

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Formats error messages for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // PostgreSQL/Supabase errors
    if ('code' in error && 'message' in error) {
      const pgError = error as PostgrestError;
      return formatPostgresError(pgError);
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Formats PostgreSQL error codes into user-friendly messages
 */
function formatPostgresError(error: PostgrestError): string {
  const errorMap: Record<string, string> = {
    '23505': 'This record already exists.',
    '23503': 'Cannot delete this record as it is referenced by other data.',
    '23502': 'Required field is missing.',
    '42P01': 'Database table not found. Please contact support.',
    'PGRST116': 'No rows found.',
    'PGRST204': 'No content.',
  };

  return errorMap[error.code] || error.message || 'Database error occurred.';
}

/**
 * Logs errors to console in development, sends to monitoring service in production
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  if (import.meta.env.DEV) {
    console.error('Error logged:', errorInfo);
  } else {
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(error, { extra: context });
    console.error('Error:', errorInfo.message);
  }
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorCallback?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name, args });
      if (errorCallback) {
        errorCallback(error);
      } else {
        throw error;
      }
    }
  }) as T;
}

/**
 * Retry failed operations with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('connection')
    );
  }
  return false;
}

/**
 * Checks if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('token')
    );
  }
  return false;
}
