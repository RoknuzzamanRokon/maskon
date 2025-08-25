/**
 * React hook for handling errors in chat components
 * Provides consistent error handling, user notifications, and retry mechanisms
 */

import { useState, useCallback, useRef } from 'react';
import { 
  ChatError, 
  NetworkError, 
  ValidationError, 
  RateLimitError, 
  ServerError,
  getUserFriendlyErrorMessage,
  shouldRetry,
  getRetryDelay,
  createErrorInfo,
  logError,
  ErrorInfo
} from '../lib/errorHandler';

export interface ErrorState {
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
  userMessage: string;
  timestamp?: Date;
}

export interface UseErrorHandlerOptions {
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
  context?: string;
}

export interface UseErrorHandlerReturn {
  error: ErrorState;
  handleError: (error: Error) => void;
  clearError: () => void;
  retry: () => Promise<void>;
  withErrorHandling: <T>(operation: () => Promise<T>) => Promise<T | null>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    maxRetries = 3,
    onError,
    onRetry,
    onMaxRetriesReached,
    context
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    canRetry: false,
    userMessage: ''
  });

  const lastOperationRef = useRef<(() => Promise<any>) | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleError = useCallback((error: Error) => {
    const errorInfo = createErrorInfo(error, context);
    logError(errorInfo);

    const canRetry = shouldRetry(error) && errorState.retryCount < maxRetries;
    const userMessage = getUserFriendlyErrorMessage(error);

    setErrorState({
      error,
      isRetrying: false,
      retryCount: errorState.retryCount,
      canRetry,
      userMessage,
      timestamp: new Date()
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }, [context, errorState.retryCount, maxRetries, onError]);

  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      canRetry: false,
      userMessage: ''
    });

    lastOperationRef.current = null;
  }, []);

  const retry = useCallback(async (): Promise<void> => {
    if (!errorState.error || !errorState.canRetry || !lastOperationRef.current) {
      return;
    }

    const newRetryCount = errorState.retryCount + 1;

    if (newRetryCount > maxRetries) {
      if (onMaxRetriesReached) {
        onMaxRetriesReached(errorState.error);
      }
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: newRetryCount
    }));

    if (onRetry) {
      onRetry(newRetryCount, errorState.error);
    }

    // Calculate retry delay
    let delay = 1000 * Math.pow(2, newRetryCount - 1); // Exponential backoff
    const retryDelay = getRetryDelay(errorState.error);
    if (retryDelay) {
      delay = retryDelay;
    }

    // Add jitter to prevent thundering herd
    delay += Math.random() * 1000;

    try {
      // Wait for retry delay
      await new Promise(resolve => {
        retryTimeoutRef.current = setTimeout(resolve, delay);
      });

      // Execute the operation again
      await lastOperationRef.current();
      
      // Success - clear error
      clearError();
    } catch (error) {
      // Retry failed - handle the new error
      handleError(error as Error);
    }
  }, [errorState, maxRetries, onRetry, onMaxRetriesReached, handleError, clearError]);

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    // Store the operation for potential retry
    lastOperationRef.current = operation;

    try {
      // Clear any existing error before starting
      if (errorState.error) {
        clearError();
      }

      const result = await operation();
      return result;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [errorState.error, clearError, handleError]);

  return {
    error: errorState,
    handleError,
    clearError,
    retry,
    withErrorHandling
  };
}

/**
 * Hook for handling specific chat operation errors
 */
export function useChatErrorHandler(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler({
    ...options,
    context: options.context || 'chat'
  });

  const handleMessageSendError = useCallback((error: Error) => {
    if (error instanceof ValidationError) {
      // Don't retry validation errors
      errorHandler.handleError(error);
    } else if (error instanceof RateLimitError) {
      // Handle rate limiting with automatic retry
      errorHandler.handleError(error);
      // Auto-retry after rate limit period
      setTimeout(() => {
        errorHandler.retry();
      }, (error.retryAfter || 60) * 1000);
    } else {
      errorHandler.handleError(error);
    }
  }, [errorHandler]);

  const handleConnectionError = useCallback((error: Error) => {
    if (error instanceof NetworkError) {
      // Auto-retry network errors
      errorHandler.handleError(error);
      setTimeout(() => {
        errorHandler.retry();
      }, 2000);
    } else {
      errorHandler.handleError(error);
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleMessageSendError,
    handleConnectionError
  };
}

/**
 * Hook for displaying error notifications
 */
export function useErrorNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    error: Error;
    message: string;
    timestamp: Date;
    type: 'error' | 'warning' | 'info';
  }>>([]);

  const addNotification = useCallback((error: Error, type: 'error' | 'warning' | 'info' = 'error') => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = getUserFriendlyErrorMessage(error);
    
    setNotifications(prev => [...prev, {
      id,
      error,
      message,
      timestamp: new Date(),
      type
    }]);

    // Auto-remove after 5 seconds for non-critical errors
    if (type !== 'error') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}