// Error handling utilities

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Retry mechanism for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Debounce utility for form validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Safe async operation wrapper
export const safeAsync = async <T>(
  operation: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
};

// Form error formatter
export const formatFormErrors = (errors: Record<string, any>): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  Object.keys(errors).forEach(key => {
    if (errors[key]?.message) {
      formattedErrors[key] = errors[key].message;
    }
  });

  return formattedErrors;
};

// Network status checker
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Error boundary helper
export const logError = (error: Error, errorInfo?: any): void => {
  console.error('Application Error:', error);
  if (errorInfo) {
    console.error('Error Info:', errorInfo);
  }

  // In production, you would send this to an error reporting service
  // Example: Sentry, LogRocket, etc.
};

// Validation error helper
export const createValidationError = (field: string, message: string): ValidationError => {
  return new ValidationError(`${field}: ${message}`);
};

// Generic error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UPLOAD_ERROR: 'File upload failed. Please try again.',
  FORM_SUBMISSION_ERROR: 'Failed to submit form. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
} as const;