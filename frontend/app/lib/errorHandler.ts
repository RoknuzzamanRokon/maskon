/**
 * Error handling utilities for the chat system
 * Provides consistent error handling, retry mechanisms, and user-friendly error messages
 */

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  retry_after?: number;
}

export interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

export class ChatError extends Error {
  public code?: string;
  public retryAfter?: number;
  public isRetryable: boolean;

  constructor(message: string, code?: string, retryAfter?: number, isRetryable: boolean = false) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.retryAfter = retryAfter;
    this.isRetryable = isRetryable;
  }
}

export class NetworkError extends ChatError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', undefined, true);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ChatError {
  constructor(message: string, code?: string) {
    super(message, code, undefined, false);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ChatError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', retryAfter, true);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends ChatError {
  constructor(message: string, code?: string) {
    super(message, code, undefined, true);
    this.name = 'ServerError';
  }
}

/**
 * Parse API error response and create appropriate error instance
 */
export function parseApiError(response: Response, data?: any): ChatError {
  const status = response.status;
  
  // Handle structured error responses
  if (data && typeof data === 'object' && data.detail) {
    const detail = data.detail;
    
    if (typeof detail === 'object') {
      const { error, message, code, retry_after } = detail;
      
      switch (status) {
        case 400:
          return new ValidationError(message || error || 'Invalid request', code);
        case 404:
          return new ChatError(message || error || 'Resource not found', code, undefined, false);
        case 429:
          return new RateLimitError(message || error || 'Rate limit exceeded', retry_after);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ServerError(message || error || 'Server error occurred', code);
        default:
          return new ChatError(message || error || 'An error occurred', code, retry_after, status >= 500);
      }
    } else {
      // Handle simple string error responses
      switch (status) {
        case 400:
          return new ValidationError(detail);
        case 404:
          return new ChatError(detail, undefined, undefined, false);
        case 429:
          return new RateLimitError(detail);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ServerError(detail);
        default:
          return new ChatError(detail, undefined, undefined, status >= 500);
      }
    }
  }
  
  // Handle standard HTTP errors
  switch (status) {
    case 400:
      return new ValidationError('Bad request');
    case 401:
      return new ChatError('Unauthorized', 'UNAUTHORIZED', undefined, false);
    case 403:
      return new ChatError('Forbidden', 'FORBIDDEN', undefined, false);
    case 404:
      return new ChatError('Not found', 'NOT_FOUND', undefined, false);
    case 429:
      return new RateLimitError('Too many requests');
    case 500:
      return new ServerError('Internal server error');
    case 502:
      return new ServerError('Bad gateway');
    case 503:
      return new ServerError('Service unavailable');
    case 504:
      return new ServerError('Gateway timeout');
    default:
      if (status >= 500) {
        return new ServerError(`Server error (${status})`);
      } else if (status >= 400) {
        return new ChatError(`Client error (${status})`, undefined, undefined, false);
      } else {
        return new ChatError(`Unexpected response (${status})`, undefined, undefined, true);
      }
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
    onMaxRetriesReached
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's not a retryable error
      if (error instanceof ChatError && !error.isRetryable) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        if (onMaxRetriesReached) {
          onMaxRetriesReached(lastError);
        }
        throw lastError;
      }
      
      // Calculate delay for next retry
      let delay = retryDelay;
      if (exponentialBackoff) {
        delay = retryDelay * Math.pow(2, attempt);
      }
      
      // Use retry_after from rate limit errors
      if (error instanceof RateLimitError && error.retryAfter) {
        delay = error.retryAfter * 1000; // Convert to milliseconds
      }
      
      // Add jitter to prevent thundering herd
      delay += Math.random() * 1000;
      
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Enhanced fetch with error handling and retry logic
 */
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
  retryOptions: ErrorHandlerOptions = {}
): Promise<Response> {
  return withRetry(async () => {
    let response: Response;
    
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (error) {
      // Network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Failed to connect to server');
      }
      throw new NetworkError(error instanceof Error ? error.message : 'Network error');
    }
    
    // Handle non-ok responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // Response doesn't contain JSON
        errorData = null;
      }
      
      throw parseApiError(response, errorData);
    }
    
    return response;
  }, retryOptions);
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (error instanceof RateLimitError) {
    return 'You are sending messages too quickly. Please wait a moment and try again.';
  }
  
  if (error instanceof ServerError) {
    return 'The server is experiencing issues. Please try again in a few moments.';
  }
  
  if (error instanceof ChatError) {
    return error.message;
  }
  
  // Generic error message for unknown errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if an error should trigger a retry
 */
export function shouldRetry(error: Error): boolean {
  if (error instanceof ChatError) {
    return error.isRetryable;
  }
  
  // Retry network errors and unknown errors
  return error instanceof NetworkError || !(error instanceof ChatError);
}

/**
 * Get retry delay from error (for rate limiting)
 */
export function getRetryDelay(error: Error): number | undefined {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }
  return undefined;
}

/**
 * Error boundary helper for React components
 */
export interface ErrorInfo {
  error: Error;
  timestamp: Date;
  context?: string;
  userAgent?: string;
  url?: string;
}

export function createErrorInfo(error: Error, context?: string): ErrorInfo {
  return {
    error,
    timestamp: new Date(),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

/**
 * Log error for debugging and monitoring
 */
export function logError(errorInfo: ErrorInfo): void {
  console.error('Chat Error:', {
    message: errorInfo.error.message,
    name: errorInfo.error.name,
    stack: errorInfo.error.stack,
    timestamp: errorInfo.timestamp.toISOString(),
    context: errorInfo.context,
    userAgent: errorInfo.userAgent,
    url: errorInfo.url,
  });
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or your own logging endpoint
}