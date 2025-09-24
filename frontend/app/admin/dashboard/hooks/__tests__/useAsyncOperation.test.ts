import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation, useAsyncOperations } from '../useAsyncOperation';

describe('useAsyncOperation', () => {
    it('initializes with correct default state', () => {
        const mockAsyncFn = jest.fn().mockResolvedValue('test data');
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('initializes with provided initial data', () => {
        const mockAsyncFn = jest.fn().mockResolvedValue('test data');
        const initialData = 'initial';
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn, initialData));

        expect(result.current.data).toBe('initial');
    });

    it('handles successful execution', async () => {
        const mockAsyncFn = jest.fn().mockResolvedValue('success data');
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

        let executeResult: any;
        await act(async () => {
            executeResult = await result.current.execute('arg1', 'arg2');
        });

        expect(mockAsyncFn).toHaveBeenCalledWith('arg1', 'arg2');
        expect(executeResult).toBe('success data');
        expect(result.current.data).toBe('success data');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('handles execution errors', async () => {
        const mockError = new Error('Test error');
        const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

        let executeResult: any;
        await act(async () => {
            executeResult = await result.current.execute();
        });

        expect(executeResult).toBeNull();
        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(mockError);
    });

    it('handles non-Error exceptions', async () => {
        const mockAsyncFn = jest.fn().mockRejectedValue('string error');
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

        await act(async () => {
            await result.current.execute();
        });

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('string error');
    });

    it('sets loading state during execution', async () => {
        let resolvePromise: (value: string) => void;
        const mockAsyncFn = jest.fn(() => new Promise<string>(resolve => {
            resolvePromise = resolve;
        }));

        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

        act(() => {
            result.current.execute();
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();

        await act(async () => {
            resolvePromise!('resolved');
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe('resolved');
    });

    it('retry function works correctly', async () => {
        const mockAsyncFn = jest.fn().mockResolvedValue('retry data');
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn));

        // First execution
        await act(async () => {
            await result.current.execute('original', 'args');
        });

        expect(mockAsyncFn).toHaveBeenCalledWith('original', 'args');

        // Retry should use the same arguments
        await act(async () => {
            await result.current.retry();
        });

        expect(mockAsyncFn).toHaveBeenCalledTimes(2);
        expect(mockAsyncFn).toHaveBeenLastCalledWith('original', 'args');
    });

    it('reset function works correctly', () => {
        const mockAsyncFn = jest.fn().mockResolvedValue('test data');
        const initialData = 'initial';
        const { result } = renderHook(() => useAsyncOperation(mockAsyncFn, initialData));

        act(() => {
            result.current.reset();
        });

        expect(result.current.data).toBe('initial');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });
});

describe('useAsyncOperations', () => {
    it('initializes with empty operations', () => {
        const { result } = renderHook(() => useAsyncOperations());

        const state = result.current.getOperationState('test');
        expect(state.data).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('handles successful operation execution', async () => {
        const { result } = renderHook(() => useAsyncOperations());
        const mockAsyncFn = jest.fn().mockResolvedValue('operation data');

        let executeResult: any;
        await act(async () => {
            executeResult = await result.current.executeOperation('test-op', mockAsyncFn);
        });

        expect(executeResult).toBe('operation data');

        const state = result.current.getOperationState('test-op');
        expect(state.data).toBe('operation data');
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('handles operation execution errors', async () => {
        const { result } = renderHook(() => useAsyncOperations());
        const mockError = new Error('Operation error');
        const mockAsyncFn = jest.fn().mockRejectedValue(mockError);

        let executeResult: any;
        await act(async () => {
            executeResult = await result.current.executeOperation('test-op', mockAsyncFn);
        });

        expect(executeResult).toBeNull();

        const state = result.current.getOperationState('test-op');
        expect(state.data).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBe(mockError);
    });

    it('manages multiple operations independently', async () => {
        const { result } = renderHook(() => useAsyncOperations());
        const mockAsyncFn1 = jest.fn().mockResolvedValue('data1');
        const mockAsyncFn2 = jest.fn().mockResolvedValue('data2');

        await act(async () => {
            await result.current.executeOperation('op1', mockAsyncFn1);
            await result.current.executeOperation('op2', mockAsyncFn2);
        });

        const state1 = result.current.getOperationState('op1');
        const state2 = result.current.getOperationState('op2');

        expect(state1.data).toBe('data1');
        expect(state2.data).toBe('data2');
    });

    it('resets individual operations', async () => {
        const { result } = renderHook(() => useAsyncOperations());
        const mockAsyncFn = jest.fn().mockResolvedValue('data');

        await act(async () => {
            await result.current.executeOperation('test-op', mockAsyncFn);
        });

        let state = result.current.getOperationState('test-op');
        expect(state.data).toBe('data');

        act(() => {
            result.current.resetOperation('test-op');
        });

        state = result.current.getOperationState('test-op');
        expect(state.data).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('resets all operations', async () => {
        const { result } = renderHook(() => useAsyncOperations());
        const mockAsyncFn = jest.fn().mockResolvedValue('data');

        await act(async () => {
            await result.current.executeOperation('op1', mockAsyncFn);
            await result.current.executeOperation('op2', mockAsyncFn);
        });

        act(() => {
            result.current.resetAllOperations();
        });

        const state1 = result.current.getOperationState('op1');
        const state2 = result.current.getOperationState('op2');

        expect(state1.data).toBeNull();
        expect(state2.data).toBeNull();
    });
});