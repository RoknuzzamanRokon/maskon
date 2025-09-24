"use client";

import React, { useState } from "react";
import {
  ComponentErrorBoundary,
  ErrorFallback,
  InlineError,
  NetworkErrorFallback,
} from "./ErrorBoundary";
import {
  LoadingSpinner,
  InlineLoader,
  MetricCardSkeleton,
  TableSkeleton,
} from "./LoadingStates";
import { OfflineIndicator } from "./OfflineDetector";
import { useAsyncOperation } from "../hooks/useAsyncOperation";

// Mock API functions for demonstration
const mockSuccessfulAPI = async (delay: number = 1000): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return "Data loaded successfully!";
};

const mockFailingAPI = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error("Network request failed");
};

const mockNetworkErrorAPI = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error("Failed to fetch");
};

// Component that throws an error for testing error boundaries
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Component crashed!");
  }
  return (
    <div className="p-4 bg-green-100 rounded">Component working fine!</div>
  );
};

export function ErrorHandlingExample() {
  const [throwError, setThrowError] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Async operation hooks
  const successOperation = useAsyncOperation(mockSuccessfulAPI);
  const failingOperation = useAsyncOperation(mockFailingAPI);
  const networkOperation = useAsyncOperation(mockNetworkErrorAPI);

  return (
    <div className="space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Error Handling & Loading States Demo
        </h2>

        {/* Offline Indicator */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Offline Detection
          </h3>
          <div className="flex items-center space-x-4">
            <OfflineIndicator />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              (Try disconnecting your internet to see the offline indicator)
            </span>
          </div>
        </div>

        {/* Error Boundary Demo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Error Boundary Demo
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => setThrowError(!throwError)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {throwError ? "Fix Component" : "Break Component"}
            </button>

            <ComponentErrorBoundary>
              <ErrorThrowingComponent shouldThrow={throwError} />
            </ComponentErrorBoundary>
          </div>
        </div>

        {/* Loading States Demo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Loading States Demo
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {showSkeleton ? "Hide Skeleton" : "Show Skeleton"}
            </button>

            {showSkeleton && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCardSkeleton />
                <div className="space-y-2">
                  <LoadingSpinner size="sm" />
                  <InlineLoader message="Loading data..." />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Async Operations Demo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Async Operations with Error Handling
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Successful Operation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                Successful API Call
              </h4>
              <button
                onClick={() => successOperation.execute(500)}
                disabled={successOperation.loading}
                className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors mb-2"
              >
                {successOperation.loading ? "Loading..." : "Load Data"}
              </button>

              {successOperation.loading && (
                <InlineLoader message="Fetching..." />
              )}
              {successOperation.data && (
                <div className="text-sm text-green-700 dark:text-green-400">
                  ✓ {successOperation.data}
                </div>
              )}
              {successOperation.error && (
                <InlineError
                  error={successOperation.error}
                  onRetry={successOperation.retry}
                />
              )}
            </div>

            {/* Failing Operation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                Failing API Call
              </h4>
              <button
                onClick={() => failingOperation.execute()}
                disabled={failingOperation.loading}
                className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors mb-2"
              >
                {failingOperation.loading ? "Loading..." : "Trigger Error"}
              </button>

              {failingOperation.loading && (
                <InlineLoader message="Attempting..." />
              )}
              {failingOperation.data && (
                <div className="text-sm text-green-700 dark:text-green-400">
                  ✓ {failingOperation.data}
                </div>
              )}
              {failingOperation.error && (
                <InlineError
                  error={failingOperation.error}
                  onRetry={failingOperation.retry}
                />
              )}
            </div>

            {/* Network Error Operation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                Network Error
              </h4>
              <button
                onClick={() => networkOperation.execute()}
                disabled={networkOperation.loading}
                className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors mb-2"
              >
                {networkOperation.loading ? "Loading..." : "Network Error"}
              </button>

              {networkOperation.loading && (
                <InlineLoader message="Connecting..." />
              )}
              {networkOperation.data && (
                <div className="text-sm text-green-700 dark:text-green-400">
                  ✓ {networkOperation.data}
                </div>
              )}
              {networkOperation.error && (
                <NetworkErrorFallback onRetry={networkOperation.retry} />
              )}
            </div>
          </div>
        </div>

        {/* Error Fallback Components Demo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Error Fallback Components
          </h3>

          <div className="space-y-4">
            <ErrorFallback
              error={new Error("Sample error message")}
              title="Sample Error"
              resetError={() => console.log("Reset clicked")}
            />

            <NetworkErrorFallback
              onRetry={() => console.log("Network retry clicked")}
            />
          </div>
        </div>

        {/* Table Skeleton Demo */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Table Loading Skeleton
          </h3>
          <TableSkeleton rows={3} columns={4} />
        </div>
      </div>
    </div>
  );
}
