"use client";

import { useState, useCallback } from 'react';

interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

interface AsyncOperationResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
    retry: () => Promise<T | null>;
}

export function useAsyncOperation<T>(
    asyncFunction: (...args: any[]) => Promise<T>,
    initialData: T | null = null
): AsyncOperationResult<T> {
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null,
    });

    const [lastArgs, setLastArgs] = useState<any[]>([]);

    const execute = useCallback(
        async (...args: any[]): Promise<T | null> => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            setLastArgs(args);

            try {
                const result = await asyncFunction(...args);
                setState(prev => ({ ...prev, data: result, loading: false }));
                return result;
            } catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                setState(prev => ({ ...prev, error: errorObj, loading: false }));
                return null;
            }
        },
        [asyncFunction]
    );

    const retry = useCallback(async (): Promise<T | null> => {
        return execute(...lastArgs);
    }, [execute, lastArgs]);

    const reset = useCallback(() => {
        setState({
            data: initialData,
            loading: false,
            error: null,
        });
        setLastArgs([]);
    }, [initialData]);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        execute,
        reset,
        retry,
    };
}

// Hook for handling multiple async operations
export function useAsyncOperations() {
    const [operations, setOperations] = useState<Map<string, AsyncState<any>>>(new Map());

    const executeOperation = useCallback(
        async <T>(
            key: string,
            asyncFunction: () => Promise<T>
        ): Promise<T | null> => {
            setOperations(prev => new Map(prev.set(key, {
                data: prev.get(key)?.data || null,
                loading: true,
                error: null,
            })));

            try {
                const result = await asyncFunction();
                setOperations(prev => new Map(prev.set(key, {
                    data: result,
                    loading: false,
                    error: null,
                })));
                return result;
            } catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                setOperations(prev => new Map(prev.set(key, {
                    data: prev.get(key)?.data || null,
                    loading: false,
                    error: errorObj,
                })));
                return null;
            }
        },
        []
    );

    const getOperationState = useCallback(
        (key: string): AsyncState<any> => {
            return operations.get(key) || { data: null, loading: false, error: null };
        },
        [operations]
    );

    const resetOperation = useCallback((key: string) => {
        setOperations(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    }, []);

    const resetAllOperations = useCallback(() => {
        setOperations(new Map());
    }, []);

    return {
        executeOperation,
        getOperationState,
        resetOperation,
        resetAllOperations,
    };
}