/**
 * Simple integration test for API functionality
 */

import {
    getDashboardMetrics,
    getNotifications,
    getUsers,
    getSystemMetrics,
    dashboardCache,
    dashboardWebSocket,
    dashboardPoller,
    initializeDashboard,
    cleanupDashboard,
    requireAdminAuth,
    setAuthToken,
    removeAuthToken
} from '../api';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
    readyState: 1,
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null
}));

describe('API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        dashboardCache.clear();
        localStorageMock.getItem.mockReturnValue('mock-token');
    });

    afterEach(() => {
        cleanupDashboard();
    });

    describe('Basic API Functions', () => {
        test('getDashboardMetrics should return data', async () => {
            const mockData = {
                totalPosts: 42,
                totalPortfolioItems: 18,
                totalProducts: 25,
                totalUsers: 156,
                recentActivity: [],
                systemHealth: {
                    serverHealth: 'healthy' as const,
                    uptime: 99.8,
                    responseTime: 245,
                    errorRate: 0.2,
                    activeUsers: 23,
                    memoryUsage: 68.5,
                    cpuUsage: 34.2
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            } as Response);

            const result = await getDashboardMetrics();
            expect(result).toEqual(mockData);
        });

        test('getNotifications should return data', async () => {
            const mockData = {
                notifications: [],
                unreadCount: 0,
                totalCount: 0
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            } as Response);

            const result = await getNotifications();
            expect(result).toEqual(mockData);
        });

        test('getUsers should return data', async () => {
            const mockData = {
                users: [],
                totalCount: 0,
                currentPage: 1,
                totalPages: 1,
                pageSize: 25
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            } as Response);

            const result = await getUsers();
            expect(result).toEqual(mockData);
        });

        test('getSystemMetrics should return data', async () => {
            const mockData = {
                serverHealth: 'healthy' as const,
                uptime: 99.8,
                responseTime: 245,
                errorRate: 0.2,
                activeUsers: 23,
                memoryUsage: 68.5,
                cpuUsage: 34.2,
                diskUsage: 45.7,
                networkIO: {
                    bytesIn: 1024000,
                    bytesOut: 2048000
                },
                databaseConnections: 12,
                queueSize: 5,
                lastUpdated: new Date().toISOString()
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            } as Response);

            const result = await getSystemMetrics();
            expect(result).toEqual(mockData);
        });
    });

    describe('Authentication', () => {
        test('requireAdminAuth should work with admin user', () => {
            localStorageMock.getItem
                .mockReturnValueOnce('mock-token')
                .mockReturnValueOnce(JSON.stringify({ is_admin: true }));

            const result = requireAdminAuth();
            expect(result).toBe(true);
        });

        test('requireAdminAuth should fail with non-admin user', () => {
            localStorageMock.getItem
                .mockReturnValueOnce('mock-token')
                .mockReturnValueOnce(JSON.stringify({ is_admin: false }));

            const result = requireAdminAuth();
            expect(result).toBe(false);
        });
    });

    describe('Cache Management', () => {
        test('dashboardCache should store and retrieve data', () => {
            const testData = { test: 'data' };
            dashboardCache.set('test_key', testData);

            const retrieved = dashboardCache.get('test_key');
            expect(retrieved).toEqual(testData);
        });

        test('dashboardCache should invalidate patterns', () => {
            dashboardCache.set('notifications_1', { data: 1 });
            dashboardCache.set('notifications_2', { data: 2 });
            dashboardCache.set('other_data', { data: 3 });

            dashboardCache.invalidatePattern('notifications_');

            expect(dashboardCache.get('notifications_1')).toBeNull();
            expect(dashboardCache.get('notifications_2')).toBeNull();
            expect(dashboardCache.get('other_data')).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        test('API functions should handle errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await getDashboardMetrics();
            expect(result).toBeDefined();
            expect(typeof result.totalPosts).toBe('number');
        });

        test('API functions should handle HTTP errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            } as Response);

            const result = await getNotifications();
            expect(result).toBeDefined();
            expect(Array.isArray(result.notifications)).toBe(true);
        });
    });

    describe('Dashboard Initialization', () => {
        test('initializeDashboard should setup WebSocket and polling', () => {
            const connectSpy = jest.spyOn(dashboardWebSocket, 'connect').mockImplementation();
            const pollingSpy = jest.spyOn(dashboardPoller, 'startPolling').mockImplementation();

            initializeDashboard();

            expect(connectSpy).toHaveBeenCalled();
            expect(pollingSpy).toHaveBeenCalled();
        });

        test('cleanupDashboard should cleanup resources', () => {
            const disconnectSpy = jest.spyOn(dashboardWebSocket, 'disconnect').mockImplementation();
            const stopAllSpy = jest.spyOn(dashboardPoller, 'stopAllPolling').mockImplementation();
            const clearSpy = jest.spyOn(dashboardCache, 'clear');

            cleanupDashboard();

            expect(disconnectSpy).toHaveBeenCalled();
            expect(stopAllSpy).toHaveBeenCalled();
            expect(clearSpy).toHaveBeenCalled();
        });
    });
});