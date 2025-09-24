/**
 * Custom hook for managing dashboard data with real-time updates
 * Provides caching, WebSocket integration, and polling fallback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getDashboardMetrics,
    getNotifications,
    getSystemMetrics,
    type DashboardMetrics,
    type NotificationResponse,
    type SystemStatus
} from '../api';

interface UseDashboardDataOptions {
    enableRealTime?: boolean;
    pollingInterval?: number;
    autoRefresh?: boolean;
}

interface DashboardDataState {
    metrics: DashboardMetrics | null;
    notifications: NotificationResponse | null;
    systemMetrics: SystemStatus | null;
    loading: {
        metrics: boolean;
        notifications: boolean;
        systemMetrics: boolean;
    };
    error: {
        metrics: string | null;
        notifications: string | null;
        systemMetrics: string | null;
    };
    lastUpdated: {
        metrics: Date | null;
        notifications: Date | null;
        systemMetrics: Date | null;
    };
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
    const {
        enableRealTime = true,
        pollingInterval = 60000, // 1 minute
        autoRefresh = true
    } = options;

    const [state, setState] = useState<DashboardDataState>({
        metrics: null,
        notifications: null,
        systemMetrics: null,
        loading: {
            metrics: false,
            notifications: false,
            systemMetrics: false
        },
        error: {
            metrics: null,
            notifications: null,
            systemMetrics: null
        },
        lastUpdated: {
            metrics: null,
            notifications: null,
            systemMetrics: null
        }
    });

    const unsubscribeRefs = useRef<(() => void)[]>([]);
    const isInitialized = useRef(false);

    // Update loading state for specific data type
    const setLoading = useCallback((type: keyof DashboardDataState['loading'], loading: boolean) => {
        setState(prev => ({
            ...prev,
            loading: {
                ...prev.loading,
                [type]: loading
            }
        }));
    }, []);

    // Update error state for specific data type
    const setError = useCallback((type: keyof DashboardDataState['error'], error: string | null) => {
        setState(prev => ({
            ...prev,
            error: {
                ...prev.error,
                [type]: error
            }
        }));
    }, []);

    // Update data and timestamp
    const setData = useCallback(<T extends keyof Pick<DashboardDataState, 'metrics' | 'notifications' | 'systemMetrics'>>(
        type: T,
        data: DashboardDataState[T]
    ) => {
        setState(prev => ({
            ...prev,
            [type]: data,
            lastUpdated: {
                ...prev.lastUpdated,
                [type]: new Date()
            }
        }));
    }, []);

    // Fetch dashboard metrics
    const fetchMetrics = useCallback(async () => {
        try {
            setLoading('metrics', true);
            setError('metrics', null);

            const data = await getDashboardMetrics();
            setData('metrics', data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics';
            setError('metrics', errorMessage);
            console.error('Error fetching dashboard metrics:', error);
        } finally {
            setLoading('metrics', false);
        }
    }, [setLoading, setError, setData]);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading('notifications', true);
            setError('notifications', null);

            const data = await getNotifications(20, 0);
            setData('notifications', data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
            setError('notifications', errorMessage);
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading('notifications', false);
        }
    }, [setLoading, setError, setData]);

    // Fetch system metrics
    const fetchSystemMetrics = useCallback(async () => {
        try {
            setLoading('systemMetrics', true);
            setError('systemMetrics', null);

            const data = await getSystemMetrics();
            setData('systemMetrics', data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system metrics';
            setError('systemMetrics', errorMessage);
            console.error('Error fetching system metrics:', error);
        } finally {
            setLoading('systemMetrics', false);
        }
    }, [setLoading, setError, setData]);

    // Refresh all data
    const refreshAll = useCallback(async () => {
        await Promise.all([
            fetchMetrics(),
            fetchNotifications(),
            fetchSystemMetrics()
        ]);
    }, [fetchMetrics, fetchNotifications, fetchSystemMetrics]);

    // Refresh specific data type
    const refresh = useCallback(async (type: 'metrics' | 'notifications' | 'systemMetrics' | 'all') => {
        switch (type) {
            case 'metrics':
                await fetchMetrics();
                break;
            case 'notifications':
                await fetchNotifications();
                break;
            case 'systemMetrics':
                await fetchSystemMetrics();
                break;
            case 'all':
                await refreshAll();
                break;
        }
    }, [fetchMetrics, fetchNotifications, fetchSystemMetrics, refreshAll]);

    // Setup WebSocket listeners (disabled - WebSocket not implemented)
    // useEffect(() => {
    //     // WebSocket functionality would go here
    // }, [enableRealTime, fetchMetrics, fetchNotifications, fetchSystemMetrics]);

    // Setup polling fallback (disabled - polling not implemented)
    // useEffect(() => {
    //     // Polling functionality would go here
    // }, [autoRefresh, pollingInterval, refreshAll]);

    // Initial data fetch
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            refreshAll();
        }
    }, [refreshAll]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cleanup would go here
        };
    }, []);

    // Computed values
    const isLoading = state.loading.metrics || state.loading.notifications || state.loading.systemMetrics;
    const hasError = !!(state.error.metrics || state.error.notifications || state.error.systemMetrics);
    const isConnected = false; // WebSocket not implemented

    return {
        // Data
        metrics: state.metrics,
        notifications: state.notifications,
        systemMetrics: state.systemMetrics,

        // Loading states
        loading: state.loading,
        isLoading,

        // Error states
        error: state.error,
        hasError,

        // Timestamps
        lastUpdated: state.lastUpdated,

        // Connection status
        isConnected,

        // Actions
        refresh,
        refreshAll,
        fetchMetrics,
        fetchNotifications,
        fetchSystemMetrics
    };
}

// Hook for managing notification interactions
export function useNotificationActions() {
    const [loading, setLoading] = useState(false);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            setLoading(true);
            // Import dynamically to avoid circular dependencies
            const { markNotificationAsRead } = await import('../api');
            await markNotificationAsRead(notificationId);

            // Cache invalidation would go here
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            setLoading(true);
            const { markAllNotificationsAsRead } = await import('../api');
            await markAllNotificationsAsRead();

            // Cache invalidation would go here
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            setLoading(true);
            const { deleteNotification: deleteNotificationApi } = await import('../api');
            await deleteNotificationApi(notificationId);

            // Cache invalidation would go here
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAll = useCallback(async () => {
        try {
            setLoading(true);
            const { clearAllNotifications } = await import('../api');
            await clearAllNotifications();

            // Cache invalidation would go here
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    };
}

// Hook for real-time connection status (disabled - WebSocket not implemented)
export function useConnectionStatus() {
    const [isConnected] = useState(false);
    const [connectionId] = useState<string | null>(null);
    const [lastConnected] = useState<Date | null>(null);
    const [reconnectAttempts] = useState(0);

    // WebSocket functionality would be implemented here

    const reconnect = useCallback(() => {
        // Reconnect functionality would be implemented here
    }, []);

    return {
        isConnected,
        connectionId,
        lastConnected,
        reconnectAttempts,
        reconnect
    };
}